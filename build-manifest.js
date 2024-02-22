"use strict";
const argc = process.argv.length;
if(argc < 3){
    console.log(`Usage: ${process.argv[0]} ${process.argv[1]} (firefox || chrome || safari)`);
    return;
}
//const fs = require("fs-extra");
//const fs = require("fs");

//const manifest = fs.readJsonSync("template-manifest.json");
const manifest = require("./template-manifest");

const browser = process.argv[2];
if (browser === "firefox") {
    const background_script = manifest.background.service_worker;
    manifest.background.scripts = [background_script];

    delete manifest.minimum_chrome_version;
    delete manifest.background.service_worker;
    delete manifest.background.persistent;
}
else if (browser === "chrome") {
    delete manifest.browser_specific_settings;
}
else if (browser === "safari") {
    delete manifest.browser_specific_settings;
}
else {
    throw new Error(`Unknown browser: ${browser}`);
}

const fs = require("fs");
fs.writeFileSync("manifest.json", JSON.stringify(manifest, null, 4));
