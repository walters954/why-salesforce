"use strict";
import process from "node:process";
import manifest from "./template-manifest.json" assert { type: "json" };
import { writeFileSync } from "fs";

const browser = process.argv[2];
if (browser === "firefox") {
	const background_script = manifest.background.service_worker;
	manifest.background.scripts = [background_script];

	delete manifest.minimum_chrome_version;
	delete manifest.background.service_worker;
    delete manifest.browser_specific_settings.safari;

} else if (browser === "chrome") {
	delete manifest.browser_specific_settings;

} else if (browser === "safari") {
	delete manifest.minimum_chrome_version;
    delete manifest.browser_specific_settings.gecko;

} else {
	console.error(`Usage: ${process.argv[0]} ${process.argv[1]} (firefox || chrome || safari)`);
	throw new Error(`Unknown browser: ${browser}`);
}

writeFileSync("manifest.json", JSON.stringify(manifest, null, 4));
