const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("preload", {
    nodeVersion: () => process.versions.node,
    chromeVersion: () => process.versions.chrome,
    electronVersion: () => process.versions.electron,
    storeSet: async (key, value) => {
        let result = await ipcRenderer.invoke("store-set", {
            key: key,
            value: value,
        });

        return result;
    },
    storeGet: async (key) => {
        let result = await ipcRenderer.invoke("store-get", {
            key: key,
        });

        return result;
    },
    messageBoxQuestion: async (message) => {
        let result = await ipcRenderer.invoke("dialog-show-message-box", {
            message: message,
            buttons: ["OK", "Cancel"],
        });

        return result;
    },
    messageBoxError: async (message) => {
        let result = await ipcRenderer.invoke("dialog-show-message-box", {
            message: message,
            type: "error",
        });

        return result;
    },
    openFolderDialog: async () => {
        let result = await ipcRenderer.invoke("dialog-show-open-dialog", {
            title: "Open Download Folder",
            properties: ["openDirectory"],
        });

        return result;
    },
    openFileDialog: async () => {
        let result = await ipcRenderer.invoke("dialog-show-open-dialog", {
            properties: ["openFile"],
        });

        return result;
    },
    openFileDialogPDF: async () => {
        let result = await ipcRenderer.invoke("dialog-show-open-dialog", {
            properties: ["openFile"],
            filters: [
                {
                    name: "PDF File",
                    extensions: ["pdf"],
                },
            ],
        });

        return result;
    },
    openFileDialogJSON: async () => {
        let result = await ipcRenderer.invoke("dialog-show-open-dialog", {
            properties: ["openFile"],
            filters: [
                {
                    name: "JSON File",
                    extensions: ["json"],
                },
            ],
        });

        return result;
    },
    openSaveDialogJS: async () => {
        let result = await ipcRenderer.invoke("dialog-show-save-dialog", {
            filters: [
                {
                    name: "JS File",
                    extensions: ["js"],
                },
            ],
        });

        return result;
    },
    openSaveDialogJSON: async () => {
        let result = await ipcRenderer.invoke("dialog-show-save-dialog", {
            filters: [
                {
                    name: "JSON File",
                    extensions: ["json"],
                },
            ],
        });

        return result;
    },
    checkEnginesExist: async () => {
        let result = await ipcRenderer.invoke("check-engines-exist");
        return result;
    },
    buildYTProtector: async (args) => {
        let result = await ipcRenderer.invoke("builder-build-youtube-protector", args);
        return result;
    },
    buildPDFProtector: async (args) => {
        let result = await ipcRenderer.invoke("builder-build-pdf-protector", args);
        return result;
    },
    handleOnMainClose: (callback) => ipcRenderer.on("on-main-close", callback),
    handleOnPDFPProgress: (callback) => ipcRenderer.on("pdfp-on-progress-reply", callback),
    handleOnYTPProgress: (callback) => ipcRenderer.on("ytp-on-progress-reply", callback),
});
