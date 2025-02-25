document.addEventListener("DOMContentLoaded", () => {
    const shortcutsList = document.getElementById("shortcuts-list");
    const newShortcutInput = document.getElementById("newShortcut");
    const newSnippetInput = document.getElementById("newSnippet");
    const addShortcutButton = document.getElementById("addShortcut");

    // Load saved shortcuts from chrome.storage.local when the page loads
    chrome.storage.local.get("shortcuts", (result) => {
        const savedShortcuts = result.shortcuts || {};
        console.log(savedShortcuts);
        renderShortcuts(savedShortcuts);
    });

    // Function to update shortcuts in chrome.storage.local and re-render UI
    function updateChromeStorageShortcuts(newShortcut, newSnippet) {
        // Retrieve existing shortcuts from chrome.storage.local
        chrome.storage.local.get("shortcuts", (result) => {
            let shortcuts = result.shortcuts || {};

            // Update the shortcut with the new snippet
            shortcuts[newShortcut] = newSnippet;

            // Save the updated shortcuts back to chrome.storage.local
            chrome.storage.local.set({ shortcuts: shortcuts }, () => {
                // Re-render the UI with the updated shortcuts
                renderShortcuts(shortcuts);

                // Clear input fields
                newShortcutInput.value = "";
                newSnippetInput.value = "";
            });
        });
    }

    // Function to render shortcuts in the UI
    function renderShortcuts(shortcuts) {
        shortcutsList.innerHTML = "";  // Clear the existing list
        console.log(shortcuts);
        // Iterate through each shortcut and display it in the UI
        Object.entries(shortcuts).forEach(([key, value]) => {
            const item = document.createElement("div");
            item.className = "shortcut-item";

            // Create input for shortcut
            const shortcutInput = document.createElement("input");
            shortcutInput.type = "text";
            shortcutInput.value = key;
            shortcutInput.readOnly = true;

            // Create input for snippet
            const snippetInput = document.createElement("input");
            snippetInput.type = "text";
            snippetInput.value = value;

            // Event listener for snippet input change
            snippetInput.addEventListener("input", () => {
                updateChromeStorageShortcuts(key, snippetInput.value);
            });

            // Create delete button
            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-btn";
            deleteButton.innerText = "X";

            // Event listener for delete button
            deleteButton.addEventListener("click", () => {
                chrome.storage.local.get("shortcuts", (result) => {
                    let shortcuts = result.shortcuts || {};
                    delete shortcuts[key];  // Delete the shortcut
                    chrome.storage.local.set({ shortcuts: shortcuts }, () => {
                        
                        renderShortcuts(shortcuts);  // Re-render after deletion
                    });
                });
            });

            // Append inputs and delete button to shortcut item
            item.appendChild(shortcutInput);
            item.appendChild(snippetInput);
            item.appendChild(deleteButton);

            // Append shortcut item to the list
            shortcutsList.appendChild(item);
        });
    }

    // Event listener for adding a new shortcut
    addShortcutButton.addEventListener("click", () => {
        const newShortcut = newShortcutInput.value.trim();
        const newSnippet = newSnippetInput.value.trim();

        // Validate input
        if (newShortcut && newSnippet) {
            updateChromeStorageShortcuts(newShortcut, newSnippet);
        }
    });
});
