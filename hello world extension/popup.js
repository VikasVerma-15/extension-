document.addEventListener("DOMContentLoaded", function () {
    // Request stored string from background script
    chrome.runtime.sendMessage({ action: "getStoredString" }, function (response) {
        let templateString = response.text || "Default text with {%data}.";

        let container = document.getElementById("dynamicInputs");
        let parts = templateString.split(/{%data}/g);
        let inputs = [];

        for (let i = 0; i < parts.length; i++) {
            container.appendChild(document.createTextNode(parts[i]));
            if (i < parts.length - 1) {
                let input = document.createElement("input");
                input.type = "text";
                input.placeholder = "Enter value";
                inputs.push(input);
                container.appendChild(input);
            }
        }

        document.getElementById("insertBtn").addEventListener("click", function () {
            let finalString = "";
            let inputIndex = 0;

            for (let i = 0; i < parts.length; i++) {
                finalString += parts[i];
                if (i < parts.length - 1) {
                    finalString += inputs[inputIndex].value || "{%data}";
                    inputIndex++;
                }
            }

            // Send final string back to background script
            chrome.runtime.sendMessage({ action: "finalString", text: finalString });

            // Close the popup
            window.close();
        });
    });
});
