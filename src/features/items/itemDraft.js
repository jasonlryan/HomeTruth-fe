const prefix = 'hometruth:item-draft:v1:';
export const itemDraftKey = (owner, home, item) => `${prefix}${encodeURIComponent(owner)}:${home}:${item || 'new'}`;
export function readItemDraft(key) {
  try {
    const d = JSON.parse(sessionStorage.getItem(key) || 'null');
    return d && Date.now() - d.savedAt < 86400000 && ['identify', 'confirm', 'edit'].includes(d.mode) ? d : null;
  } catch {
    return null;
  }
}
export function saveItemDraft(key, draft) {
  try {
    sessionStorage.setItem(key, JSON.stringify({
      ...draft,
      savedAt: Date.now()
    }));
  } catch {/* Saved server records remain authoritative when tab storage is unavailable. */}
}
export function clearItemDraft(key) {
  try {
    sessionStorage.removeItem(key);
  } catch {}
}
export function clearItemDrafts() {
  try {
    Object.keys(sessionStorage).filter(k => k.startsWith(prefix)).forEach(k => sessionStorage.removeItem(k));
  } catch {}
}
