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
