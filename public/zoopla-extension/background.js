chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PROPERTY_CLICKED") {
    chrome.storage.local.set({ lastPropertyUrl: message.url });
  }
});
