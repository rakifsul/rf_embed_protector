// local current setting for this renderer process
let currentSettings;

// saat document ready.
$(document).ready(async () => {
    // saat pdfp-on-progress-reply dikirimkan oleh builderservice.
    preload.handleOnPDFPProgress((event, args) => {
        $("#pane-pdf-build-progress").attr("value", args);
        if (args >= 100) {
            $(":input").prop("disabled", false);
        }
    });

    // saat ytp-on-progress-reply dikirimkan oleh builderservice.
    preload.handleOnYTPProgress((event, args) => {
        $("#pane-youtube-build-progress").attr("value", args);
        if (args >= 100) {
            $(":input").prop("disabled", false);
        }
    });

    // saat tombol browse di pdf protector tab diklik.
    $("#browse-file-pdf").click(async function () {
        try {
            let result = await preload.openFileDialogPDF();

            if (result.filePaths[0]) {
                console.log(result.filePaths[0]);
                $("#browse-file-pdf").text(result.filePaths[0]);
            }
        } catch (err) {
            console.log(err);
        }
    });

    // saat tombol browse output folder di youtube protector tab diklik.
    $("#browse-output-folder-youtube").click(async function () {
        try {
            let result = await preload.openFolderDialog();

            if (result.filePaths[0]) {
                console.log(result.filePaths[0]);
                $("#browse-output-folder-youtube").text(result.filePaths[0]);
            }
        } catch (err) {
            console.log(err);
        }
    });

    // saat tombol browse output folder di pdf protector tab diklik.
    $("#browse-output-folder-pdf").click(async function () {
        try {
            let result = await preload.openFolderDialog();

            if (result.filePaths[0]) {
                console.log(result.filePaths[0]);
                $("#browse-output-folder-pdf").text(result.filePaths[0]);
            }
        } catch (err) {
            console.log(err);
        }
    });

    // saat tab navigasi diklik.
    $(".nav-group-item").click(function () {
        $("#menu-youtube").removeClass("active");
        $("#menu-pdf").removeClass("active");
        $("#menu-settings").removeClass("active");

        $("#pane-youtube").addClass("hidden");
        $("#pane-pdf").addClass("hidden");
        $("#pane-settings").addClass("hidden");

        $(this).toggleClass("active");

        let paneID = $(this).attr("data-pane");
        $(`#${paneID}`).toggleClass("hidden");
    });

    // dropdown protection scheme untuk youtube protector.
    $("#pane-youtube-sel-protection-scheme").on("change", function () {
        // alert(this.value);
        if (this.value == "Simple Password") {
            $("#pane-youtube-div-simple-password").show();
        } else {
            $("#pane-youtube-div-simple-password").hide();
        }
    });

    // dropdown protection scheme untuk pdf protector.
    $("#pane-pdf-sel-protection-scheme").on("change", function () {
        // alert(this.value);
        if (this.value == "Simple Password") {
            $("#pane-pdf-div-simple-password").show();
        } else {
            $("#pane-pdf-div-simple-password").hide();
        }
    });

    // saat youtube protector build diklik.
    $("#pane-youtube-btn-build").click(async function () {
        // build name-nya apa?
        let buildName = $("#pane-youtube-tx-build-name").val();
        if (!buildName) {
            alert("Build Name Cannot be Empty!");
            return;
        }

        // daftar url video youtube-nya.
        let urlList = $("#pane-youtube-txa-urls").val().split("\n");
        if (urlList.length == 0) {
            alert("URL List Cannot be Empty!");
            return;
        } else {
            if (urlList[0] == "") {
                alert("URL List Cannot be Empty!");
                return;
            }
        }

        // apakah pakai password?
        let protectionScheme = $("#pane-youtube-sel-protection-scheme").val();

        // password-nya apa?
        let simplePassword = $("#pane-youtube-tx-simple-password").val();

        // output folder-nya di mana?
        let outputFolder = $("#browse-output-folder-youtube").text();
        if (!outputFolder) {
            alert("Output Folder Cannot be Empty!");
            return;
        }

        // target platform-nya apa?
        let buildFor = $("#pane-youtube-sel-build-for").val();
        console.log({
            buildName: buildName,
            urlList: urlList,
            protectionScheme: protectionScheme,
            simplePassword: simplePassword,
            outputFolder: outputFolder,
            buildFor: buildFor,
        });

        // sebelum di-build, disable semua input.
        $(":input").prop("disabled", true);

        // panggil build.
        await preload.buildYTProtector({
            buildName: buildName,
            urlList: urlList,
            protectionScheme: protectionScheme,
            simplePassword: simplePassword,
            outputFolder: outputFolder,
            buildFor: buildFor,
        });
    });

    // saat pdf protector build diklik.
    $("#pane-pdf-btn-build").click(async function () {
        // alert($("#browse-file-pdf").text())

        // build name-nya apa?
        let buildName = $("#pane-pdf-tx-build-name").val();
        if (!buildName) {
            alert("Build Name Cannot be Empty!");
            return;
        }

        // file pdf yang mana?
        let pdfFile = $("#browse-file-pdf").text();
        if (!pdfFile) {
            alert("PDF Input Cannot be Empty!");
            return;
        }

        // pakai password atau tidak?
        let protectionScheme = $("#pane-pdf-sel-protection-scheme").val();

        // password-nya apa?
        let simplePassword = $("#pane-pdf-tx-simple-password").val();

        // output folder-nya di mana?
        let outputFolder = $("#browse-output-folder-pdf").text();
        if (!outputFolder) {
            alert("Output Folder Cannot be Empty!");
            return;
        }

        // untuk platform apa?
        let buildFor = $("#pane-pdf-sel-build-for").val();
        console.log({
            buildName: buildName,
            pdfFile: pdfFile,
            protectionScheme: protectionScheme,
            simplePassword: simplePassword,
            outputFolder: outputFolder,
            buildFor: buildFor,
        });

        // sebelum di-build, disable semua input.
        $(":input").prop("disabled", true);

        // panggil build.
        await preload.buildPDFProtector({
            buildName: buildName,
            pdfFile: pdfFile,
            protectionScheme: protectionScheme,
            simplePassword: simplePassword,
            outputFolder: outputFolder,
            buildFor: buildFor,
        });
    });

    // saat setting save diklik.
    $("#pane-settings-btn-save").click(async function () {
        saveSettings();
        loadSettings();
    });

    //
    loadSettings();

    //
    checkEngines();

    // keadaan default.
    // aktifkan tab youtube.
    $("#menu-youtube").click();

    // nonaktifkan input password.
    $("#pane-youtube-div-simple-password").hide();
    $("#pane-pdf-div-simple-password").hide();
});

//
async function loadSettings() {
    const initialSettings = await preload.storeGet("settings");
    if (!initialSettings) {
        resetSettings();
    }
    currentSettings = await preload.storeGet("settings");
    console.log(currentSettings);
    $("#pane-settings-after-build").val(currentSettings.afterBuild);
}

//
async function saveSettings() {
    let afterBuild = $("#pane-settings-after-build").val();
    let settingsToSave = {
        afterBuild: afterBuild,
    };
    await preload.storeSet("settings", settingsToSave);
}

//
async function resetSettings() {
    let afterBuild = "Do Nothing";
    let settingsToSave = {
        afterBuild: afterBuild,
    };
    await preload.storeSet("settings", settingsToSave);
}

//
async function checkEngines() {
    const ret = await preload.checkEnginesExist();
    if (ret === false) {
        alert("Engines does not exist.");
        return;
    }
    return;
}
