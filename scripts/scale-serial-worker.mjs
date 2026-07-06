import { SerialPort } from 'serialport';

/**
 * Worker process para lectura de balanza serial
 * Se ejecuta independientemente del main thread de Electron
 * Comunica eventos al parent process vía IPC
 */

const SCALE_KEYWORDS = ['systel', 'komba', 'nexa', 'usb serial', 'wch', 'silabs', 'ftdi', 'prolific'];
const RETRY_AFTER_WACK_MS = 40;
const DEFAULT_WACK_WAIT_MS = 5000;
const DEFAULT_IDLE_WACK_WAIT_MS = 1000;

const ENQ = 0x05;
const ACK = 0x06;
const STX = 0x02;
const ETX = 0x03;
const NACK = 0x15;
const WACK = 0x11;

const calcCrc = (frameWithoutCrc) => {
    let crc = 0x00;
    for (const b of frameWithoutCrc) {
        crc ^= b;
    }
    return crc;
};

const parseWeight = (line) => {
    // Manual Systel: 6 ASCII digits, or 7 chars with '-' sign.
    const match = line.match(/^-?\d{6}$/);
    if (!match) return null;
    const weightInt = parseInt(line, 10);
    if (!Number.isFinite(weightInt)) return null;
    return weightInt / 10; // Convertir de décimas a kg
};

const decodeEscapedChars = (value) => {
    return value
        .replace(/\\x([0-9a-f]{2})/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/\\r/g, '\r')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t');
};

const findPortPath = async () => {
    const ports = await SerialPort.list();
    if (ports.length === 0) return null;

    const keywordMatch = ports.find((port) => {
        const text = `${port.path} ${port.manufacturer ?? ''} ${port.friendlyName ?? ''} ${port.pnpId ?? ''}`.toLowerCase();
        return SCALE_KEYWORDS.some((keyword) => text.includes(keyword));
    });

    return keywordMatch?.path ?? ports[0]?.path ?? null;
};

const init = async (config) => {
    try {
        const portPath = config.port === 'auto' ? await findPortPath() : config.port;
        
        if (!portPath) {
            process.send({ type: 'status', connected: false, reason: 'No serial port detected' });
            return;
        }

        const port = new SerialPort({
            path: portPath,
            baudRate: config.baudRate,
            dataBits: config.dataBits,
            stopBits: config.stopBits,
            parity: config.parity,
            autoOpen: false
        });

        let pending = Buffer.alloc(0);
        let pollIntervalId = null;
        let wackTimerId = null;
        let wackSinceTs = null;
        let wackBusyNotified = false;
        let lastEmittedWeight = null;
        let wackWaitMs = Number(config.wackWaitMs ?? DEFAULT_WACK_WAIT_MS);
        let idleWackWaitMs = Number(config.idleWackWaitMs ?? DEFAULT_IDLE_WACK_WAIT_MS);
        let debouncingTimeMs = Number(config.debouncingTimeMs ?? 0);

        if (!Number.isFinite(wackWaitMs) || wackWaitMs < 0) {
            wackWaitMs = DEFAULT_WACK_WAIT_MS;
        }

        if (!Number.isFinite(idleWackWaitMs) || idleWackWaitMs < 0) {
            idleWackWaitMs = DEFAULT_IDLE_WACK_WAIT_MS;
        }

        if (!Number.isFinite(debouncingTimeMs) || debouncingTimeMs < 0) {
            debouncingTimeMs = 0;
        }

        // Debounce: mientras el peso sigue cambiando (ej. objeto asentándose en la
        // balanza), se pospone el envío al proceso principal. Solo se emite el
        // último valor recibido una vez que pasan `debouncingTimeMs` sin cambios.
        let debounceTimerId = null;
        let pendingEmit = null;

        const clearDebounceTimer = () => {
            if (debounceTimerId) {
                clearTimeout(debounceTimerId);
                debounceTimerId = null;
            }
        };

        const sendWeight = (payload) => {
            process.send({ type: 'weight', ...payload });
            console.log(`[scale-worker] Weight: ${payload.weight.toFixed(3)} kg`);
        };

        const scheduleWeightEmit = (payload) => {
            if (debouncingTimeMs <= 0) {
                sendWeight(payload);
                return;
            }

            pendingEmit = payload;
            clearDebounceTimer();
            debounceTimerId = setTimeout(() => {
                debounceTimerId = null;
                if (pendingEmit) {
                    sendWeight(pendingEmit);
                    pendingEmit = null;
                }
            }, debouncingTimeMs);
        };

        const clearWackTimer = () => {
            if (wackTimerId) {
                clearTimeout(wackTimerId);
                wackTimerId = null;
            }
        };

        const clearWackState = () => {
            wackSinceTs = null;
            wackBusyNotified = false;
            clearWackTimer();
        };

        const notifyBusy = () => {
            if (wackBusyNotified) return;
            wackBusyNotified = true;
            process.send({ type: 'waiting', message: 'Espere...' });
            console.log('[scale-worker] Espere...');
        };

        const shouldTrackWack = () => lastEmittedWeight !== null;

        const startWackTimer = () => {
            if (!shouldTrackWack() || wackTimerId) return;

            wackSinceTs = Date.now();
            const waitThresholdMs = lastEmittedWeight === 0 ? idleWackWaitMs : wackWaitMs;
            wackTimerId = setTimeout(() => {
                if (shouldTrackWack() && wackSinceTs !== null && Date.now() - wackSinceTs >= waitThresholdMs) {
                    notifyBusy();
                }
                wackTimerId = null;
            }, waitThresholdMs);
        };

        port.on('open', () => {
            process.send({
                type: 'status',
                connected: true,
                path: portPath,
                baudRate: config.baudRate
            });
            console.log(`[scale-worker] Port open: ${portPath}`);
        });

        port.on('close', () => {
            process.send({ type: 'status', connected: false, path: portPath });
            console.log(`[scale-worker] Port closed`);
        });

        port.on('error', (error) => {
            process.send({ type: 'status', connected: false, error: error.message });
            console.error(`[scale-worker] Error:`, error.message);
        });

        const sendByte = (value) => {
            if (!port.isOpen) return;
            port.write(Buffer.from([value]), (error) => {
                if (error) console.error(`[scale-worker] Write error:`, error.message);
            });
        };

        const sendEnq = () => sendByte(ENQ);
        const sendAck = () => sendByte(ACK);
        const sendNack = () => sendByte(NACK);

        const startRequest = () => {
            if (shouldTrackWack()) {
                startWackTimer();
            }
        };

        port.on('data', (chunk) => {
            pending = Buffer.concat([pending, chunk]);

            while (pending.length > 0) {
                // WACK can arrive as single-byte flow-control response.
                if (pending[0] === WACK) {
                    startRequest();
                    pending = pending.slice(1);
                    setTimeout(sendEnq, RETRY_AFTER_WACK_MS);
                    continue;
                }

                const stxIdx = pending.indexOf(STX);
                if (stxIdx === -1) {
                    pending = Buffer.alloc(0);
                    break;
                }

                if (stxIdx > 0) {
                    pending = pending.slice(stxIdx);
                }

                const etxIdx = pending.indexOf(ETX, 1);
                if (etxIdx === -1) break;
                if (pending.length <= etxIdx + 1) break;

                const frameWithoutCrc = pending.slice(0, etxIdx + 1);
                const receivedCrc = pending[etxIdx + 1];
                const calculatedCrc = calcCrc(frameWithoutCrc);

                const payloadBytes = pending.slice(1, etxIdx);
                const weightStr = payloadBytes.toString('ascii').trim();
                const weight = parseWeight(weightStr);

                if (receivedCrc !== calculatedCrc || weight === null) {
                    sendNack();
                    pending = pending.slice(etxIdx + 2);
                    continue;
                }

                const returnedFromWack = wackBusyNotified || wackSinceTs !== null;
                clearWackState();
                sendAck();

                const now = Date.now();
                const delta = lastEmittedWeight === null ? Infinity : Math.abs(weight - lastEmittedWeight);

                if (lastEmittedWeight !== null && delta < config.minDelta && !returnedFromWack) {
                    pending = pending.slice(etxIdx + 2);
                    continue;
                }

                if (lastEmittedWeight === null || weight !== lastEmittedWeight || returnedFromWack) {
                    lastEmittedWeight = weight;
                    scheduleWeightEmit({ weight, raw: weightStr, timestamp: now });
                }

                pending = pending.slice(etxIdx + 2);
            }
        });

        await new Promise((resolve, reject) => {
            port.open((error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        // Polling setup
        const pollIntervalMs = config.pollIntervalMs;
        const requestCommand = config.requestCommand;

        if (pollIntervalMs > 0 && requestCommand) {
            const command = decodeEscapedChars(requestCommand);
            const commandBuffer = Buffer.from(command, 'binary');

            const writeRequest = () => {
                if (port.isOpen) {
                    startRequest();
                    port.write(commandBuffer, (error) => {
                        if (error) console.error(`[scale-worker] Write error:`, error.message);
                    });
                }
            };

            // Kick off immediately to reduce first-read latency.
            writeRequest();
            pollIntervalId = setInterval(writeRequest, pollIntervalMs);
            console.log(`[scale-worker] Polling enabled: ${pollIntervalMs}ms`);
        }

        process.on('exit', () => {
            if (pollIntervalId) clearInterval(pollIntervalId);
            clearWackTimer();
            clearDebounceTimer();
            if (port.isOpen) port.close(() => {});
        });
    } catch (error) {
        process.send({ type: 'status', connected: false, error: error.message });
        console.error(`[scale-worker] Fatal error:`, error.message);
        process.exit(1);
    }
};

// Listen for messages from parent
process.on('message', (msg) => {
    if (msg.type === 'init') {
        init(msg.config);
    }
});

console.log('[scale-worker] Ready to initialize');
process.send({ type: 'ready' });
