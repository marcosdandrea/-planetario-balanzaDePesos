import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Copy prebuilt binaries for serialport so electron-rebuild doesn't try to compile
const prebuildsSource = path.join(projectRoot, 'node_modules', '@serialport', 'bindings-cpp', 'prebuilds', 'win32-x64');
const prebuildsTarget = path.join(projectRoot, 'node_modules', '@serialport', 'bindings-cpp', 'build', 'Release');

if (fs.existsSync(prebuildsSource)) {
    console.log(`[prepare-native] Found prebuilds at ${prebuildsSource}`);

    // Create target directory
    fs.mkdirSync(prebuildsTarget, { recursive: true });

    // Copy prebuilt binary
    const prebuiltFile = path.join(prebuildsSource, 'bindings.node');
    if (fs.existsSync(prebuiltFile)) {
        const targetFile = path.join(prebuildsTarget, 'bindings.node');
        fs.copyFileSync(prebuiltFile, targetFile);
        console.log(`[prepare-native] ✓ Copied prebuilt bindings.node`);
    }
} else {
    console.log(`[prepare-native] Prebuilds not found at ${prebuildsSource}, will rely on prebuilds.json`);
}
