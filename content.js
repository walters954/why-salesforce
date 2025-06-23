// content.js  –  fast-load version (single file)
const STORAGE_KEY       = "sfmWhySF";
const TAB_BAR_SELECTOR  = ".tabBarItems.slds-grid";

/* ---------- tiny helpers ---------- */
const sleep  = (ms) => new Promise(r => setTimeout(r, ms));
const q      = (sel, ctx=document) => ctx.querySelector(sel);
const qAll   = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
const getSyn = (key) =>
  new Promise(res => chrome.storage.sync.get([key], v => res(v[key] || [])));

/* ---------- entry point ---------- */
(async function bootstrap() {
  // grab stored tabs right away
  const tabs = await (async () => {
    const rows = await getSyn(STORAGE_KEY);
    return rows.length ? rows : initDefaultTabs();
  })();

  // wait for the Salesforce tab bar, then inject
  const tabBar = await waitForTabBar();
  renderTabs(tabBar, tabs);
})();

/* ---------- DOM waiting ---------- */
function waitForTabBar() {
  return new Promise((resolve) => {
    // 1. MutationObserver – fires as soon as the UL appears
    const obs = new MutationObserver(() => {
      const el = q(TAB_BAR_SELECTOR);
      if (el) { obs.disconnect(); resolve(el); }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });

    // 2. Fallback – 100 ms polling for up to 5 s
    (async () => {
      for (let i = 0; i < 50; i++) {
        const el = q(TAB_BAR_SELECTOR);
        if (el) { obs.disconnect(); return resolve(el); }
        await sleep(100);
      }
      console.error("Why Salesforce – tab bar not found.");
    })();
  });
}

/* ---------- rendering ---------- */
function renderTabs(ul, tabs) {
  // remove any old custom tabs
  qAll(".why-sf-custom-tab", ul).forEach(li => li.remove());

  // build fragment to minimise reflows
  const frag = document.createDocumentFragment();
  tabs.forEach(t => frag.appendChild(makeTabLI(t)));
  ul.appendChild(frag);

  // delegated click handler (added once)
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
  li.className =
    "oneConsoleTabItem tabItem slds-context-bar__item borderRight " +
    "navexConsoleTabItem why-sf-custom-tab";
  li.setAttribute("role", "presentation");

  const a  = document.createElement("a");
  a.href   = url;
  a.target = openInNewTab ? "_blank" : "_self";
  a.title  = tabTitle;
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

/* ---------- defaults & helpers ---------- */
function initDefaultTabs() {
  const defaultTabs = [
    { tabTitle: "Home", url: "/lightning/page/home",              openInNewTab: false },
    { tabTitle: "Flow", url: "/lightning/setup/Flows/home",       openInNewTab: true  },
    { tabTitle: "User", url: "/lightning/setup/ManageUsers/home", openInNewTab: false },
  ];
  chrome.storage.sync.set({ [STORAGE_KEY]: defaultTabs });
  return defaultTabs;
}

/* ---------- message from popup ---------- */
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
