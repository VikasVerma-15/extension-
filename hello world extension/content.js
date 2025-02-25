// /**
//  * content.js
//  *
//  * Listens for input events on text fields and textareas,
//  * detects if a shortcut (word starting with "/") is typed,
//  * and replaces it with the corresponding snippet.
//  */

// // console.log("Content script loaded");

// let shortcuts = {};
// chrome.storage.local.get("shortcuts", (result) => {
//  shortcuts = result.shortcuts || {};
// });


// /**
//  * Extracts the last "word" that starts with a slash from the provided string.
//  *
//  * @param {string} s - The string to process.
//  * @returns {string} - The shortcut (e.g., "/v") if found; otherwise, an empty string.
//  */
// function processString(s) {
//   let shortcutCandidate = "";
  
//   // Traverse the string backward.
//   for (let i = s.length - 1; i >= 0; i--) {
//     const char = s[i];
    
//     // Prepend the character since we're scanning backward.
//     shortcutCandidate = char + shortcutCandidate;
//     if (char === "/" || char === "#") {
//       break;
//     }
//   }
  
//   // Check that the candidate indeed starts with a slash.
//   if (shortcutCandidate.charAt(0) === "/" || shortcutCandidate.charAt(0) === "#") {
//     return shortcutCandidate;
//   }
//   return "";
// }

// /**
//  * Checks the input field or textarea to see if the text immediately preceding
//  * the caret matches any defined shortcut. If a match is found, it replaces the
//  * shortcut with the corresponding snippet.
//  *
//  * @param {HTMLInputElement|HTMLTextAreaElement} el - The text field element.
//  */
// let snippet = "";
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log("hi there from content script");
//   if (message.action === "finalString" && message.text) {
//     // Assuming you need to replace "/o" dynamically
//     snippet = message.text;
  
//     console.log(message.text);
//     const tagName = document.activeElement.tagName.toLowerCase();
//    if (tagName === "input" || tagName === "textarea") {
//     replace1();
//    }else replace2();
//   }
// });

// function replace1()
// {
//   snippet = message.text;
//     const el = document.activeElement;
//     const start = el.selectionStart;
//     const valueBeforeCaret = el.value.slice(0, start);
//     const lastWord = processString(valueBeforeCaret);
//   const newValue = valueBeforeCaret.slice(0, -lastWord.length) + snippet + el.value.slice(start);
//       el.value = newValue;
//       console.log(newValue);
//       // Move the cursor to the end of the inserted snippet
//       const newCursorPos = start - lastWord.length + snippet.length;
//       el.setSelectionRange(newCursorPos, newCursorPos);
// }
// function replace2()
// {
//   const selection = window.getSelection();
//   if (!selection.rangeCount) return;

//   const range = selection.getRangeAt(0);
//   const textNode = range.startContainer;
//   const offset = range.startOffset;

//   const textBeforeCaret = textNode.textContent.slice(0, offset);
//   const lastWord = processString(textBeforeCaret);
//    // Replace last word with snippet
//    const newText = textBeforeCaret.slice(0, -lastWord.length) + snippet + textNode.textContent.slice(offset);
//    textNode.textContent = newText;

//    // Update cursor position after inserted snippet
//    const newOffset = textBeforeCaret.length - lastWord.length + snippet.length;
//    range.setStart(textNode, newOffset);
//    range.collapse(true);

//    selection.removeAllRanges();
//    selection.addRange(range);
// }
// function checkAndReplaceShortcut(el) { 
//   const tagName = el.tagName.toLowerCase();

//    if (tagName === "input" || tagName === "textarea") {
//     // Handle input and textarea elements
//     const start = el.selectionStart;
//     const valueBeforeCaret = el.value.slice(0, start);
//     const lastWord = processString(valueBeforeCaret);

//     if (shortcuts.hasOwnProperty(lastWord)) {
//       snippet = shortcuts[lastWord];
//       if(lastWord[0] === "#") {
//         chrome.runtime.sendMessage({ action: "openPopup", text: snippet });
//       }else{
//         replace1();
//       }
//     }
//   } else {
//     // Handle contenteditable elements
//     const selection = window.getSelection();
//     if (!selection.rangeCount) return;

//     const range = selection.getRangeAt(0);
//     const textNode = range.startContainer;
//     const offset = range.startOffset;

//     const textBeforeCaret = textNode.textContent.slice(0, offset);
//     const lastWord = processString(textBeforeCaret);

//     if (shortcuts.hasOwnProperty(lastWord)) {
//       snippet = shortcuts[lastWord];
//       if(lastWord[0] === "#")
//       {
//         chrome.runtime.sendMessage({ action: "openPopup", text: snippet }); 
//       }else{
//         replace2();
//       }
//     }
//   }
// }

// document.addEventListener("input", (event) => {
//   const target = document.activeElement;
//   // console.log("hi there");
//   // console.log(shortcuts);
//   chrome.storage.local.get("shortcuts", (result) => {
//     shortcuts = result.shortcuts || {};
//    });
//   checkAndReplaceShortcut(target);
// });
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
