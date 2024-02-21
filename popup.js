"use strict";
const tabTemplate = document.getElementById("tr_template");
const tabAppendElement = document.getElementById("tabs");
const saveButton = document.getElementById("save");
const addButton = document.getElementById("add");
const whyKey = "sfmWhySF";

function getStorage(callback){
    chrome.storage.sync.get([whyKey], function(items) {
        callback(items);
    });
}

function setStorage(tabs){
    // Save it using the Chrome extension storage API.
    chrome.storage.sync.set({whyKey: tabs}, function() {
        //TODO notify user of save
        console.log("saved");
    });
}

function deleteTab(){
    this.closest(".tab").remove();
    saveTabs();
}

function createElement(){
    const element = tabTemplate.content.firstElementChild.cloneNode(true);
    element.getElementById("delete").addEventListener("click", deleteTab);
    return element;
}

function loadTemplateTab(){
    tabAppendElement.append(createElement());
}

function loadTabs(items){
    console.log(items);
    if(items == null || items[whyKey] == null)
        return loadTemplateTab();

    const rowObjs = items[whyKey];
    const elements = [];
    for (const tab of rowObjs){
        console.log(tab);
        const element = createElement();
        element.getElementById("tabTitle").value = tab.tabTitle;
        element.getElementById("url").value = tab.url;
        elements.add(element);
    }
    tabAppendElement.append(...elements);
}

/*function clearStorage(){
    chrome.storage.sync.remove([whyKey],function(){
        const error = chrome.runtime.lastError;
        if (error != null)
            console.error(error);
    })
}*/

function saveTabs(){
    const tabs = [];
    const tabElements = document.getElementsByClassName("tab");
    Array.from(tabElements).forEach(function (tab) {        
        const tabTitle = tab.getElementById("tabTitle").value;
        const url = tab.getElementById("url").value;
        if (tabTitle != null && url != null){
            tabs.push({tabTitle, url});
        }
    });
    setStorage(tabs);
}

function addTab(){
    tabAppendElement.append(createElement());
    saveTabs()
}

saveButton.addEventListener("click", saveTabs);
addButton.addEventListener("click", addTab);
getStorage(loadTabs);
