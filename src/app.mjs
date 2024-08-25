import { app, BrowserWindow } from "electron";
import * as path from "node:path";
import * as url from "node:url";
import isDev from "electron-is-dev";
import Store from "electron-store";
import appMenu from "./app_menu.mjs";
import appContextMenu from "./app_context_menu.mjs";
import appService from "./app_service.mjs";

export default async function theApp() {
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // init user data
    const exeDir = isDev ? path.join(__dirname, ".." + path.sep) : path.dirname(app.getPath("exe"));
    app.setPath("userData", path.join(exeDir, "data"));
    console.log(app.getPath("userData"));
    const store = new Store();

    // declare global vars
    let mainWindow;

    // create base window
    const createWindow = async () => {
        mainWindow = new BrowserWindow({
            title: `RF Embed Protector - ${isDev ? "Development" : "Production"}`,
            width: 800,
            height: 600,
            minWidth: 800,
            minHeight: 600,
            show: false,
            webPreferences: {
                preload: path.join(__dirname, "page" + path.sep + "window_main" + path.sep + "preload.js"),
            },
        });

        // restore base window
        restoreBaseWindow();

        // don't change the title if updated, keep it same as base window parameter
        mainWindow.on("page-title-updated", function (e) {
            e.preventDefault();
        });

        //
        mainWindow.on("close", () => {
            store.set("bounds", mainWindow.getBounds());
            store.set("isMaximized", mainWindow.isMaximized());

            mainWindow.webContents.send("on-main-close");
        });

        //
        mainWindow.once("ready-to-show", () => {
            mainWindow.show();
        });

        //
        mainWindow.loadFile(path.join(__dirname, "page" + path.sep + "window_main" + path.sep + "renderer.html"));

        // set system menu
        await appMenu();

        // set context menu
        await appContextMenu(mainWindow.webContents);

        // init all services
        await appService(store);
    };

    // for restoring window to the previous state
    const restoreBaseWindow = () => {
        //
        const isInit = store.get("isMaximized") === undefined || null;
        if (isInit) {
            store.set("bounds", mainWindow.getBounds());
            store.set("isMaximized", mainWindow.isMaximized());
        }

        //
        const maxed = store.get("isMaximized");
        if (maxed) {
            mainWindow.maximize();
        }
        mainWindow.setBounds(store.get("bounds"));
    };

    app.whenReady().then(() => {
        createWindow();

        app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                // createWindow();
            }
        });
    });

    // on all window closed, quit app unless it's running on Mac
    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            app.quit();
        }
    });
}
