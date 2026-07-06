import { createWindowOptions, WindowManager } from "./WindowManager";
import { Log } from "@src/utils/log";
import { getScreenArg } from "@utils/args";

const log = new Log("WindowsService", true)
const windowManager = WindowManager.getInstance();


export const createMainWindow = async () => {

    const screenArg = getScreenArg();

    const options = {
        name: "MainWindow",
        fullscreen: true,
        frame: false,
        resizable: true,
        showMenuBar: false,
        size: { width: 720, height: 1280 }, // 9:16 aspect ratio
        screen: screenArg || 2,
        url: "/"
    } as createWindowOptions

    log.info(`Main window created${screenArg !== undefined ? ` (requested screen: ${screenArg})` : ''}`);
    return await windowManager.createWindow(options);
}

export default {
    createMainWindow
};