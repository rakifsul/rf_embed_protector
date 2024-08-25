import { ipcMain, dialog, shell, app } from "electron";
import * as fs from "node:fs";
import * as url from "node:url";
import * as path from "node:path";
import isDev from "electron-is-dev";
import PDFProtector from "./lib/pdf_protector.mjs";
import YTProtector from "./lib/yt_protector.mjs";

// setup is a handler wrapper
export default async function appService(store) {
    //
    ipcMain.handle("store-set", async (event, args) => {
        let ret = await store.set(args.key, args.value);
        return ret;
    });

    //
    ipcMain.handle("store-get", async (event, args) => {
        let ret = await store.get(args.key);
        return ret;
    });

    // untuk dialog box dengan jenis message box.
    ipcMain.handle("dialog-show-message-box", async (event, args) => {
        let ret = await dialog.showMessageBox(args);
        return ret;
    });

    // untuk dialog box dengan jenis open dialog.
    ipcMain.handle("dialog-show-open-dialog", async (event, args) => {
        let ret = await dialog.showOpenDialog(args);
        return ret;
    });

    // untuk dialog box dengan jenis save dialog.
    ipcMain.handle("dialog-show-save-dialog", async (event, args) => {
        let ret = await dialog.showSaveDialog(args);
        return ret;
    });

    //
    ipcMain.handle("check-engines-exist", async (event, args) => {
        let ret;
        const __filename = url.fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const exeDir = isDev ? path.join(__dirname, ".." + path.sep) : path.dirname(app.getPath("exe"));
        const engineDir = path.join(exeDir, "engines");

        if (fs.existsSync(engineDir + path.sep + "nwjs-v0.45.4-win-x64.zip") && fs.existsSync(engineDir + path.sep + "nwjs-v0.45.4-linux-x64.tar.gz")) {
            ret = true;
        } else {
            ret = false;
        }

        return ret;
    });

    // untuk PDF protector build.
    ipcMain.handle("builder-build-pdf-protector", async (event, args) => {
        const __filename = url.fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const exeDir = isDev ? path.join(__dirname, ".." + path.sep) : path.dirname(app.getPath("exe"));
        const engineDir = path.join(exeDir, "engines");

        let pdfProt = new PDFProtector();
        pdfProt.setSourceFolder(engineDir);

        pdfProt.on("pdfp-on-progress", function (value) {
            console.log(value);
            event.sender.send("pdfp-on-progress-reply", value);
        });
        pdfProt.on("pdfp-on-finished", function (value) {
            console.log("pdf build finished");
            const needOpenResult = store.get("settings").afterBuild === "Do Nothing" ? false : true;
            if (needOpenResult) {
                shell.showItemInFolder(value);
            }
        });
        pdfProt.setBuildName(args.buildName);
        pdfProt.setPDFPath(args.pdfFile);
        pdfProt.setProtectionScheme(args.protectionScheme);
        pdfProt.setPassword(args.simplePassword);
        pdfProt.setOutputFolder(args.outputFolder);
        pdfProt.setBuildFor(args.buildFor);
        pdfProt.build();
    });

    // untuk YouTube protector build.
    ipcMain.handle("builder-build-youtube-protector", async (event, args) => {
        const __filename = url.fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const exeDir = isDev ? path.join(__dirname, ".." + path.sep) : path.dirname(app.getPath("exe"));
        const engineDir = path.join(exeDir, "engines");

        let ytProt = new YTProtector();
        ytProt.setSourceFolder(engineDir);

        ytProt.on("ytp-on-progress", function (value) {
            console.log(value);
            event.sender.send("ytp-on-progress-reply", value);
        });
        ytProt.on("ytp-on-finished", function (value) {
            console.log("yt build finished");

            const needOpenResult = store.get("settings").afterBuild === "Do Nothing" ? false : true;
            if (needOpenResult) {
                shell.showItemInFolder(value);
            }
        });
        ytProt.setBuildName(args.buildName);
        ytProt.setURLList(args.urlList);
        ytProt.setProtectionScheme(args.protectionScheme);
        ytProt.setPassword(args.simplePassword);
        ytProt.setOutputFolder(args.outputFolder);
        ytProt.setBuildFor(args.buildFor);
        ytProt.build();
    });
}
