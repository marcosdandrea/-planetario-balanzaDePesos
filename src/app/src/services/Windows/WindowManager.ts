import crypto from "crypto";
import path from "path";
import { BrowserWindow, screen } from "electron";
import { Log } from "@utils/log.js";
import { env } from "@utils/envLoader.js";

const log = new Log("windowManager", true);

export interface createWindowOptions {
    name: string;
    size?: { width: number; height: number };
    position?: { x: number; y: number };
    fullscreen?: boolean;
    frame?: boolean;
    resizable?: boolean;
    showMenuBar?: boolean;
    // Pantalla en la que se debe abrir la ventana (1 = primera pantalla).
    // Si no se especifica o es inválido para la cantidad de pantallas
    // disponibles, se usa la primera por defecto.
    screen?: number;
    url: string;
}

export class WindowManager {
    private static instance: WindowManager;
    windows: Map<string, BrowserWindow>;

    constructor() {
        this.windows = new Map<string, BrowserWindow>();

        if (WindowManager.instance) {
            return WindowManager.instance;
        }

        WindowManager.instance = this;
    }


    static getInstance(): WindowManager {
        if (!WindowManager.instance) {
            WindowManager.instance = new WindowManager();
        }
        return WindowManager.instance;
    }

    private getPreloadPath(): string {
        // En desarrollo, el preload está en dist-electron
        // En producción empaquetada, está en el mismo directorio que main.js
        const isDev = env.NODE_ENV === 'development';

        if (isDev) {
            // Desarrollo: preload está en dist-electron junto con main.js
            return path.join(__dirname, 'preload.js');
        } else {
            // Producción: preload está empaquetado en el asar junto con main.js
            return path.join(__dirname, 'preload.js');
        }
    }

    private getTargetDisplay(screenNumber?: number) {
        const displays = screen.getAllDisplays();

        if (screenNumber !== undefined) {
            const targetIndex = screenNumber - 1;
            if (targetIndex >= 0 && targetIndex < displays.length) {
                return displays[targetIndex];
            }
            log.warn(`Screen ${screenNumber} is not valid (${displays.length} available). Using the first screen.`);
        }

        return displays[0];
    }

    createWindow(options: createWindowOptions): Promise<BrowserWindow> {
        return new Promise(async (resolve, reject) => {
            try {
                const { name } = options
                const id = crypto.randomUUID();
                const width = options.size?.width || 800;
                const height = options.size?.height || 600;
                const targetDisplay = this.getTargetDisplay(options.screen);
                const x = options.position?.x ?? Math.round(targetDisplay.bounds.x + (targetDisplay.bounds.width - width) / 2);
                const y = options.position?.y ?? Math.round(targetDisplay.bounds.y + (targetDisplay.bounds.height - height) / 2);

                const window = new BrowserWindow({
                    show: false,
                    width,
                    height,
                    x,
                    y,
                    frame: options.frame !== undefined ? options.frame : true,
                    resizable: options.resizable !== undefined ? options.resizable : true,
                    webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true,
                        preload: this.getPreloadPath(),
                        webSecurity: true,
                        sandbox: false // Necesario para que el preload funcione
                    }
                });
                this.windows.set(id, window);

                if (options.showMenuBar !== undefined) {
                    window.setMenuBarVisibility(options.showMenuBar);
                }

                if (!options.url.startsWith('/')) {
                    log.error(`Invalid URL for window ${name && id}: ${options.url}`);
                    reject(new Error(`Invalid URL: ${options.url}`));
                    return;
                }

                const IS_DEV = env.NODE_ENV === "development";
                const MAIN_SERVER_PORT = env.MAIN_SERVER_PORT;
                const VITE_PORT = 5123; // El puerto de Vite no está en env, usar valor por defecto

                const baseUrl = "http://localhost:"
                let port = IS_DEV ? VITE_PORT : MAIN_SERVER_PORT;
                let url = `${baseUrl}${port}${options.url}`;
                
                window.loadURL(url);

                window.on('closed', () => {
                    log.info(`Window ${name && id} closed`);
                    this.windows.delete(id);
                });

                window.once('ready-to-show', () => {
                    if (options.fullscreen) {
                        window.setFullScreen(true);
                    }
                    window.show();

                    if (IS_DEV) {
                        //window.webContents.openDevTools();
                    }
                });

                resolve(window);
            } catch (e) {
                reject(e);
            }
        });
    }

    getWindow(id: string): BrowserWindow | undefined {
        const win = this.windows.get(id);
        if (!win) {
            throw new Error(`Window with id ${id} does not exist.`);
        }
        return win;
    }

    closeWindow(id: string): void {
        const window = this.windows.get(id);
        if (window) {
            window.close();
            this.windows.delete(id);
        } else {
            throw new Error(`Window with id ${id} does not exist.`);
        }
    }

    closeAllWindows(): void {
        this.windows.forEach((window) => {
            window.close();
        });
        this.windows.clear();
    }


}