import { spawn } from 'child_process';
import electronPath from 'electron';

delete process.env.ELECTRON_RUN_AS_NODE;
process.env.NODE_ENV = 'development';

const child = spawn(electronPath, ['.'], { stdio: 'inherit', env: process.env });
child.on('exit', (code) => process.exit(code ?? 0));
