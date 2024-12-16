"use strict";
const manifest = require("./template-manifest");

const browser = process.argv[2];
if (browser === "firefox") {
    const background_script = manifest.background.service_worker;
    manifest.background.scripts = [background_script];

    delete manifest.minimum_chrome_version;
    delete manifest.background.service_worker;
}
else if (browser === "chrome") {
    delete manifest.browser_specific_settings;
}
else if (browser === "safari") {
    delete manifest.browser_specific_settings;
}
else {
    console.log(`Usage: ${process.argv[0]} ${process.argv[1]} (firefox || chrome || safari)`);
    throw new Error(`Unknown browser: ${browser}`);
}

const fs = require("fs");
fs.writeFileSync("manifest.json", JSON.stringify(manifest, null, 4));
