import { itemDraftKey, readItemDraft, saveItemDraft, clearItemDrafts } from './itemDraft';
beforeEach(() => sessionStorage.clear());
test('unfinished records are isolated by account, home and item and cleared on logout', () => {
  const key = itemDraftKey('one', 42, 7);
  saveItemDraft(key, {
    mode: 'edit',
    draft: {
      name: 'Private item'
    }
  });
  expect(readItemDraft(key).draft.name).toBe('Private item');
  expect(readItemDraft(itemDraftKey('two', 42, 7))).toBeNull();
  expect(readItemDraft(itemDraftKey('one', 43, 7))).toBeNull();
  clearItemDrafts();
  expect(readItemDraft(key)).toBeNull();
});
test('expired drafts cannot resume', () => {
  const key = itemDraftKey('one', 42, null);
  sessionStorage.setItem(key, JSON.stringify({
    mode: 'confirm',
    savedAt: Date.now() - 86400001
  }));
  expect(readItemDraft(key)).toBeNull();
});
