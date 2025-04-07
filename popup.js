"use strict";
const tabTemplate = "tr_template";
const tabAppendElement = "tbody";
const SUCCESS_MESSAGE = "Your changes were saved successfully";
const storageKey = "sfmWhySF";
loadTabs();

function loadTabs() {
    const template = document.getElementById(tabTemplate);
    const elements = new Set();

    chrome.storage.sync.get([storageKey], function (items) {
        const rowObj = items[storageKey] || [];
        for (const rowId in rowObj) {
            let tab = rowObj[rowId];
            const element = template.content.firstElementChild.cloneNode(true);
            element.querySelector(".tabTitle").value = tab.tabTitle;
            element.querySelector(".url").value = tab.url;
            element.querySelector(".openInNewTab").checked =
                tab.openInNewTab || false;
            addRadioListener(element);
            elements.add(element);
        }
        document.querySelector(tabAppendElement).append(...elements);
        updateSaveButtonState();
    });
}

function addTab() {
    const template = document.getElementById(tabTemplate);
    const element = template.content.firstElementChild.cloneNode(true);
    addRadioListener(element);
    document.querySelector(tabAppendElement).append(element);
    updateSaveButtonState();
    clearMessage();
}

function saveTab() {
    let validTabs = processTabs();
    setBrowserStorage(validTabs);
}

function processTabs() {
    let tabs = [];
    const tabElements = document.getElementsByClassName("tab");
    Array.from(tabElements).forEach(function (tab) {
        let tabTitle = tab.querySelector(".tabTitle").value;
        let url = tab.querySelector(".url").value;
        let openInNewTab = tab.querySelector(".openInNewTab").checked;

        if (tabTitle && url) {
            tabs.push({ tabTitle, url, openInNewTab });
        }
    });
    return tabs;
}

function deleteTab() {
    let selectedTab = document.querySelector(".tab.selected");

    if (selectedTab) {
        selectedTab.remove();
        saveTab();
        handleTabMoverButtonVisibility(); // If the selected tab was deleted, the tab-action buttons should disappear.
        updateSaveButtonState();
    }
}

function handleRadioSelected(event) {
    document.querySelector(".tab.selected")?.classList.remove("selected"); // Removes "selected" class from a previously selected tab
    this.closest(".tab").classList.add("selected"); // Adds "selected" class to newly selected tab

    handleTabMoverButtonVisibility();
}
function handleTabMoverButtonVisibility() {
    let selectedTab = document.querySelector(".tab.selected");

    let headerButtonContainer = document.querySelector(".header-buttons");
    if (selectedTab) {
        headerButtonContainer.classList.add("radio-selected");
    } else {
        headerButtonContainer.classList.remove("radio-selected");
    }
}

function moveTabUp() {
    let tabData = getTabData();
    if (tabData.previous) {
        swapTabs(tabData.previous, tabData.selected);
    }
}
function moveTabDown() {
    let tabData = getTabData();
    if (tabData.next) {
        swapTabs(tabData.selected, tabData.next);
    }
}
function getTabData() {
    let tabData = { all: document.getElementsByClassName("tab") };

    let selectedRadio = document.querySelector('input[type="radio"]:checked');
    tabData.selected = selectedRadio?.closest(".tab");

    let selectedIsFirst = tabData.selected == tabData.all[0];
    let selectedIsLast = tabData.selected == tabData.all[tabData.length - 1];

    tabData.previous = selectedIsFirst
        ? null
        : tabData.selected?.previousSibling;
    tabData.next = selectedIsLast ? null : tabData.selected?.nextSibling;

    return tabData;
}
function swapTabs(tab1, tab2) {
    const afterTab2 = tab2.nextElementSibling;
    const parent = tab2.parentNode;
    tab1.replaceWith(tab2);
    parent.insertBefore(tab1, afterTab2);
}

function setBrowserStorage(tabs) {
    // Save it using the Chrome extension storage API.
    chrome.storage.sync.set({ [storageKey]: tabs }, function () {
        // Check for errors during storage set
        if (chrome.runtime.lastError) {
            console.error("Error setting storage:", chrome.runtime.lastError);
            setMessage("error", "Failed to save changes."); // Provide feedback
            return;
        }

        setMessage("success", SUCCESS_MESSAGE);

        // Instead of reloading, send a message with the new tabs data
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (queryTabs) {
                if (queryTabs && queryTabs.length > 0 && queryTabs[0].id) {
                    // No need to check URL here, content script matches ensure it only runs on the correct pages
                    chrome.tabs.sendMessage(
                        queryTabs[0].id,
                        { action: "refresh_tabs", tabs: tabs }, // Send the tabs data
                        function (response) {
                            if (chrome.runtime.lastError) {
                                console.log(
                                    "Could not send refresh message:",
                                    chrome.runtime.lastError.message
                                );
                            } else if (response && response.success) {
                                console.log(
                                    "Tab refresh message sent and acknowledged."
                                );
                            } else {
                                console.log(
                                    "Tab refresh message sent, but no/failed response."
                                );
                            }
                        }
                    );
                } else {
                    console.log(
                        "No active tab found to send refresh message to."
                    );
                }
            }
        );
    });
}

function setMessage(type, message) {
    const messageDiv = document.querySelector("#message");
    messageDiv.classList.remove("hidden");

    const messageType = document.querySelector("#message-type");
    messageType.classList.add(`slds-theme_${type}`);

    const messageBody = document.querySelector("#message-body");
    messageBody.innerText = message;

    setTimeout(function () {
        clearMessage();
    }, 3000);
}

function clearMessage() {
    const messageDiv = document.querySelector("#message");
    messageDiv.classList.add("hidden");
}

function updateSaveButtonState() {
    const saveButton = document.querySelector(".save");
    const tabElements = document.getElementsByClassName("tab");
    saveButton.disabled = tabElements.length === 0;
}

function addRadioListener(tab) {
    tab.querySelector("input[type='radio']")?.addEventListener(
        "change",
        handleRadioSelected
    );
}

const upButton = document.querySelector(".header-buttons .tab-action.up");
upButton.addEventListener("click", moveTabUp);

const downButton = document.querySelector(".header-buttons .tab-action.down");
downButton.addEventListener("click", moveTabDown);

const deleteButton = document.querySelector(".header-buttons .delete");
deleteButton.addEventListener("click", deleteTab);

const saveButton = document.querySelector(".save");
saveButton.addEventListener("click", saveTab);

const addButton = document.querySelector(".add");
addButton.addEventListener("click", addTab);

// Initial check to set the state of the save button
updateSaveButtonState();
