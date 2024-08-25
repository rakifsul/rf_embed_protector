// script ini berfungsi untuk mengkonversi file PDF menjadi file executable.
// bisa untuk Windows dan Linux. saat ini hanya bisa yang 64 bit, 32 bit belum bisa.
// jadi jika Anda lihat 32 bit dalam script ini, abaikan saja.

// begin: import modules.

// const fs = require("node:fs");
import * as fs from "node:fs";

// const path = require("node:path");
import * as path from "node:path";

import * as url from "node:url";

// const EventEmitter = require("events");
import { EventEmitter } from "events";

// const unzipper = require("unzipper");
import * as unzipper from "unzipper";

// const targz = require("node-tar.gz");
import targz from "node-tar.gz";

// const concat = require("concat-files");
import concat from "concat-files";

// const JSZip = require("jszip");
import JSZip from "jszip";

// const JavaScriptObfuscator = require("javascript-obfuscator");
import JavaScriptObfuscator from "javascript-obfuscator";

// end: import modules.

// class constructor.
function PDFProtector() {
    this.buildName = "BuildName";
    this.pdfPath = "";
    this.protectionScheme = "No Protection";
    this.password = "";
    this.buildFor = "Windows x64";
    this.outputFolder = "";
    this.engineDir = ".";
    this.eventEmitter = new EventEmitter();
}

// untuk register event.
PDFProtector.prototype.on = function (channel, handler) {
    this.eventEmitter.on(channel, handler);
};

// untuk menentukan build name, output exe name.
PDFProtector.prototype.setBuildName = function (buildName) {
    this.buildName = buildName;
};

// path file PDF sumber.
PDFProtector.prototype.setPDFPath = function (pdfPath) {
    this.pdfPath = pdfPath;
};

// metode proteksi: Nothing dan Simple Password.
PDFProtector.prototype.setProtectionScheme = function (protectionScheme) {
    this.protectionScheme = protectionScheme;
};

// untuk password.
PDFProtector.prototype.setPassword = function (password) {
    this.password = password;
};

// build target platform.
PDFProtector.prototype.setBuildFor = function (buildFor) {
    this.buildFor = buildFor;
};

// output folder.
PDFProtector.prototype.setOutputFolder = function (outputFolder) {
    this.outputFolder = outputFolder;
};

//
PDFProtector.prototype.setSourceFolder = function (engineDir) {
    this.engineDir = engineDir;
};

//
PDFProtector.prototype.getSourceFolder = function () {
    // const __filename = url.fileURLToPath(import.meta.url);
    // const __dirname = path.dirname(__filename);
    // const exeDir = isDev ? path.join(__dirname, "../.." + path.sep) : path.dirname(app.getPath("exe"));
    // const engineDir = path.join(exeDir, "engines");
    return this.engineDir;
};

//
PDFProtector.prototype.checkEngine = function () {
    let ret;
    const engineDir = this.getSourceFolder();
    if (fs.existsSync(engineDir + path.sep + "nwjs-v0.45.4-win-x64.zip") && fs.existsSync(engineDir + path.sep + "nwjs-v0.45.4-linux-x64.tar.gz")) {
        ret = true;
    } else {
        ret = false;
    }
    return ret;
};

// lakukan build.
PDFProtector.prototype.build = function () {
    // apakah file engine ada?
    if (!this.checkEngine()) {
        console.log("Engine file not found.");
        return;
    }

    // gunakan referensi self = this agar scope nya benar.
    let self = this;
    let title = self.buildName;

    // set progress ke nol.
    self.eventEmitter.emit("pdfp-on-progress", 0);

    // untuk penamaan folder build.
    let tanggalbulantahunjam = new Date();
    let dateString = tanggalbulantahunjam.getFullYear() + "-" + (tanggalbulantahunjam.getMonth() + 1) + "-" + tanggalbulantahunjam.getDate() + "-" + tanggalbulantahunjam.getHours() + "-" + tanggalbulantahunjam.getMinutes() + "-" + tanggalbulantahunjam.getSeconds();

    let outputFolderReal = self.outputFolder + path.sep + dateString;

    // set progress ke 10.
    self.eventEmitter.emit("pdfp-on-progress", 10);

    // buat output folder.
    try {
        fs.mkdirSync(outputFolderReal);
    } catch (err) {
        console.log(err);
        return;
    }

    // set progress ke 20.
    self.eventEmitter.emit("pdfp-on-progress", 20);

    // source adalah nama path engine file.
    // oldPath adalah nama engine sebelum di-rename jadi newPath.
    // newPath adalah nama folder, 1 level di dalam folder build.
    let source;
    let oldPath;
    let newPath;
    if (self.buildFor == "Windows x64") {
        source = self.getSourceFolder() + path.sep + "nwjs-v0.45.4-win-x64.zip";
        oldPath = outputFolderReal + path.sep + "nwjs-v0.45.4-win-x64";
        newPath = outputFolderReal + path.sep + `${title}-win-x64`;
    } else if (self.buildFor == "Windows ia32") {
        source = self.getSourceFolder() + path.sep + "nwjs-v0.45.4-win-ia32.zip";
        oldPath = outputFolderReal + path.sep + "nwjs-v0.45.4-win-ia32";
        newPath = outputFolderReal + path.sep + `${title}-win-ia32`;
    } else if (self.buildFor == "Linux x64") {
        source = self.getSourceFolder() + path.sep + "nwjs-v0.45.4-linux-x64.tar.gz";
        oldPath = outputFolderReal + path.sep + "nwjs-v0.45.4-linux-x64";
        newPath = outputFolderReal + path.sep + `${title}-linux-x64`;
    } else if (self.buildFor == "Linux ia32") {
        source = self.getSourceFolder() + path.sep + "nwjs-v0.45.4-linux-ia32.tar.gz";
        oldPath = outputFolderReal + path.sep + "nwjs-v0.45.4-linux-ia32";
        newPath = outputFolderReal + path.sep + `${title}-linux-ia32`;
    } else {
        console.log("Unknown build target.");
        return;
    }

    // set progress ke 30.
    self.eventEmitter.emit("pdfp-on-progress", 30);

    if (self.buildFor == "Windows x64" || self.buildFor == "Windows ia32") {
        // untuk windows.

        // lakukan unzip terhadap file engine.
        fs.createReadStream(source)
            .pipe(
                unzipper.Extract({
                    path: outputFolderReal,
                })
            )
            .promise()
            .then(() => {
                //rename jadi newPath. lihat komentar sebelumnya.
                try {
                    fs.renameSync(oldPath, newPath);
                    console.log("Successfully renamed the directory.");
                } catch (err) {
                    console.log(err);
                }

                // set progress ke 40.
                self.eventEmitter.emit("pdfp-on-progress", 40);

                // konten HTML yang akan dimasukkan ke dalam executable.
                let htmlContent = `
                <!DOCTYPE html>
                <html lang="en">

                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="X-UA-Compatible" content="ie=edge">
                    <title>${title}</title>
                </head>

                <body>
                    <script src="main.js"></script>
                </body>

                </html>
                `;

                //
                let askPassword;
                if (self.protectionScheme == "No Protection") {
                    // jika tidak diproteksi password.

                    askPassword = `window.location.href = "main.pdf#toolbar=0";`;
                } else if (self.protectionScheme == "Simple Password") {
                    // jika diproteksi password.

                    askPassword = `
                    function askPassword(){
                        let password = prompt("Please enter the password", "");
                        if (password != null) {
                            if(password == "${self.password}"){
                                window.location.href = "main.pdf#toolbar=0";
                            } else {
                                askPassword();
                            }
                        } else {
                            askPassword();
                        }
                    }
                    
                    askPassword();
                    `;
                } else {
                    console.log("Unknown protection scheme.");
                    return;
                }

                // jadikan sumber untuk di-obfuscate.
                let scriptContent = `${askPassword}`;

                // lakukan obfuscate.
                let obfuscationResult = JavaScriptObfuscator.obfuscate(scriptContent, {
                    compact: false,
                    controlFlowFlattening: true,
                });

                // hasil obfuscate.
                let protectedScriptContent = obfuscationResult.getObfuscatedCode();

                // package.json untuk NWJS di dalam executable.
                // jika ingin paham, sebaiknya baca dokumentasi NWJS.
                let packageJSONObj = {
                    name: title,
                    version: "1.0.0",
                    description: `${title} is a protected PDF content.`,
                    main: "main.html",
                    window: {
                        title: title,
                        width: 800,
                        height: 600,
                    },
                };

                // set progress ke 70.
                self.eventEmitter.emit("pdfp-on-progress", 70);

                // nama package.nw. semacam intermediate file sebelum jadi executable.
                let packagePath = newPath + path.sep + "package.nw";

                // lakukan kompresi jadi zip.
                let zip = new JSZip();

                zip.file("main.html", htmlContent);
                zip.file("main.js", protectedScriptContent);
                zip.file("main.pdf", fs.readFileSync(self.pdfPath));
                zip.file("package.json", JSON.stringify(packageJSONObj, null, "\t"));

                zip.generateNodeStream({
                    type: "nodebuffer",
                    streamFiles: true,
                })
                    .pipe(fs.createWriteStream(packagePath))
                    .on("finish", function () {
                        // setelah kompresi selesai.

                        // set progress ke 90.
                        self.eventEmitter.emit("pdfp-on-progress", 90);

                        // sambung file executable bawaan NWJS dengan intermediate file tadi.
                        let nwPath = newPath + path.sep + "nw.exe";
                        let packedPath = newPath + path.sep + `${title}.exe`;
                        concat([nwPath, packagePath], packedPath, function (err) {
                            if (err) {
                                console.log(err);
                            }

                            // delete nw.exe dan package.nw.
                            fs.unlinkSync(nwPath);
                            fs.unlinkSync(packagePath);

                            // selesai.
                            console.log("done");

                            // set progress ke 100.
                            self.eventEmitter.emit("pdfp-on-progress", 100);

                            self.eventEmitter.emit("pdfp-on-finished", packedPath);

                            // load settings.
                            // let settingsObj = Settings.load();
                            // if (settingsObj.afterBuild == "Open Output Folder") {
                            //     // jika pilihan after build adalah membuka output folder.

                            //     // nw.Shell.showItemInFolder(packedPath);
                            //     // buka output folder.
                            //     require("electron").shell.showItemInFolder(packedPath);
                            // }
                        });
                    });
            });
    } else if (self.buildFor == "Linux x64" || self.buildFor == "Linux ia32") {
        // untuk linux. beda karena file engine menggunakan tar.gz dan bukan zip.

        // ekstrak file engine
        targz()
            .extract(source, outputFolderReal)
            .then(function () {
                // console.log('done!');

                // sedikit akal-akalan dengan setTimeout
                // karena berdasarkan pengalaman build tanpa setTimeout
                // bisa selesai sebelum file target tersedia.
                setTimeout(function () {
                    // rename.
                    try {
                        fs.renameSync(oldPath, newPath);
                        console.log("Successfully renamed the directory.");
                    } catch (err) {
                        console.log(err);
                    }

                    // set progress ke 40.
                    self.eventEmitter.emit("pdfp-on-progress", 40);

                    // konten HTML di dalam executable.
                    let htmlContent = `
                    <!DOCTYPE html>
                    <html lang="en">
    
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <meta http-equiv="X-UA-Compatible" content="ie=edge">
                        <title>${title}</title>
                    </head>
    
                    <body>
                        <script src="main.js"></script>
                    </body>
    
                    </html>
                    `;

                    //
                    let askPassword;
                    if (self.protectionScheme == "No Protection") {
                        // jika tidak diproteksi password.

                        askPassword = `window.location.href = "main.pdf#toolbar=0";`;
                    } else if (self.protectionScheme == "Simple Password") {
                        // jika diproteksi password.

                        askPassword = `
                        function askPassword(){
                            let password = prompt("Please enter the password", "");
                            if (password != null) {
                                if(password == "${self.password}"){
                                    window.location.href = "main.pdf#toolbar=0";
                                } else {
                                    askPassword();
                                }
                            } else {
                                askPassword();
                            }
                        }
                        
                        askPassword();
                        `;
                    } else {
                        console.log("Unknown protection scheme.");
                        return;
                    }

                    // jadikan sumber untuk di-obfuscate.
                    let scriptContent = `${askPassword}`;

                    // obfuscate.
                    let obfuscationResult = JavaScriptObfuscator.obfuscate(scriptContent, {
                        compact: false,
                        controlFlowFlattening: true,
                    });

                    // hasilnya.
                    let protectedScriptContent = obfuscationResult.getObfuscatedCode();

                    // package.json untuk NWJS.
                    let packageJSONObj = {
                        name: title,
                        version: "1.0.0",
                        description: `${title} is a protected PDF content.`,
                        main: "main.html",
                        window: {
                            title: title,
                            width: 800,
                            height: 600,
                        },
                    };

                    // set progress ke 70.
                    self.eventEmitter.emit("pdfp-on-progress", 70);

                    // file intermediate.
                    let packagePath = newPath + path.sep + "package.nw";

                    // kompresi ke zip.
                    let zip = new JSZip();

                    zip.file("main.html", htmlContent);
                    zip.file("main.js", protectedScriptContent);
                    zip.file("main.pdf", fs.readFileSync(self.pdfPath));
                    zip.file("package.json", JSON.stringify(packageJSONObj, null, "\t"));

                    zip.generateNodeStream({
                        type: "nodebuffer",
                        streamFiles: true,
                    })
                        .pipe(fs.createWriteStream(packagePath))
                        .on("finish", function () {
                            // setelah kompresi selesai.

                            // set progress ke 90.
                            self.eventEmitter.emit("pdfp-on-progress", 90);

                            // di linux, nw.exe adalah nw saja.
                            let nwPath = newPath + path.sep + "nw";

                            // maka di linux, nama executable juga tidak pakai .exe.
                            let packedPath = newPath + path.sep + `${title}`;

                            // sambung executable dengan intermediate file.
                            concat([nwPath, packagePath], packedPath, function (err) {
                                if (err) {
                                    console.log(err);
                                    alert(err);
                                }

                                // hapus.
                                fs.unlinkSync(nwPath);
                                fs.unlinkSync(packagePath);

                                // selesai.
                                console.log("done");

                                // set progress ke 100.
                                self.eventEmitter.emit("pdfp-on-progress", 100);

                                self.eventEmitter.emit("pdfp-on-finished", packedPath);

                                // load settings.
                                // let settingsObj = Settings.load();
                                // if (settingsObj.afterBuild == "Open Output Folder") {
                                //     // jika pilihan after build adalah membuka output folder.

                                //     // nw.Shell.showItemInFolder(packedPath);
                                //     // buka output folder.
                                //     require("electron").shell.showItemInFolder(packedPath);
                                // }
                            });
                        });
                }, 10000);
            });
    }
};

// export class PDFProtector.
export default PDFProtector;