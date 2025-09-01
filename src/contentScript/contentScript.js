/**
 * Content script: listens for copy events and sends copied text to background for storage.
 * Also captures programmatic clipboard writes via 'copy' event when possible.
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

  // Listen to copy events
  document.addEventListener(
      "copy",
      (e) => {
        let text = "";

        try {
          // selection
          const sel = window.getSelection ? window.getSelection().toString() : "";
          console.log("text:", sel);
          if (sel) text = sel;

          // clipboardData
          if (!text && e.clipboardData) {
            const fromClipboard = e.clipboardData.getData("text/plain");
            if (fromClipboard) text = fromClipboard;
          }
        } catch (_) {
          // ignore selection errors
        }

        // async fallback
        if (!text && navigator.clipboard && navigator.clipboard.readText) {
          navigator.clipboard
              .readText()
              .then((t) => {
                  console.log("text1:", t);
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


  // Cut event
  document.addEventListener("cut", () => {
    const sel = window.getSelection && window.getSelection().toString();
    if (sel) sendCopied(sel);
  });

})();
