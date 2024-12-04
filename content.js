const storageKeySettings = "sfmWhySF_settings";
const storageKeyTabs     = "sfmWhySF_tabs";
const isSetup            = window.location.pathname.indexOf('/lightning/setup/') != -1;
let settings;

runOrSkip();

function runOrSkip() {
    chrome.storage.sync.get([storageKeySettings], function (items) {
        settings = items[storageKeySettings] || {};
        Object.defineProperty(settings, 'displayOnTop', { get() {return !isSetup || this.tabsOnTopInSetup;} });

        // console.log('SETTINGS: ', settings);

        let run = (isSetup && settings.showInSetup) || (!isSetup && settings.showInFront);

        if (run) {
            setTimeout(function () {
                delayLoadSetupTabs(0);
            }, 1000);
        }
    });
}

function delayLoadSetupTabs(count) {
    const insertionElement = settings.displayOnTop ? document.getElementById('oneHeader') : document.getElementsByClassName("tabBarItems slds-grid")[0];
    count++;

    if (count > 5) {
        console.log("Why Salesforce - failed to find insertion point.");
        return;
    }

    if (!insertionElement) {
        setTimeout(function () {
            delayLoadSetupTabs(count);
        }, 3000);
    } else {
        init(insertionElement);
    }
}
    function init(insertionElement) {
        if (insertionElement) {
            let tabs = [];
            chrome.storage.sync.get([storageKeyTabs], function (items) {
                let tabsData = items[storageKeyTabs] || [];

                if (tabsData.length === 0) {
                    //Did not find data inside browser storage
                    tabsData = initTabs();
                }

                tabsData.forEach(tabData => {
                    tabs.push(
                        generateRowTemplate(tabData.tabTitle, tabData.url, tabData.openInNewTab)
                    );
                });

                let insertionPosition = settings.displayOnTop ? "afterbegin" : "beforeend";
                insertionElement.insertAdjacentHTML(insertionPosition, content(tabs));

                // Add click event listeners after rows are inserted
                addClickEventListeners();
            });
        }
    }
        function initTabs() {
            let tabs = [
                { tabTitle: "Home", url: "/", openInNewTab: false },
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

            chrome.storage.sync.set({ sfmWhySF_tabs: tabs }, function () {
                //TODO combine with popup.js with background service
            });
            return tabs;
        }
        function generateRowTemplate(tabTitle, url, openInNewTab) {
            const target = openInNewTab ? "_blank" : "_self";

            return `<li role="presentation" class="oneConsoleTabItem tabItem slds-context-bar__item borderRight navexConsoleTabItem" style="height:36px" data-aura-class="navexConsoleTabItem" data-url="${url}">
                        <a role="tab" tabindex="-1" title="${tabTitle}" aria-selected="false" href="${url}" target="${target}" class="tabHeader slds-context-bar__label-action">
                            <span class="title slds-truncate">${tabTitle}</span>
                        </a>
                    </li>`;
        }
        function content(tabs) {
            let allTabs = tabs.join("");
            let styles = [`background-color:${settings.backgroundColor || 'white'}`,
                          'border-bottom:1px solid lightgray',
                          `color:${settings.fontColor || 'black'}`];
            if (settings.extraUlStyles) {styles.push(settings.extraUlStyles);}

            return !settings.displayOnTop ? allTabs : `<ul class="slds-grid" style="${styles.join(';')}">${allTabs}</ul>`;
        }
        function addClickEventListeners() {
            chrome.storage.sync.get([storageKeyTabs], function (items) {
                const rowObj = items[storageKeyTabs] || [];
                for (const rowId in rowObj) {
                    let tab = rowObj[rowId];
                    document
                        .querySelectorAll(`a[href="${tab.url}"]`)
                        .forEach((link) => {
                            link.addEventListener("click", function (event) {
                                if (tab.openInNewTab) {
                                    event.preventDefault();
                                    window.open(tab.url, "_blank");
                                }
                            });
                        });
                }
            });
        }
