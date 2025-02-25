const GOOGLE_ORIGIN = 'https://www.google.com';



chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

  let storedString = ""; // Store the string to pass to popup

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "openPopup") {
        storedString = message.text; // Store the string

        let popupUrl = chrome.runtime.getURL("popup.html");

        // Open the popup
        chrome.windows.create({
            url: popupUrl,
            type: "popup",
            width: 350,
            height: 400
        });
    } else if (message.action === "finalString") {
        // Send final text to content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "finalString", text: message.text });
        });
    }
});

// Allow popup to request storedString
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getStoredString") {
        sendResponse({ text: storedString });
    }
});


// chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
//   if (!tab.url) return;
//   const url = new URL(tab.url);
//   // Enables the side panel on google.com
//   if (url.origin === GOOGLE_ORIGIN) {
//     await chrome.sidePanel.setOptions({
//       tabId,
//       path: 'sidepanel.html',
//       enabled: true
//     });
//   } else {
//     // Disables the side panel on all other sites
//     await chrome.sidePanel.setOptions({
//       tabId,
//       path: 'sidepanel.html',
//       enabled: true
//     });
//   }
// });
// Allows users to open the side panel by clicking on the action toolbar icon
// chrome.runtime.onMessage.addListener((message, sender) => {
//     // The callback for runtime.onMessage must return falsy if we're not sending a response
//     (async () => {
//       if (message.type === 'open_side_panel') {
//         // This will open a tab-specific side panel only on the current tab.
//         await chrome.sidePanel.open({ tabId: sender.tab.id });
//         await chrome.sidePanel.setOptions({
//           tabId: sender.tab.id,
//           path: 'sidepanel-tab.html',
//           enabled: true
//         });
//       }
//     })();
//   });
  
//   chrome.contextMenus.onClicked.addListener((info, tab) => {
//     if (info.menuItemId === 'openSidePanel') {
//       // This will open the panel in all the pages on the current window.
//       chrome.sidePanel.open({ windowId: tab.windowId });
//     }
//   });
  
//   chrome.runtime.onMessage.addListener((message, sender) => {
//     // The callback for runtime.onMessage must return falsy if we're not sending a response
//     (async () => {
//       if (message.type === 'open_side_panel') {
//         // This will open a tab-specific side panel only on the current tab.
//         await chrome.sidePanel.open({ tabId: sender.tab.id });
//         await chrome.sidePanel.setOptions({
//           tabId: sender.tab.id,
//           path: 'sidepanel-tab.html',
//           enabled: true
//         });
//       }
//     })();
//   });