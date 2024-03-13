"use strict";

const tabTemplate = document.getElementById("tr_template");
const tabAppendElement = document.getElementById("tabs");
const saveButton = document.getElementById("save");
const addButton = document.getElementById("add");

function sendMessage(message, callback){
    chrome.runtime.sendMessage({message, url: location.href}, callback);
}

function getStorage(callback){
    sendMessage({"what": "get"}, callback);
}

function setStorage(tabs){
    sendMessage({"what": "set", tabs}, null);
}

function deleteTab(){
    this.closest(".tab").remove();
    saveTab();
}

function createElement(){
    const element = tabTemplate.content.firstElementChild.cloneNode(true);
    element.querySelector(".delete").addEventListener("click", deleteTab);
    return element;
}

function loadTemplateTab(){
    tabAppendElement.append(createElement());
}

function loadTabs(items){
    console.log(items);
    if(items == null || items[items.key] == null)
        return loadTemplateTab();

    const rowObjs = items[items.key];
    const elements = [];
    for (const tab of rowObjs){
        console.log(tab);
        const element = createElement();
        element.querySelector(".tabTitle").value = tab.tabTitle;
        element.querySelector(".url").value = tab.url;
        elements.push(element);
    }
    tabAppendElement.append(...elements);
}

function saveTabs(){
    const tabs = [];
    const tabElements = document.getElementsByClassName("tab");
    Array.from(tabElements).forEach(function (tab) {        
        const tabTitle = tab.querySelector(".tabTitle").value;
        const url = tab.querySelector(".url").value;
        if (tabTitle != null && url != null){
            tabs.push({tabTitle, url});
        }
    });
}


const saveButton = document.querySelector(".save");
saveButton.addEventListener("click", saveTab);

const addButton = document.querySelector(".add");
addButton.addEventListener("click", addTab);

getStorage(loadTabs);
