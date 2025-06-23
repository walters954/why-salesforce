const STORAGE_KEY = "sfmWhySF";
const TAB_BAR_SELECTOR = ".tabBarItems.slds-grid";
const OM_SELECTOR = 'a[title="Object Manager"]';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const q = (sel, ctx = document) => ctx.querySelector(sel);
const qAll = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const getSyn = (key) => new Promise(res => chrome.storage.sync.get([key], v => res(v[key] || [])));

(async function () {
  const tabs = await (async () => {
    const rows = await getSyn(STORAGE_KEY);
    return rows.length ? rows : initDefaultTabs();
  })();
  const tabBar = await waitForTabBar();
  renderTabs(tabBar, tabs);
})();

function waitForTabBar() {
  return new Promise((resolve) => {
    const ready = () => {
      const ul = q(TAB_BAR_SELECTOR);
      const om = q(OM_SELECTOR, ul || document);
      return ul && om ? ul : null;
    };
    const obs = new MutationObserver(() => {
      const ul = ready();
      if (ul) { obs.disconnect(); resolve(ul); }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    (async () => {
      for (let i = 0; i < 50; i++) {
        const ul = ready();
        if (ul) { obs.disconnect(); return resolve(ul); }
        await sleep(100);
      }
      console.error("Why Salesforce – tab bar / Object Manager not found.");
    })();
  });
}

function renderTabs(ul, tabs) {
  qAll(".why-sf-custom-tab", ul).forEach(li => li.remove());
  const frag = document.createDocumentFragment();
  tabs.forEach(t => frag.appendChild(makeTabLI(t)));
  ul.appendChild(frag);
  ul.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-url]");
    if (!a) return;
    const tab = tabs.find(t => t.url === a.dataset.url);
    if (tab?.openInNewTab) {
      e.preventDefault();
      window.open(tab.url, "_blank");
    }
  }, { capture: true, once: true });
}

function makeTabLI({ tabTitle, url, openInNewTab }) {
  const li = document.createElement("li");
  li.className = "oneConsoleTabItem tabItem slds-context-bar__item borderRight navexConsoleTabItem why-sf-custom-tab";
  li.setAttribute("role", "presentation");
  const a = document.createElement("a");
  a.href = url;
  a.target = openInNewTab ? "_blank" : "_self";
  a.title = tabTitle;
  a.setAttribute("role", "tab");
  a.setAttribute("aria-selected", "false");
  a.className = "tabHeader slds-context-bar__label-action";
  a.dataset.url = url;
  const span = document.createElement("span");
  span.className = "title slds-truncate";
  span.textContent = tabTitle;
  a.appendChild(span);
  li.appendChild(a);
  return li;
}

function initDefaultTabs() {
  const defaultTabs = [
    { tabTitle: "Home", url: "/lightning/page/home", openInNewTab: false },
    { tabTitle: "Flow", url: "/lightning/setup/Flows/home", openInNewTab: true },
    { tabTitle: "User", url: "/lightning/setup/ManageUsers/home", openInNewTab: false },
  ];
  chrome.storage.sync.set({ [STORAGE_KEY]: defaultTabs });
  return defaultTabs;
}

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.action === "refresh_tabs" && Array.isArray(msg.tabs)) {
    const ul = q(TAB_BAR_SELECTOR);
    ul && renderTabs(ul, msg.tabs);
    sendResponse({ success: true });
  } else {
    sendResponse({ success: false, error: "Missing or invalid data" });
  }
  return true;
});
