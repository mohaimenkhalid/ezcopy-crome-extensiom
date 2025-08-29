/**
 * Background service worker: receives NEW_COPY messages and stores them in chrome.storage.local
 * Keeps a list (max 500) with timestamp, id, url, title.
 */

const MAX_ITEMS = 500;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['ezcopy_items'], (res) => {
    if (!res.ezcopy_items) {
      chrome.storage.local.set({ ezcopy_items: [] });
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'NEW_COPY') {
    const text = message.clip.text && message.clip.text.toString();
    if (!text) return;

    chrome.storage.local.get(['ezcopy_items'], (res) => {
      const arr = res.ezcopy_items || [];

      // avoid duplicates if identical most recent
      const last = arr[arr.length - 1];
      if (last && last.text === text && last.url === message.clip.url) return;

      // create clip object like your old code
      const clip = {
        id: (self.crypto && crypto.randomUUID) ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2)),
        text: text,
        url: message.clip.url || '',
        title: message.clip.title || '',
        time: Date.now()
      };

      arr.push(clip);

      // trim
      while (arr.length > MAX_ITEMS) arr.shift();

      chrome.storage.local.set({ ezcopy_items: arr });
    });

  } else if (message?.type === 'COPY_TO_CLIPBOARD') {
    const text = message.clip.text || '';
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
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
    });
  }
});
