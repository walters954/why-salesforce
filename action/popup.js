"use strict";

// queries the currently active tab of the current active window
chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    // is null if the extension cannot access the current tab
    if(tabs[0].url == null || !tabs[0].url.match(".*\/lightning\/setup\/.*")){
        window.location.href = chrome.runtime.getURL(`action/notSalesforceSetup.html${tabs[0].url != null ? "?url="+tabs[0].url : ""}`);
    } else {
        getStorage(loadTabs);
    }
});

const tabTemplate = document.getElementById("tr_template");
const tabAppendElement = document.getElementById("tabs");

const setupLightning = "/lightning/setup/";
let knownTabs = [];
let loggers = [];

function sendMessage(message, callback){
    chrome.runtime.sendMessage({message, url: location.href}, callback);
}

function getStorage(callback){
    sendMessage({what: "get"}, callback);
}

function afterSet(){
    sendMessage({what: "saved"});
}

function arraysAreEqual(arr1, arr2) {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
}

function setStorage(tabs, check = true){
    if((check && !arraysAreEqual(tabs, knownTabs)) || !check)
       sendMessage({what: "set", tabs}, afterSet); 
    knownTabs = tabs;
}

function cleanupUrl(url){
    if(url == null || url == "")
        return "";
    // remove org-specific url
    const home = "https:\/\/.*\.my\.salesforce-setup\.com\/lightning\/setup\/.*"
    if(url.match(home))
        url = url.slice(url.indexOf(setupLightning))

    if(url.includes(setupLightning))
        url = url.slice(url.indexOf(setupLightning)+setupLightning.length); // remove setup subdirectory
    // do not remove anything if the page is not from setup
    else if(url.includes("/lightning") || url.includes("/_ui/common"))
        return url;

    if(url.startsWith("/"))
        url = url.slice(1);
    if(url.endsWith("/"))
        url = url.slice(0,url.length-1);

    return url;
}

function deleteTab(){
    this.closest(".tab").remove();
    saveTabs();
}

function addTab(){
     // enable current last child button
    if(tabAppendElement.childElementCount >= 1){ // if list is empty, there's nothing to disable
      const deleteButton = tabAppendElement.querySelector("td:last-child button.delete");
      deleteButton.disabled = false;
    }
    // add a new empty element
    tabAppendElement.append(createElement());
}

function checkAddTab(inputObj){
    //add a new tab if both fields are not empty
    inputObj.title && inputObj.url && addTab();
}

let focusedIndex = 0;

function inputTitleUrlListener(type) {
    const currentObj = loggers[focusedIndex];
    const element = currentObj[type];
    const value = element.value;
    const inputObj = currentObj.last_input;
    const last_input = inputObj[type] || "";
    const delta = last_input.length - value.length;

    if((delta < -2 || delta > 2) && type === 'url'){
        element.value = cleanupUrl(value);
    }

    inputObj[type] = value;
    focusedIndex == (loggers.length - 1) && checkAddTab(inputObj); // if the user is on the last td
}

function focusListener(e){
    focusedIndex = e.target.dataset.element_index;
    saveTabs(false);
}

function createElement(){
    const element = tabTemplate.content.firstElementChild.cloneNode(true);
    element.dataset.draggable = "false";
    /*element.addEventListener("focus", event => {
        event.preventDefault();
        saveTabs();
    });*/
    const deleteButton = element.querySelector("button.delete");
    deleteButton.addEventListener("click", deleteTab);
    deleteButton.disabled = true;

    function setInfoForDrag(element, listener){
      element.addEventListener("input", listener);
      element.addEventListener("focus", focusListener);
      element.dataset.element_index = loggers.length;
    };
    const title = element.querySelector(".tabTitle");
    setInfoForDrag(title, () => inputTitleUrlListener("title"));
    const url = element.querySelector(".url");
    setInfoForDrag(url, () => inputTitleUrlListener("url"));

    loggers.push({title, url, last_input: {}}); // set last_input as an empty object
    return element;
}

function loadTabs(items){
    if(items == null || items[items.key] == null)
        return addTab();

    const rowObjs = items[items.key];
    const elements = [];
    for (const tab of rowObjs){
        const element = createElement();
        element.querySelector(".tabTitle").value = tab.tabTitle;
        element.querySelector(".url").value = tab.url;
        element.querySelector(".delete").disabled = false;
        const logger = loggers.pop();
        logger.last_input.title = tab.tabTitle;
        logger.last_input.url = tab.url;
        loggers.push(logger);
        elements.push(element);
    }
    tabAppendElement.append(...elements);
    tabAppendElement.append(createElement()); // always leave a blank at the bottom
    knownTabs = rowObjs;
}

function reloadRows(items){
    while(tabAppendElement.childElementCount > 0)
        tabAppendElement.removeChild(tabAppendElement.lastChild);
    loggers = [];
    loadTabs(items);
}

function findTabs(){
    const tabs = [];
    const tabElements = document.getElementsByClassName("tab");
    Array.from(tabElements).forEach(tab => {        
        const tabTitle = tab.querySelector(".tabTitle").value;
        const url = cleanupUrl(tab.querySelector(".url").value);
        if (tabTitle && url){
            tabs.push({tabTitle, url});
        }
    });
    return tabs;
}

function saveTabs(doReload = true, tabs){
    tabs = tabs != null ? tabs : findTabs();
    setStorage(tabs, true);
    doReload && reloadRows({tabs, key: "tabs"});
}

function importHandler(){
    //window.open('import.html', 'File Input Popup', 'width=300,height=200');
    //const message = {what: "add"}; 
    chrome.runtime.sendMessage({what: "add", url: location.href});
    window.close();
}

function exportHandler(){
    // Convert JSON string to Blob
    const blob = new Blob([JSON.stringify(knownTabs, null, 4)], { type: "application/json" });

    // Create a download link
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "again-why-salesforce.json";

    // Append the link to the body and trigger the download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link)
}

function emptyTabs(){
    saveTabs(true, []);
}

// listen to possible updates from tableDragHandler
window.addEventListener("message", e => {
    e.source == window && e.data.what === "order" && saveTabs();
});

document.getElementById("import").addEventListener("click", importHandler);
document.getElementById("export").addEventListener("click", exportHandler);
document.getElementById("delete-all").addEventListener("click", emptyTabs);
