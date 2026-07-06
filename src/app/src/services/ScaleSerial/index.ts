// @ts-nocheck
import type { Server as SocketIoServer } from 'socket.io';
import { fork } from 'child_process';
import path from 'path';
import { env } from '@utils/envLoader.js';
import { Log } from '@utils/log.js';

const log = new Log('scale-serial', true);

type InitParams = {
    io: SocketIoServer;
};

type WorkerMessage = {
    type: 'ready' | 'status' | 'waiting' | 'weight';
    connected?: boolean;
    path?: string;
    baudRate?: number;
    error?: string;
    reason?: string;
    weight?: number;
    timestamp?: number;
    raw?: string;
    message?: string;
};

const init = async ({ io }: InitParams) => {
    if (!env.SCALE_SERIAL_ENABLED) {
        log.info('Scale serial service is disabled by SCALE_SERIAL_ENABLED=false');
        return;
    }

    try {
        // El worker se bundlea junto a main.js (ver scripts/build-electron.mjs y
        // scripts/build-headless.mjs), así que vive siempre al lado del archivo
        // compilado actual, tanto en desarrollo como empaquetado.
        const workerPath = path.join(__dirname, 'scale-serial-worker.js');
        
        log.info(`Forking scale worker: ${workerPath}`);
        
        const worker: any = fork(workerPath, [], { silent: false });

        // Escuchar eventos del worker
        const handleWorkerMessage = (message: any) => {

            if (message.type === 'ready') {
                log.info('Scale worker process ready');
                
                // Enviar configuración al worker
                worker.send({
                    type: 'init',
                    config: {
                        port: env.SCALE_SERIAL_PORT,
                        baudRate: env.SCALE_SERIAL_BAUD_RATE,
                        dataBits: env.SCALE_SERIAL_DATA_BITS,
                        stopBits: env.SCALE_SERIAL_STOP_BITS,
                        parity: env.SCALE_SERIAL_PARITY,
                        pollIntervalMs: env.SCALE_SERIAL_POLL_INTERVAL_MS,
                        requestCommand: env.SCALE_SERIAL_REQUEST_COMMAND,
                        minDelta: env.SCALE_SERIAL_MIN_DELTA,
                        wackWaitMs: env.SCALE_SERIAL_WACK_WAIT_MS,
                        idleWackWaitMs: env.SCALE_SERIAL_IDLE_WACK_WAIT_MS,
                        debouncingTimeMs: env.SCALE_DEBOUNCING_TIME_MS
                    }
                });
            } else if (message.type === 'status') {
                log.info(`Scale status: connected=${message.connected}`);
                if (message.path) log.info(`  Path: ${message.path}`);
                if (message.baudRate) log.info(`  Baud rate: ${message.baudRate}`);
                if (message.error) log.error(`  Error: ${message.error}`);
                
                io.emit('scale-status', message);
            } else if (message.type === 'waiting') {
                io.emit('scale-waiting', message);
                io.emit('waiting', message);
            } else if (message.type === 'weight') {
                io.emit('scale-data', {
                    weight: message.weight,
                    source: 'serial',
                    timestamp: message.timestamp
                });
            }
        };

        worker.on('message', handleWorkerMessage);

        worker.on('error', (error) => {
            log.error('Scale worker error:', error);
            io.emit('scale-status', { connected: false, error: error.message });
        });

        worker.on('exit', (code) => {
            log.warn(`Scale worker exited with code ${code}`);
            io.emit('scale-status', { connected: false, reason: 'Worker exited' });
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log.error('Failed to initialize scale serial service:', message);
        io.emit('scale-status', { connected: false, error: message });
    }
};

export { init };
