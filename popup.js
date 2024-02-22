"use strict";

const tabTemplate = document.getElementById("tr_template");
const tabAppendElement = document.getElementById("tabs");

const setupLightning = "/lightning/setup/";
let knownTabs = [];
let loggers = [];

function sendMessage(message, callback){
    chrome.runtime.sendMessage({message, url: location.href}, callback);
}

function getStorage(callback){
    sendMessage({"what": "get"}, callback);
}

function afterSet(){
    sendMessage({"what": "saved"});
}

function arraysAreEqual(arr1, arr2) {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
}

function setStorage(tabs){
    if(!arraysAreEqual(tabs,knownTabs))
        sendMessage({"what": "set", tabs}, afterSet);
    knownTabs = tabs;
}

function cleanupUrl(url){
    if(url.startsWith("/"))
        url = url.slice(1);
    if(url.endsWith("/"))
        url = url.slice(0,url.length-1);
    if(url.includes(setupLightning))
        url = url.slice(url.indexOf(setupLightning)+setupLightning.length);
    
    return url;
}

function deleteTab(){
    this.closest(".tab").remove();
    saveTabs();
}

function addTab(){
    tabAppendElement.append(createElement());
}

function checkAddTab(inputObj){
    //add a new tab if both fields are not empty
    if(inputObj.title && inputObj.url){
        addTab();
    }
}

let focusedIndex = 0;

function inputTitleListener(){
    const currentObj = loggers[focusedIndex];
    const titleElement = currentObj.title;
    const value = titleElement.value;
    //currentObj.timeout.title = 0;
    const inputObj = currentObj.last_input;
    const last_input = inputObj.title || "";
    const delta = last_input.length - value.length;
    if(delta < -2 || delta > 2){
        //user has copied
        console.log("copied title");
    }
    inputObj.title = value;
    if(focusedIndex == loggers.length - 1)
        checkAddTab(inputObj);
}

function inputUrlListener(){
    const currentObj = loggers[focusedIndex];
    const urlElement = currentObj.url;
    const value = urlElement.value;
    //currentObj.timeout.url = 0;
    const inputObj = currentObj.last_input;
    const last_input = inputObj.url || "";
    const delta = last_input.length - value.length;
    if(delta < -2 || delta > 2){
        //user has copied
        console.log("copied url");
        urlElement.value = cleanupUrl(value);
    }
    inputObj.url = value;
    if(focusedIndex == loggers.length - 1)
        checkAddTab(inputObj);
}

function focusListener(e){
    focusedIndex = e.target.dataset.element_index;
    saveTabs(false);
}

function createElement(){
    const element = tabTemplate.content.firstElementChild.cloneNode(true);
    element.querySelector(".delete").addEventListener("click", deleteTab);
    const title = element.querySelector(".tabTitle");
    const url = element.querySelector(".url");
    title.addEventListener("input", inputTitleListener);
    url.addEventListener("input", inputUrlListener);
    title.addEventListener("focus", focusListener);
    url.addEventListener("focus", focusListener);
    title.dataset.element_index = loggers.length;
    url.dataset.element_index = loggers.length;
    loggers.push({title, url, timeout: {}, last_input: {}});
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
        const logger = loggers.pop();
        logger.last_input.title = tab.tabTitle;
        logger.last_input.url = tab.url;
        loggers.push(logger);
        elements.push(element);
    }
    tabAppendElement.append(...elements);
    tabAppendElement.append(createElement());// always leave a blank at the bottom
    knownTabs = rowObjs;
}

function reloadRows(items){
    while(tabAppendElement.childElementCount > 0)
        tabAppendElement.removeChild(tabAppendElement.lastChild);
    loggers = [];
    loadTabs(items);
}

function saveTabs(doReload = true){
    const tabs = [];
    const tabElements = document.getElementsByClassName("tab");
    Array.from(tabElements).forEach(tab => {        
        const tabTitle = tab.querySelector(".tabTitle").value;
        const url = cleanupUrl(tab.querySelector(".url").value);
        if (tabTitle && url){
            tabs.push({tabTitle, url});
        }
    });
    setStorage(tabs);
    if(doReload)
        reloadRows({tabs, key: "tabs"});
}

document.getElementById("save").addEventListener("click", saveTabs);
document.getElementById("add").addEventListener("click", addTab);

getStorage(loadTabs);
