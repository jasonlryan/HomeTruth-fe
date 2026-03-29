const tokenMatch = window.location.hash.match(/access_token=([^&]+)/);
const token = tokenMatch ? tokenMatch[1] : null;

if (token) {
  chrome.storage.local.set({ authToken: token }, () => {
    window.close();
  });
} else {
  console.warn("❌ No token found in URL.");
  window.close();
}
