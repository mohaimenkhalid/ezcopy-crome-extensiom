const MAX_ITEMS = 500;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'NEW_COPY') {
    const text = message.clip.text && message.clip.text.toString();
    if (!text) {
      sendResponse({ success: false, reason: "empty text" });
      return true; // connection open
    }

    chrome.storage.local.get(['ezcopy_items'], (res) => {
      const arr = res.ezcopy_items || [];

      const last = arr[arr.length - 1];
      if (last && last.text === text && last.url === message.clip.url) {
        sendResponse({ success: false, reason: "duplicate" });
        return; // এখানে return করলেও safe
      }

      // const clip = {
      //   id: (self.crypto && crypto.randomUUID) ? crypto.randomUUID()
      //       : (Date.now().toString(36) + Math.random().toString(36).slice(2)),
      //   text: text,
      //   url: message.clip.url || '',
      //   title: message.clip.title || '',
      //   time: Date.now()
      // };

      arr.push(message.clip);
      while (arr.length > MAX_ITEMS) arr.shift();

      chrome.storage.local.set({ ezcopy_items: arr }, () => {
        sendResponse({ success: true });
      });
    });

    return true; // async response
  }
  else if (message?.type === 'COPY_TO_CLIPBOARD') {
    const text = message.clip.text || '';
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
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
