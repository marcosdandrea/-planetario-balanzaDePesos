import { fork } from 'child_process';
import path from 'path';

const DEFAULT_BAUD_RATE = 9600;
const DEFAULT_POLL_MS = 40;

const args = process.argv.slice(2);
const argPort = args.find((arg) => arg.startsWith('--port='))?.split('=')[1]?.trim();
const argBaud = Number(args.find((arg) => arg.startsWith('--baud='))?.split('=')[1]);
const argPollMs = Number(args.find((arg) => arg.startsWith('--poll-ms='))?.split('=')[1]);
const argQuery = args.find((arg) => arg.startsWith('--request='))?.split('=')[1]?.trim();
const argMinDelta = Number(args.find((arg) => arg.startsWith('--min-delta='))?.split('=')[1]);

const now = () => new Date().toISOString();

const config = {
    port: argPort || process.env.SCALE_SERIAL_PORT || 'auto',
    baudRate: Number.isFinite(argBaud) && argBaud > 0
        ? argBaud
        : Number(process.env.SCALE_SERIAL_BAUD_RATE) || DEFAULT_BAUD_RATE,
    dataBits: Number(process.env.SCALE_SERIAL_DATA_BITS) || 8,
    stopBits: Number(process.env.SCALE_SERIAL_STOP_BITS) || 1,
    parity: process.env.SCALE_SERIAL_PARITY || 'none',
    pollIntervalMs: Number.isFinite(argPollMs) && argPollMs > 0
        ? argPollMs
        : Number(process.env.SCALE_SERIAL_POLL_INTERVAL_MS) || DEFAULT_POLL_MS,
    requestCommand: argQuery || process.env.SCALE_SERIAL_REQUEST_COMMAND || '\\x05',
    minDelta: Number.isFinite(argMinDelta)
        ? argMinDelta
        : Number(process.env.SCALE_SERIAL_MIN_DELTA) || 0
};

const workerPath = path.resolve(process.cwd(), 'scripts', 'scale-serial-worker.mjs');
console.log(`[${now()}] Launching worker: ${workerPath}`);
console.log(`[${now()}] Config: ${JSON.stringify(config)}`);

const worker = fork(workerPath, [], { silent: false });
let weighingActive = false;

worker.on('message', (msg) => {
    if (msg?.type === 'ready') {
        console.log(`[${now()}] Worker ready -> sending init`);
        worker.send({ type: 'init', config });
        return;
    }

    if (msg?.type === 'status') {
        console.log(`[${now()}] STATUS connected=${msg.connected} path=${msg.path ?? 'n/a'} baud=${msg.baudRate ?? 'n/a'} error=${msg.error ?? 'none'}`);
        return;
    }

    if (msg?.type === 'waiting') {
        if (weighingActive) {
            console.log(`[${now()}] ${msg.message ?? 'Espere...'}`);
        }
        return;
    }

    if (msg?.type === 'weight') {
        const weight = Number(msg.weight);
        weighingActive = weight > 0;
        console.log(`[${now()}] WEIGHT ${weight.toFixed(3)} kg raw=${msg.raw}`);
    }
});

worker.on('error', (error) => {
    console.error(`[${now()}] Worker error: ${error.message}`);
});

worker.on('exit', (code, signal) => {
    console.log(`[${now()}] Worker exit code=${code ?? 'null'} signal=${signal ?? 'none'}`);
    process.exit(code ?? 0);
});

process.on('SIGINT', () => {
    console.log(`[${now()}] Stopping worker...`);
    worker.kill();
});
