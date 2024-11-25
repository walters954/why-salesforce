'use strict';
const tabTemplate = 'tr_template';
const tabAppendElement = 'tbody';
const SUCCESS_MESSAGE = 'Your changes were saved successfully';
loadTabs();

function loadTabs(){
    const template = document.getElementById(tabTemplate);
    const elements = new Set();

    chrome.storage.sync.get(['sfmWhySF'], function(items) {
        const rowObj = items['sfmWhySF'] || [];
        for (const rowId in rowObj) {
            let tab = rowObj[rowId];
            const element = template.content.firstElementChild.cloneNode(true);
            element.querySelector(".tabTitle").value = tab.tabTitle;
            element.querySelector(".url").value = tab.url;
            element.querySelector(".openInNewTab").checked = tab.openInNewTab || false;
            element.querySelector(".delete").addEventListener("click", deleteTab);
            elements.add(element);
        }
        document.querySelector(tabAppendElement).append(...elements);
        updateSaveButtonState();
    });
}

function addTab(){
    const template = document.getElementById(tabTemplate);
    const element = template.content.firstElementChild.cloneNode(true);
    element.querySelector(".delete").addEventListener("click", deleteTab);
    document.querySelector(tabAppendElement).append(element);
    updateSaveButtonState();
    clearMessage();
}

function saveTab(){
    let validTabs = processTabs();
    setChromeStorage(validTabs);
}

function processTabs(){
    let tabs = [];
    const tabElements = document.getElementsByClassName('tab');
    Array.from(tabElements).forEach(function (tab) {        
        let tabTitle = tab.querySelector('.tabTitle').value;
        let url = tab.querySelector('.url').value;
        let openInNewTab = tab.querySelector('.openInNewTab').checked;

        if (tabTitle && url){
            tabs.push({tabTitle, url, openInNewTab});
        }
    });
    return tabs;
}

function deleteTab(){
    this.closest(".tab").remove();
    saveTab();
    updateSaveButtonState();
}

function setChromeStorage(tabs){
    // Save it using the Chrome extension storage API.
    chrome.storage.sync.set({'sfmWhySF': tabs}, function() {
        setMessage('success', SUCCESS_MESSAGE);
    });
}

function setMessage(type, message){
    const messageDiv = document.querySelector("#message");
    messageDiv.classList.remove('hidden');

    const messageType = document.querySelector("#message-type");
    messageType.classList.add(`slds-theme_${type}`);

    const messageBody = document.querySelector("#message-body");
    messageBody.innerText = message;
}

function clearMessage(){
    const messageDiv = document.querySelector("#message");
    messageDiv.classList.add('hidden');
}

function updateSaveButtonState() {
    const saveButton = document.querySelector(".save");
    const tabElements = document.getElementsByClassName('tab');
    saveButton.disabled = tabElements.length === 0;
}

const saveButton = document.querySelector(".save");
saveButton.addEventListener("click", saveTab);

const addButton = document.querySelector(".add");
addButton.addEventListener("click", addTab);

function clearChromeStorage(){
    chrome.storage.sync.remove(["sfmWhySF"], function(){
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    });
}

// Initial check to set the state of the save button
updateSaveButtonState();