'use strict';
loadTabs();


function loadTabs(){
    console.log('loadTabs');  
    const template = document.getElementById("li_template");
    const elements = new Set();

    chrome.storage.sync.get(['sfmWhySF'], function(items) {
        const rowObj = items['sfmWhySF'];
        for (const rowId in rowObj) {
            console.log(`${rowId}: ${rowObj[rowId]}`);
            let tab = rowObj[rowId];
            const element = template.content.firstElementChild.cloneNode(true);
            element.querySelector(".tabTitle").value = tab.tabTitle;
            element.querySelector(".url").value = tab.url;
            element.querySelector(".delete").addEventListener("click", deleteTab);
            elements.add(element);
        }

        console.log(elements);
        document.querySelector("ul").append(...elements);
    });

}

function addTab(){
    console.log('add tab');
    const template = document.getElementById("li_template");
    const element = template.content.firstElementChild.cloneNode(true);
    element.querySelector(".delete").addEventListener("click", deleteTab);
    document.querySelector("ul").append(element);
}

function saveTab(){
    let validTabs = processTabs();
    console.log(validTabs);
    setChromeStorage(validTabs);
}

function processTabs(){
    let tabs = [];
    const tabElements = document.getElementsByClassName('tab');
    console.log(tabElements);
    Array.from(tabElements).forEach(function (tab) {
        console.log(tab);
        
        let tabTitle = tab.querySelector('.tabTitle').value;
        let url = tab.querySelector('.url').value;

        if (tabTitle && url){
            tabs.push({tabTitle, url});
        }
        console.log(tabs);
    });
    return tabs;
}

function deleteTab(){
    console.log('delete tab');
    this.closest(".tab").remove();
    saveTab();
}

function setChromeStorage(tabs){
    // Save it using the Chrome extension storage API.
    chrome.storage.sync.set({'sfmWhySF': tabs}, function() {
        console.log('Settings saved', tabs);
    });
    
}


const saveButton = document.querySelector(".save");
saveButton.addEventListener("click", saveTab);

const addButton = document.querySelector(".add");
addButton.addEventListener("click", addTab);