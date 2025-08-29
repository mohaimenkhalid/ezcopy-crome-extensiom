/**
 * Content script: listens for copy events and sends copied text to background for storage.
 * Also captures programmatic clipboard writes via 'copy' event when possible.
 */

(function(){
  function sendCopied(text){
    const trimmed = (text || "").trim();
    if (!trimmed) return;

    const clip = {
      id: (Date.now().toString(36) + Math.random().toString(36).slice(2)),
      text: trimmed,
      url: location.href,
      time: Date.now()
    };
    console.log("clip", clip)
    try {
      chrome.runtime.sendMessage({ type: 'NEW_COPY', clip });
    } catch (e) {
      console.warn('Message failed:', e);
    }
  }


  // Listen to copy keyboard/selection events
  document.addEventListener('copy', (e) => {
    try {
      let text = '';
      // try to get selection first
      const sel = window.getSelection && window.getSelection().toString();
      if (sel) text = sel;
      // if clipboardData available on event, try it
      if (!text && e.clipboardData) {
        const fromClipboard = e.clipboardData.getData('text/plain');
        if (fromClipboard) text = fromClipboard;
      }
      // sometimes programmatic copy sets selection; fallback to navigator.clipboard (async)
      if (!text && navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(t => {
          sendCopied(t)
        }).catch(()=> {
          if (text) sendCopied(text)
        })
        return;
      }
      if (text) sendCopied(text)
    } catch(err) {
      console.error('copy capture err', err)
    }
  }, true)

  // Also capture Ctrl/Cmd+C via keydown as an extra layer (best-effort)
  document.addEventListener('keydown', (e) => {
    const isCopy = (e.ctrlKey || e.metaKey) && e.key === 'c'
    if (!isCopy) return
    setTimeout(()=> {
      const sel = window.getSelection && window.getSelection().toString();
      if (sel) sendCopied(sel)
    }, 50)
  })

  // As a last resort, intercept cut as well
  document.addEventListener('cut', (e) => {
    const sel = window.getSelection && window.getSelection().toString();
    if (sel) sendCopied(sel)
  })
})()
