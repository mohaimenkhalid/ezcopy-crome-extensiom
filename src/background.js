const MAX_ITEMS = 500;

// Initialize storage on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['ezcopy_items'], res => {
    if (!res.ezcopy_items) chrome.storage.local.set({ ezcopy_items: [] });
    setActionText(res.ezcopy_items);
  });
});

// Handle messages from contentScript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'NEW_COPY') {
    const text = message.clip.text?.toString();
    if (!text) { sendResponse({ success: false, reason: "empty" }); return true; }

    chrome.storage.local.get(['ezcopy_items'], res => {
      const arr = res.ezcopy_items || [];
      const last = arr[arr.length - 1];

      if (last && last.text === text && last.url === message.clip.url) {
        sendResponse({ success: false, reason: "duplicate" });
        return;
      }

      arr.push(message.clip);
      while (arr.length > MAX_ITEMS) arr.shift();
      chrome.storage.local.set({ ezcopy_items: arr }, () => sendResponse({ success: true }));
      setActionText(arr);
    });

    return true;
  }

  if (message?.type === 'COPY_TO_CLIPBOARD') {
    const text = message.clip.text || '';
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs.length && tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: (t) => {
            const ta = document.createElement('textarea');
            ta.value = t;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch(e) {}
            document.body.removeChild(ta);
          },
          args: [text]
        });
      }
    });
    sendResponse({ success: true });
    return true;
  }

  return false;
});

// Shortcut listener → only opens popup (no injection)
chrome.commands.onCommand.addListener(command => {
  if(command === 'read_clipboard') {
    // open popup for user gesture clipboard read
    chrome.action.openPopup();
  }
});

const setActionText = (arr) => {
  chrome.action.setBadgeText({ text: arr.length.toString() });
  chrome.action.setBadgeBackgroundColor({ color: "#ed3939" })
}
