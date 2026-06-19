import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const sourceDir = join(projectRoot, 'resources');
const targetDir = join(projectRoot, 'dist-ui', 'resources');

function copyDirectorySync(src, dest) {
    // Crear directorio de destino si no existe
    if (!existsSync(dest)) {
        mkdirSync(dest, { recursive: true });
    }

    // Leer contenido del directorio fuente
    const items = readdirSync(src);

    for (const item of items) {
        const srcPath = join(src, item);
        const destPath = join(dest, item);
        const stat = statSync(srcPath);

        if (stat.isDirectory()) {
            // Recursivamente copiar subdirectorios
            copyDirectorySync(srcPath, destPath);
        } else {
            // Copiar archivo preservando el nombre exacto
            console.log(`Copiando: ${item}`);
            copyFileSync(srcPath, destPath);
        }
    }
}

try {
    console.log('🔄 Sincronizando recursos...');
    console.log(`📁 Origen: ${sourceDir}`);
    console.log(`📁 Destino: ${targetDir}`);
    
    if (!existsSync(sourceDir)) {
        console.error('❌ Error: La carpeta resources no existe');
        process.exit(1);
    }

    copyDirectorySync(sourceDir, targetDir);
    console.log('✅ Recursos sincronizados correctamente');
    
} catch (error) {
    console.error('❌ Error al sincronizar recursos:', error);
    process.exit(1);
}