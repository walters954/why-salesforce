"use strict";

const tabTemplate = document.getElementById("tr_template");
const tabAppendElement = document.getElementById("tabs");
const saveButton = document.getElementById("save");
const addButton = document.getElementById("add");

const setupLightning = "/lightning/setup/";
const setupDefaultPage = "/home";

let knownTabs = [];

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
    if(url.includes(setupDefaultPage))
        url = url.slice(0,url.indexOf(setupDefaultPage));
    
    return url;
}

function deleteTab(){
    this.closest(".tab").remove();
    saveTabs();
}

function createElement(){
    const element = tabTemplate.content.firstElementChild.cloneNode(true);
    element.querySelector(".delete").addEventListener("click", deleteTab);
    return element;
}

function addTab(){
    tabAppendElement.append(createElement());
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
        elements.push(element);
    }
    tabAppendElement.append(...elements);
    knownTabs = rowObjs;
}

function saveTabs(){
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
}

saveButton.addEventListener("click", saveTabs);
addButton.addEventListener("click", addTab);

getStorage(loadTabs);
