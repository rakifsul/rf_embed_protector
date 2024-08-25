// script ini berfungsi untuk mengkonversi YouTube embed menjadi file executable.
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

// class constructor
function YTProtector() {
    this.buildName = "BuildName";
    this.urlList = [];
    this.protectionScheme = "No Protection";
    this.password = "";
    this.buildFor = "Windows x64";
    this.outputFolder = "";
    this.engineDir = ".";
    this.eventEmitter = new EventEmitter();
}

// untuk register event
YTProtector.prototype.on = function (channel, handler) {
    this.eventEmitter.on(channel, handler);
};

// untuk menentukan build name, output exe name
YTProtector.prototype.setBuildName = function (buildName) {
    this.buildName = buildName;
};

// sumber URL YouTube
YTProtector.prototype.addURL = function (url) {
    this.urlList.push(url);
};

// sumber URL YouTube sebagai array
YTProtector.prototype.setURLList = function (urlList) {
    this.urlList = urlList;
};

// bersihkan URL
YTProtector.prototype.clearURL = function () {
    this.urlList = [];
};

// metode proteksi: Nothing dan Simple Password.
YTProtector.prototype.setProtectionScheme = function (protectionScheme) {
    this.protectionScheme = protectionScheme;
};

// untuk password.
YTProtector.prototype.setPassword = function (password) {
    this.password = password;
};

// build target platform.
YTProtector.prototype.setBuildFor = function (buildFor) {
    this.buildFor = buildFor;
};

// output folder
YTProtector.prototype.setOutputFolder = function (outputFolder) {
    this.outputFolder = outputFolder;
};

// untuk parse id YouTube video.
YTProtector.prototype.parseYoutubeID = function (url) {
    return url.split("v=").pop();
};

YTProtector.prototype.setSourceFolder = function (engineDir) {
    this.engineDir = engineDir;
};

//
YTProtector.prototype.getSourceFolder = function () {
    // const __filename = url.fileURLToPath(import.meta.url);
    // const __dirname = path.dirname(__filename);
    // const exeDir = isDev ? path.join(__dirname, "../.." + path.sep) : path.dirname(app.getPath("exe"));
    // const engineDir = path.join(exeDir, "engines");
    return this.engineDir;
};

//
YTProtector.prototype.checkEngine = function () {
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
YTProtector.prototype.build = function () {
    // apakah file engine ada?
    if (!this.checkEngine()) {
        console.log("Engine file not found.");
        return;
    }

    // gunakan referensi self = this agar scope nya benar.
    let self = this;
    let title = self.buildName;

    // set progress ke nol.
    self.eventEmitter.emit("ytp-on-progress", 0);

    // buat array dari id video.
    let videoIDS = [];
    self.urlList.forEach((item) => {
        let prs = self.parseYoutubeID(item);
        if (prs) {
            videoIDS.push(prs);
        }
    });

    // untuk penamaan folder build.
    let tanggalbulantahunjam = new Date();
    let dateString = tanggalbulantahunjam.getFullYear() + "-" + (tanggalbulantahunjam.getMonth() + 1) + "-" + tanggalbulantahunjam.getDate() + "-" + tanggalbulantahunjam.getHours() + "-" + tanggalbulantahunjam.getMinutes() + "-" + tanggalbulantahunjam.getSeconds();

    let outputFolderReal = self.outputFolder + path.sep + dateString;

    // set progress ke 10.
    self.eventEmitter.emit("ytp-on-progress", 10);

    // buat output folder.
    try {
        fs.mkdirSync(outputFolderReal);
    } catch (err) {
        console.log(err);
        return;
    }

    // set progress ke 20.
    self.eventEmitter.emit("ytp-on-progress", 20);

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
    self.eventEmitter.emit("ytp-on-progress", 30);

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
                self.eventEmitter.emit("ytp-on-progress", 40);

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
                    <h1>${title}</h1>
                    <div id="iframe-placeholder"></div>
                    <script src="main.js"></script>
                </body>
                </html>
                `;

                // buat elemen untuk meng-embed video YouTube.
                let youtubeEmbedElements = "";
                videoIDS.forEach((item) => {
                    youtubeEmbedElements += `
                    <h3 class="myTitle" align="center"></h3>
                    <p align="center">
                        <iframe 
                        class="myFrames" 
                        onload="onMyFrameLoad(this)" 
                        width="560" 
                        height="315" 
                        src="https://www.youtube.com/embed/${item}?modestbranding=1&mode=opaque&amp;rel=0&amp;autohide=1&amp;showinfo=0&amp;wmode=transparent" 
                        frameborder="0" 
                        allowfullscreen>
                        </iframe>
                    </p>`;
                });

                //
                let askPassword;
                if (self.protectionScheme == "No Protection") {
                    // jika tidak diproteksi password.

                    askPassword = "";
                } else if (self.protectionScheme == "Simple Password") {
                    // jika diproteksi password.

                    askPassword = `
                    function askPassword(){
                        let password = prompt("Please enter the password", "");
                        if (password != null) {
                            if(password == "${self.password}"){
                                return;
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

                // untuk me-list video.
                //a[class="ytp-title-link yt-uix-sessionlink"]
                let scriptContent = `
                nw.Window.get().on('new-win-policy', function (frame, url, policy) {
                    policy.ignore();
                });

                let iframePlaceholder = document.getElementById("iframe-placeholder");
                iframePlaceholder.innerHTML += \`${youtubeEmbedElements}\`;

                setInterval(function(){
                    const clipboard = nw.Clipboard.get();
                    clipboard.clear();
                }, 200);
                
                function onMyFrameLoad() {
                    let titles = [];
                    setTimeout(function(){
                        let iframes = document.getElementsByClassName("myFrames");
                        for(iframe of iframes){
                            let elmnts = iframe.contentWindow.document.querySelectorAll('div[class="ytp-chrome-top ytp-show-cards-title"]');
                            for(let elmnt of elmnts){
                                elmnt.style.display = "none";
                            } 

                            let ttl = iframe.contentWindow.document.querySelectorAll('a[class="ytp-title-link yt-uix-sessionlink"]')[0].innerHTML;
                            titles.push(ttl);
                        }

                        let ctr = 0;
                        let titlePlaceholders = document.getElementsByClassName("myTitle");
                        for(let titlePlaceholder of titlePlaceholders){
                            titlePlaceholder.innerHTML = titles[ctr];
                            ++ctr;
                        } 
                    }, 1000);
                };
                
                ${askPassword}
                `;

                // obfuscate konten.
                let obfuscationResult = JavaScriptObfuscator.obfuscate(scriptContent, {
                    compact: false,
                    controlFlowFlattening: true,
                });

                // hasilnya.
                let protectedScriptContent = obfuscationResult.getObfuscatedCode();

                // package.json untuk NWJS di dalam executable.
                // jika ingin paham, sebaiknya baca dokumentasi NWJS.
                let packageJSONObj = {
                    name: title,
                    version: "1.0.0",
                    description: `${title} is a protected Youtube content.`,
                    main: "main.html",
                    window: {
                        title: title,
                        width: 800,
                        height: 600,
                    },
                };

                // set progress ke 70.
                self.eventEmitter.emit("ytp-on-progress", 70);

                // nama package.nw. semacam intermediate file sebelum jadi executable.
                let packagePath = newPath + path.sep + "package.nw";

                // lakukan kompresi jadi zip.
                let zip = new JSZip();

                zip.file("main.html", htmlContent);
                zip.file("main.js", protectedScriptContent);
                zip.file("package.json", JSON.stringify(packageJSONObj, null, "\t"));

                zip.generateNodeStream({
                    type: "nodebuffer",
                    streamFiles: true,
                })
                    .pipe(fs.createWriteStream(packagePath))
                    .on("finish", function () {
                        // setelah kompresi selesai.

                        // set progress ke 90.
                        self.eventEmitter.emit("ytp-on-progress", 90);

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
                            self.eventEmitter.emit("ytp-on-progress", 100);

                            self.eventEmitter.emit("ytp-on-finished", packedPath);

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
                    self.eventEmitter.emit("ytp-on-progress", 40);

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
                        <h1>${title}</h1>
                        <div id="iframe-placeholder"></div>
                        <script src="main.js"></script>
                    </body>
                    </html>
                    `;

                    // buat elemen untuk meng-embed video YouTube.
                    let youtubeEmbedElements = "";
                    videoIDS.forEach((item) => {
                        youtubeEmbedElements += `
                        <h3 class="myTitle" align="center"></h3>
                        <p align="center">
                            <iframe 
                            class="myFrames" 
                            onload="onMyFrameLoad(this)" 
                            width="560" 
                            height="315" 
                            src="https://www.youtube.com/embed/${item}?modestbranding=1&mode=opaque&amp;rel=0&amp;autohide=1&amp;showinfo=0&amp;wmode=transparent" 
                            frameborder="0" 
                            allowfullscreen>
                            </iframe>
                        </p>`;
                    });

                    //
                    let askPassword;
                    if (self.protectionScheme == "No Protection") {
                        // jika tidak diproteksi password.

                        askPassword = "";
                    } else if (self.protectionScheme == "Simple Password") {
                        // jika diproteksi password.

                        askPassword = `
                        function askPassword(){
                            let password = prompt("Please enter the password", "");
                            if (password != null) {
                                if(password == "${self.password}"){
                                    return;
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

                    // untuk me-list video.
                    //a[class="ytp-title-link yt-uix-sessionlink"]
                    let scriptContent = `
                    nw.Window.get().on('new-win-policy', function (frame, url, policy) {
                        policy.ignore();
                    });
                    
                    let iframePlaceholder = document.getElementById("iframe-placeholder");
                    iframePlaceholder.innerHTML += \`${youtubeEmbedElements}\`;
                    
                    function onMyFrameLoad() {
                        let titles = [];
                        setTimeout(function(){
                            let iframes = document.getElementsByClassName("myFrames");
                            for(iframe of iframes){
                                let elmnts = iframe.contentWindow.document.querySelectorAll('div[class="ytp-chrome-top ytp-show-cards-title"]');
                                for(let elmnt of elmnts){
                                    elmnt.style.display = "none";
                                } 
    
                                let ttl = iframe.contentWindow.document.querySelectorAll('a[class="ytp-title-link yt-uix-sessionlink"]')[0].innerHTML;
                                titles.push(ttl);
                            }
    
                            let ctr = 0;
                            let titlePlaceholders = document.getElementsByClassName("myTitle");
                            for(let titlePlaceholder of titlePlaceholders){
                                titlePlaceholder.innerHTML = titles[ctr];
                                ++ctr;
                            } 
                        }, 1000);
                    };
                    
                    ${askPassword}
                    `;

                    // obfuscate konten.
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
                        description: `${title} is a protected Youtube content.`,
                        main: "main.html",
                        window: {
                            title: title,
                            width: 800,
                            height: 600,
                        },
                    };

                    // set progress ke 70.
                    self.eventEmitter.emit("ytp-on-progress", 70);

                    // file intermediate.
                    let packagePath = newPath + path.sep + "package.nw";

                    // kompresi ke zip.
                    let zip = new JSZip();

                    zip.file("main.html", htmlContent);
                    zip.file("main.js", protectedScriptContent);
                    zip.file("package.json", JSON.stringify(packageJSONObj, null, "\t"));

                    zip.generateNodeStream({
                        type: "nodebuffer",
                        streamFiles: true,
                    })
                        .pipe(fs.createWriteStream(packagePath))
                        .on("finish", function () {
                            // setelah kompresi selesai.

                            // set progress ke 90.
                            self.eventEmitter.emit("ytp-on-progress", 90);

                            // di linux, nw.exe adalah nw saja.
                            let nwPath = newPath + path.sep + "nw";

                            // maka di linux, nama executable juga tidak pakai .exe.
                            let packedPath = newPath + path.sep + `${title}`;

                            // sambung executable dengan intermediate file.
                            concat([nwPath, packagePath], packedPath, function (err) {
                                if (err) {
                                    console.log(err);
                                }

                                // hapus.
                                fs.unlinkSync(nwPath);
                                fs.unlinkSync(packagePath);

                                // selesai.
                                console.log("done");

                                // set progress ke 100.
                                self.eventEmitter.emit("ytp-on-progress", 100);

                                self.eventEmitter.emit("ytp-on-finished", packedPath);

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

// export class YTProtector.
export default YTProtector;
