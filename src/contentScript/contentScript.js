/**
 * Content script: listens for copy/cut events and sends copied text to background for storage.
 * Handles selections, input/textarea, shadow DOM, and clipboard fallbacks.
 */
(function () {
    let lastCopied = ""; // prevent duplicate sends

    function sendCopied(text) {
        const trimmed = (text || "").trim();
        if (!trimmed || trimmed === lastCopied) return;
        lastCopied = trimmed;

        const clip = {
            id: (Date.now().toString(36) + Math.random().toString(36).slice(2)),
            text: trimmed,
            url: location.href,
            time: Date.now(),
        };
        console.log("clip", clip);

        chrome.runtime.sendMessage({ type: "NEW_COPY", clip }, (response) => {
            if (chrome.runtime.lastError) {
                console.warn("Message failed:", chrome.runtime.lastError.message);
            } else {
                console.log("Message delivered:", response);
            }
        });
    }

    function getSelectedText(e) {
        let text = "";

        try {
            // 1. Normal DOM selection
            const sel = window.getSelection ? window.getSelection().toString() : "";
            if (sel) text = sel;

            // 2. Input/textarea selection
            if (!text && document.activeElement) {
                const el = document.activeElement;
                if (
                    (el.tagName === "INPUT" || el.tagName === "TEXTAREA") &&
                    typeof el.selectionStart === "number"
                ) {
                    text = el.value.substring(el.selectionStart, el.selectionEnd);
                }
            }

            // 3. Shadow DOM selection
            if (!text && document.activeElement && el.shadowRoot) {
                const shadowSel = el.shadowRoot.getSelection
                    ? el.shadowRoot.getSelection().toString()
                    : "";
                if (shadowSel) text = shadowSel;
            }

            // 4. ClipboardData (from copy event)
            if (!text && e && e.clipboardData) {
                const fromClipboard = e.clipboardData.getData("text/plain");
                if (fromClipboard) text = fromClipboard;
            }
        } catch (err) {
            console.warn("Error extracting selection:", err);
        }

        return text;
    }

    // Listen to copy events
    document.addEventListener(
        "copy",
        (e) => {
            let text = getSelectedText(e);

            // 5. Async Clipboard API fallback
            if (!text && navigator.clipboard && navigator.clipboard.readText) {
                navigator.clipboard
                    .readText()
                    .then((t) => {
                        if (t) sendCopied(t);
                    })
                    .catch(() => {
                        // ignore permission errors
                    });
                return;
            }

            if (text) sendCopied(text);
        },
        true
    );

    // Cut event (treat as copy)
    document.addEventListener(
        "cut",
        () => {
            const text = getSelectedText();
            if (text) sendCopied(text);
        },
        true
    );
})();
