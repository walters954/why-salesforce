"use strict";
const tabTemplate = "tr_template";
const tabAppendElement = "tbody";
const SUCCESS_MESSAGE = "Your changes were saved successfully";
const storageKey = "sfmWhySF";
loadTabs();

function getSavedTabsFromStorage() {
    return browser.storage.sync.get([storageKey]);
}

async function loadTabs() {
    const template = document.getElementById(tabTemplate);
    const elements = new Set();

    const items = await getSavedTabsFromStorage();
    const rowObj = items?.[storageKey] ?? [];
    for (const rowId in rowObj) {
        let tab = rowObj[rowId];
        const element = template.content.firstElementChild.cloneNode(true);
        element.querySelector(".tabTitle").value = tab.tabTitle;
        element.querySelector(".url").value = tab.url;
        element.querySelector(".openInNewTab").checked =
            tab.openInNewTab || false;
        addRadioListener(element); // Add listener for radio button selection
        elements.add(element);
    }
    document.querySelector(tabAppendElement).append(...elements);
    updateSaveButtonState();
}

function addTab() {
    const template = document.getElementById(tabTemplate);
    const element = template.content.firstElementChild.cloneNode(true);
    addRadioListener(element); // Add listener for radio button selection
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
        tabData.previous.before(tabData.selected);
        saveTab(); // Save order change
    }
}

function moveTabDown() {
    let tabData = getTabData();
    if (tabData.next) {
        tabData.next.after(tabData.selected);
        saveTab(); // Save order change
    }
}

function getTabData() {
    const selectedRadio = document.querySelector('input[type="radio"]:checked');
    const selectedTab = selectedRadio?.closest(".tab"); // The <tr> element

    if (!selectedTab) {
        return { selected: null, previous: null, next: null };
    }

    return {
        selected: selectedTab,
        previous: selectedTab.previousElementSibling, // Gets the previous <tr> sibling
        next: selectedTab.nextElementSibling, // Gets the next <tr> sibling
    };
}

function addRadioListener(tab) {
    // Assuming radio button has class 'select-tab'
    tab.querySelector("input[type='radio']")?.addEventListener(
        "change",
        handleRadioSelected
    );
}

function setBrowserStorage(tabs) {
    browser.storage.sync
        .set({ [storageKey]: tabs })
        .then(() => {
            setMessage("success", SUCCESS_MESSAGE);

            // Try to send message to content script to refresh tabs
            // This may fail if not on a Salesforce page, which is fine
            return browser.tabs.query({ active: true, currentWindow: true });
        })
        .then((queryTabs) => {
            if (queryTabs && queryTabs.length > 0 && queryTabs[0].id) {
                return browser.tabs
                    .sendMessage(queryTabs[0].id, {
                        action: "refresh_tabs",
                        tabs: tabs,
                    })
                    .then((response) => {
                        if (response && response.success) {
                            console.log("Tab refresh message sent and acknowledged.");
                        }
                    })
                    .catch((err) => {
                        // This is expected if not on a Salesforce setup page
                        console.log("Could not refresh tabs (not on Salesforce page):", err.message);
                    });
            } else {
                console.log("No active tab found to send refresh message to.");
            }
        })
        .catch((error) => {
            // This only catches storage errors, not message sending errors
            console.error("Error saving to storage:", error);
            setMessage("error", `Failed to save changes: ${error.message}`);
        });
}

function setMessage(type, message) {
    const messageDiv = document.querySelector("#message");
    messageDiv.classList.remove("hidden");

    const messageType = document.querySelector("#message-type");
    // Ensure previous type classes are removed before adding the new one
    messageType.className = "slds-notify slds-notify_alert"; // Reset classes
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
    // Also reset message type classes
    const messageType = document.querySelector("#message-type");
    messageType.className = "slds-notify slds-notify_alert";
}

function updateSaveButtonState() {
    const saveButton = document.querySelector(".save");
    const tabElements = document.getElementsByClassName("tab");
    saveButton.disabled = tabElements.length === 0;
}

const upButton = document.querySelector(".header-buttons .tab-action.up");
upButton?.addEventListener("click", moveTabUp); // Use optional chaining in case elements don't exist

const downButton = document.querySelector(".header-buttons .tab-action.down");
downButton?.addEventListener("click", moveTabDown);

const headerDeleteButton = document.querySelector(".header-buttons .delete");
headerDeleteButton?.addEventListener("click", deleteTab);

const saveButton = document.querySelector(".save");
saveButton.addEventListener("click", saveTab);

const addButton = document.querySelector(".add");
addButton.addEventListener("click", addTab);

/**
 * Finds all valid Tabs in the popup and saves them as a JSON object to the user's pc
 */
function exportTabs() {
    const validTabs = processTabs();
    const jsonTabs = JSON.stringify({ tabs: validTabs });
    // Create a Blob & object URL
    const blob = new Blob([jsonTabs], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    // Build <a> and "click" it
    const a = document.createElement("a");
    a.href = url;
    a.download = "why-salesforce.json";
    document.body.appendChild(a);
    a.click();
    // Cleanup
    a.remove();
    URL.revokeObjectURL(url);
}

const exportButton = document.querySelector(".export");
exportButton.addEventListener("click", exportTabs);

/**
 * Reads and processes JSON files using modern Promise-based API.
 *
 * @param {Event} event - The event triggered by the file input
 * @returns {Promise<void>}
 */
async function importTabs(event) {
    event.preventDefault();
    const file = event.target.files[0];
    if (file.type !== "application/json") {
        setMessage("error", "The file you chose is not supported.");
        return;
    }
    const jsonString = await file.text();
    let tabArray;
    try {
        tabArray = JSON.parse(jsonString)?.tabs ?? [];
    } catch (e) {
        setMessage("error", "Invalid JSON file.");
        return;
    }
    // accept only valid tabs
    const validImportedTabs = tabArray.filter(
        (tab) =>
            tab.tabTitle != null && tab.url != null && tab.openInNewTab != null
    );
    if (validImportedTabs.length === 0) {
        setMessage("error", "The file you chose does not contain valid tabs.");
        return;
    }
    const alreadySavedTabsObj = await getSavedTabsFromStorage();
    const alreadySavedTabs = alreadySavedTabsObj?.[storageKey] ?? [];
    // filter out tabs that already exist (same tabTitle, url, and openInNewTab)
    const newTabs = validImportedTabs.filter(
        (importedTab) =>
            !alreadySavedTabs.some(
                (existingTab) =>
                    existingTab.tabTitle === importedTab.tabTitle &&
                    existingTab.url === importedTab.url &&
                    existingTab.openInNewTab === importedTab.openInNewTab
            )
    );
    if (newTabs.length === 0) {
        setMessage("success", "All tabs already exist. Nothing to import.");
        event.target.value = "";
        return;
    }
    // append only the new tabs
    alreadySavedTabs.push(...newTabs);
    setBrowserStorage(alreadySavedTabs);
    // reset the table
    document.querySelector(tabAppendElement).innerHTML = "";
    // reload the tabs
    loadTabs();
    // reset file input so the same file can be imported again
    event.target.value = "";
}

const importButton = document.querySelector(".import");
importButton.addEventListener("change", importTabs);

updateSaveButtonState();
handleTabMoverButtonVisibility();
