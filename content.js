const storageKey = "sfmWhySF";

function init(setupTabUl) {
    if (setupTabUl) {
        chrome.storage.sync.get([storageKey], function (items) {
            let rowObj = items[storageKey] || [];
            if (rowObj.length === 0) {
                //Did not find data inside browser storage
                rowObj = initTabs();
            }

            for (const rowId in rowObj) {
                let row = rowObj[rowId];
                setupTabUl.appendChild(
                    generateRowTemplate(row.tabTitle, row.url, row.openInNewTab)
                );
            }

            // Add click event listeners after rows are inserted
            addClickEventListeners(rowObj);
        });
    }
}

function delayLoadSetupTabs(count) {
    const setupTabUl = document.getElementsByClassName(
        "tabBarItems slds-grid"
    )[0];
    count++;

    if (count > 5) {
        console.error("Why Salesforce - failed to find setup tab.");
        return;
    }

    if (!setupTabUl) {
        setTimeout(function () {
            delayLoadSetupTabs(count);
        }, 3000); // Fixed to pass count correctly
    } else {
        init(setupTabUl);
    }
}

setTimeout(function () {
    delayLoadSetupTabs(0);
}, 3000);

function generateRowTemplate(tabTitle, url, openInNewTab) {
    const li = document.createElement("li");
    li.setAttribute("role", "presentation");
    li.className =
        "oneConsoleTabItem tabItem slds-context-bar__item borderRight navexConsoleTabItem why-sf-custom-tab";
    li.setAttribute("data-aura-class", "navexConsoleTabItem");
    li.setAttribute("data-url", url);

    const target = openInNewTab ? "_blank" : "_self";
    const a = document.createElement("a");
    a.setAttribute("role", "tab");
    a.setAttribute("tabindex", "-1");
    a.setAttribute("title", tabTitle);
    a.setAttribute("aria-selected", "false");
    a.setAttribute("href", url);
    a.setAttribute("target", target);
    a.classList.add("tabHeader", "slds-context-bar__label-action");

    const span = document.createElement("span");
    span.classList.add("title", "slds-truncate");
    span.textContent = tabTitle;

    a.appendChild(span);
    li.appendChild(a);
    return li;
}

function initTabs() {
    let tabs = [
        { tabTitle: "Home", url: "/lightning/page/home", openInNewTab: false },
        {
            tabTitle: "Flow",
            url: "/lightning/setup/Flows/home",
            openInNewTab: true,
        },
        {
            tabTitle: "User",
            url: "/lightning/setup/ManageUsers/home",
            openInNewTab: false,
        },
    ];

    chrome.storage.sync.set({ sfmWhySF: tabs }, function () {
        //TODO combine with popup.js with background service
    });
    return tabs;
}

function addClickEventListeners(tabs) {
    for (const rowId in tabs) {
        let tab = tabs[rowId];
        document.querySelectorAll(`a[href="${tab.url}"]`).forEach((link) => {
            link.addEventListener("click", function (event) {
                if (tab.openInNewTab) {
                    event.preventDefault();
                    window.open(tab.url, "_blank");
                }
            });
        });
    }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // Check if the message contains the action and the necessary tabs data
    if (message.action === "refresh_tabs" && Array.isArray(message.tabs)) {
        refreshTabs(message.tabs); // Pass the received tabs data
        sendResponse({ success: true });
    } else if (message.action === "refresh_tabs") {
        // Handle cases where tabs data might be missing (optional logging)
        console.warn("Received refresh_tabs message but missing tabs data.");
        sendResponse({ success: false, error: "Missing tabs data" });
    }
    // Return true to indicate you wish to send a response asynchronously
    // (although in this specific case, sendResponse is called synchronously)
    return true;
});

// Function to refresh tabs without page reload, using provided data
function refreshTabs(tabsData) {
    const setupTabUl = document.getElementsByClassName(
        "tabBarItems slds-grid"
    )[0];

    if (setupTabUl) {
        // Remove all existing custom tabs
        const customTabs = setupTabUl.querySelectorAll(".why-sf-custom-tab");
        customTabs.forEach((tab) => tab.remove());

        // Generate and append new tab elements from the received data
        for (const tab of tabsData) {
            setupTabUl.appendChild(
                generateRowTemplate(tab.tabTitle, tab.url, tab.openInNewTab)
            );
        }

        // Re-add click listeners for the new tabs
        addClickEventListeners(tabsData);
    } else {
        console.warn("Could not find setupTabUl element to refresh tabs.");
    }
}
