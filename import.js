"use strict";

function listenToFileUpload(){
    const dropArea = document.getElementById("again-why-salesforce-import");

    function readFile(file){
        if(file.type !== "application/json")
            return;
        
        const reader = new FileReader();

        reader.onload = function(e) {
            const contents = e.target.result;
            const imported = JSON.parse(contents);
            const message = {"what": "import", imported}; 
            window.postMessage(message, "*");
        };

        reader.readAsText(file);
    }

    dropArea.querySelector("input").addEventListener("change", function(event) {
        event.preventDefault();
        const file = event.target.files[0];
        readFile(file);
    });

    // Prevent default behavior for drag events
    dropArea.addEventListener('dragover', function(event) {
        event.preventDefault();
    });

    // Handle drop event
    dropArea.addEventListener('drop', function(event) {
        event.preventDefault();
        
        // Get the dropped files
        const files = event.dataTransfer.files;

        // Iterate through dropped files
        for (const file of files) {
            // Access file properties (e.g., file.name, file.type, etc.)
            console.log('Dropped file:', file.name);
            // Optionally, perform further processing with the dropped files
            readFile(file);
        }
    });
}

// listen from saves from the action page
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message == null || message.what == null)
        return;
    if(message.what == "add"){
        sendResponse(null);
        listenToFileUpload();
    }
});
