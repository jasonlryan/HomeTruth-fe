import { adoptGuestJourney, clearJourney, consumeJourneyQuestion, journeyQuestionForProperty, readJourney, safeReturnTo, writeJourney } from './context';
beforeEach(() => { sessionStorage.clear(); });
test('accepts only an internal known task destination', () => {
  expect(safeReturnTo('/my-home/connected-devices')).toBe('/my-home/connected-devices');
  for (const destination of ['//evil.example', '/\\evil.example', 'https://evil.example', '/unknown', '/my-home/%2f%2fevil', '/my-home/../admin']) expect(safeReturnTo(destination)).toBeNull();
});
test('guest draft can be adopted once; another account cannot read it', () => {
  writeJourney('guest', { intent: 'sell', returnTo: '/documents', question: 'Private sale question' });
  expect(adoptGuestJourney('12')).toMatchObject({ owner: '12', intent: 'sell', returnTo: '/documents' });
  expect(readJourney('13')).toBeNull();
  expect(readJourney('12')).toBeNull();
});
test('changing property or goal clears a stale question and retains no inferred access', () => {
  writeJourney('1', { intent: 'manage', propertyId: 42, question: 'Question about home 42', returnTo: '/my-home' });
  expect(writeJourney('1', { propertyId: 43 }).question).toBe('');
  writeJourney('1', { question: 'Home 43' });
  expect(writeJourney('1', { intent: 'buy', propertyId: null }).question).toBe('');
});
test('consuming a question preserves the task and prevents later replay', () => {
  writeJourney('1', { intent: 'buy', question: 'Survey question', returnTo: '/buying' });
  expect(consumeJourneyQuestion('1')).toBe('Survey question');
  expect(consumeJourneyQuestion('1')).toBe('');
  expect(readJourney('1').returnTo).toBe('/buying');
  clearJourney(); expect(readJourney('1')).toBeNull();
});

test('reauthentication of the same account retains its task without adopting another account', () => {
  writeJourney('1', { intent:'sell',returnTo:'/selling' });
  expect(adoptGuestJourney('1').returnTo).toBe('/selling');
  expect(adoptGuestJourney('2')).toBeNull();
});

test('existing protected destinations remain resumable without opening arbitrary redirects', () => {
  for (const path of ['/settings/preferences','/budget-chat','/budget/view/12','/saved-notes','/partner-programmes']) expect(safeReturnTo(path)).toBe(path);
});
test('a question from another property cannot prefill an unrelated chat', () => {
  writeJourney('1',{intent:'manage',propertyId:42,question:'Home 42 private question'});
  expect(journeyQuestionForProperty('1',43)).toBe('');
  expect(journeyQuestionForProperty('1',null)).toBe('');
  expect(journeyQuestionForProperty('1',42)).toBe('Home 42 private question');
});
