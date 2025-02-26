
// Load shortcuts initially
let shortcuts = {};
chrome.storage.local.get("shortcuts", (result) => {
  shortcuts = result.shortcuts || {};
});

// Listen for changes in storage to keep shortcuts updated
chrome.storage.onChanged.addListener((changes) => {
  if (changes.shortcuts) {
    shortcuts = changes.shortcuts.newValue || {};
  }
});

/**
 * Extracts the last word starting with "/" or "#" from a string.
 */
function processString(s) {
  let shortcutCandidate = "";
  for (let i = s.length - 1; i >= 0; i--) {
    const char = s[i];
    shortcutCandidate = char + shortcutCandidate;
    if (char === "/" || char === "#") {
      break;
    }
  }
  return shortcutCandidate.charAt(0) === "/" || shortcutCandidate.charAt(0) === "#" ? shortcutCandidate : "";
}

/**
 * Replaces the shortcut in input or textarea fields.
 */
function replaceInInput(snippet) {
  const el = document.activeElement;
  const start = el.selectionStart;
  const valueBeforeCaret = el.value.slice(0, start);
  const lastWord = processString(valueBeforeCaret);
  
  if (lastWord) {
    const newValue = valueBeforeCaret.slice(0, -lastWord.length) + snippet + el.value.slice(start);
    el.value = newValue;

    // Move cursor to correct position
    const newCursorPos = start - lastWord.length + snippet.length;
    el.setSelectionRange(newCursorPos, newCursorPos);
  }
}

/**
 * Replaces the shortcut in contenteditable elements.
 */
function replaceInContentEditable(snippet) {

    const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const textNode = range.startContainer;
  const offset = range.startOffset;

  const textBeforeCaret = textNode.textContent.slice(0, offset);
  const lastWord = processString(textBeforeCaret);
   // Replace last word with snippet
   const newText = textBeforeCaret.slice(0, -lastWord.length) + snippet + textNode.textContent.slice(offset);
   textNode.textContent = newText;

   // Update cursor position after inserted snippet
   const newOffset = textBeforeCaret.length - lastWord.length + snippet.length;
   range.setStart(textNode, newOffset);
   range.collapse(true);

   selection.removeAllRanges();
   selection.addRange(range);
  
}

// Listen for messages from background or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "finalString" && message.text) {
    const snippet = message.text;
    const tagName = document.activeElement.tagName.toLowerCase();
    console.log(snippet);
    if (tagName === "input" || tagName === "textarea") {
      replaceInInput(snippet);
    } else {
      replaceInContentEditable(snippet);
    }
  }
});

/**
 * Checks if the last word typed is a shortcut and replaces it.
 */
function checkAndReplaceShortcut(el) {
  const tagName = el.tagName.toLowerCase();
  let lastWord = "";

  if (tagName === "input" || tagName === "textarea") {
    const start = el.selectionStart;
    lastWord = processString(el.value.slice(0, start));
  } else {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    const offset = range.startOffset;
    lastWord = processString(textNode.textContent.slice(0, offset));
  }

  if (shortcuts.hasOwnProperty(lastWord)) {
    const snippet = shortcuts[lastWord];
    if (lastWord[0] === "#") {
      chrome.runtime.sendMessage({ action: "openPopup", text: snippet });
    } else {
      tagName === "input" || tagName === "textarea" ? replaceInInput(snippet) : replaceInContentEditable(snippet);
    }
  }
}

// Listen for input events
document.addEventListener("input", (event) => {
  checkAndReplaceShortcut(event.target);
});
