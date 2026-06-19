import { createWindowOptions, WindowManager } from "./WindowManager";
import { Log } from "@src/utils/log";

const log = new Log("WindowsService", true)
const windowManager = WindowManager.getInstance();


export const createMainWindow = async () => {
    
    const options = {
        name: "MainWindow",
        fullscreen: false,
        frame: true,
        resizable: true,
        showMenuBar: false,
        size: { width: 720, height: 1280 }, // 9:16 aspect ratio
        url: "/"
    } as createWindowOptions

    log.info("Main window created");
    return await windowManager.createWindow(options);
}

export default {
    createMainWindow
};