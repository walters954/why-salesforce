This directory contains every file related to the manifest, but not the manifest.json itself.

To create it, run `deno task dev-(firefox|chrome|safari)` be sure to pick the browser you'll be using.
You can even use `node manifest/build-manifest.js (firefox|chrome|safari)` to run with Node.

For example, if you want to use this extension on firefox, run `npm run dev-firefox`.
