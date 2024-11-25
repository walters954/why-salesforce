'use strict';
const tabTemplate = 'tr_template';
const tabAppendElement = 'tbody';
loadTabs();

function loadTabs(){
    const template = document.getElementById(tabTemplate);
    const elements = new Set();

    browser.storage.sync.get(['sfmWhySF'], function(items) {
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
}

function saveTab(){
    let validTabs = processTabs();
    setBrowserStorage(validTabs);
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

function setBrowserStorage(tabs){
    // Save it using the Browser extension storage API.
    browser.storage.sync.set({'sfmWhySF': tabs}, function() {
        //TODO notify user of save
    });
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

function clearBrowserStorage(){
    browser.storage.sync.remove(["sfmWhySF"],function(){
        var error = browser.runtime.lastError;
           if (error) {
               console.error(error);
           }
       })
}

// Initial check to set the state of the save button
updateSaveButtonState();