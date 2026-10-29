// A task draft belongs to this tab and one account. It is not an access grant.
const KEY = 'hometruth:journey:v1';
const INTENTS = new Set(['buy', 'sell', 'manage', 'ask']);
const RETURN_PATH = /^\/(?:start|welcome|dashboard|buying|selling|documents|property-profile|ask-ai|saved-notes|home|quiz|complete-profile|extension|bookmarked|partner-programmes|budget(?:-chat|-calculator|\/view\/[A-Za-z0-9-]+)?|my-home(?:\/(?:details|items|connected-devices|maintenance|value|performance))?|settings\/(?:connections|agents|account|preferences|notifications|data-privacy))$/;

export function safeReturnTo(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value)) return null;
  try {
    const url = new URL(value, 'https://hometruth.invalid');
    return url.origin === 'https://hometruth.invalid' && RETURN_PATH.test(url.pathname)
      ? `${url.pathname}${url.search}` : null;
  } catch { return null; }
}

export function journeyOwner(user) {
  return user ? String(user.id || user.email || localStorage.getItem('userId') || 'signed-in') : 'guest';
}
export function clearJourney() {
  try { sessionStorage.removeItem(KEY); } catch { /* Storage may be unavailable. */ }
}
function rawJourney() {
  try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { return null; }
}
export function readJourney(owner = 'guest') {
  const draft = rawJourney();
  if (!draft || draft.owner !== owner || !INTENTS.has(draft.intent)) {
    if (draft && draft.owner !== owner) clearJourney();
    return null;
  }
  return {
    owner, intent: draft.intent,
    returnTo: safeReturnTo(draft.returnTo) || '/start',
    question: typeof draft.question === 'string' ? draft.question.slice(0, 4000) : '',
    propertyId: Number.isSafeInteger(draft.propertyId) && draft.propertyId > 0 ? draft.propertyId : null,
  };
}
export function writeJourney(owner, changes) {
  const previous = readJourney(owner);
  const intent = INTENTS.has(changes.intent) ? changes.intent : previous?.intent || 'ask';
  const next = {
    owner, intent,
    returnTo: safeReturnTo(changes.returnTo) || previous?.returnTo || '/start',
    question: String(changes.question ?? previous?.question ?? '').slice(0, 4000),
    propertyId: changes.propertyId === undefined ? previous?.propertyId || null : changes.propertyId,
  };
  if (previous?.intent !== intent || previous?.propertyId !== next.propertyId) {
    // Switching contexts must never silently carry the last home's question.
    if (changes.question === undefined) next.question = '';
  }
  try { sessionStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Navigation still works without storage. */ }
  return next;
}
export function adoptGuestJourney(owner) {
  const draft = rawJourney();
  if (draft?.owner === owner) return readJourney(owner);
  if (!draft || draft.owner !== 'guest') {
    if (draft?.owner !== owner) clearJourney();
    return null;
  }
  try { sessionStorage.setItem(KEY, JSON.stringify({ ...draft, owner })); } catch { return null; }
  return readJourney(owner);
}
export function consumeJourneyQuestion(owner) {
  const draft = readJourney(owner);
  if (!draft?.question) return '';
  writeJourney(owner, { question: '' });
  return draft.question;
}
export const HOME_DESTINATIONS = [
  { path: '/my-home/details', label: 'Home details', description: 'See the details and evidence for the home you select.' },
  { path: '/my-home/items', label: 'Appliances, devices and systems', description: 'Keep model information, manuals, warranties and history together.' },
  { path: '/my-home/connected-devices', label: 'Connected devices', description: 'See which equipment can supply information about your home.' },
  { path: '/documents', label: 'Documents and records', description: 'Add and find receipts, warranties, certificates and other records.' },
  { path: '/my-home/maintenance', label: 'Maintenance and repairs', description: 'Review recorded issues, service information and follow-up actions.' },
  { path: '/my-home/value', label: 'Costs and value', description: 'Keep purchase prices, estimates and repair costs distinct.' },
  { path: '/my-home/performance', label: 'Home performance', description: 'Understand your home’s energy use, running costs and changes that may need attention.' },
  { path: '/ask-ai', label: 'AskAI', description: 'Ask a question using the context you choose.' },
];
export const GOAL_LABELS = { buy: 'Buying a home', sell: 'Selling a home', manage: 'Managing my home', ask: 'AskAI' };
export function goalHome(intent) {
  return ({ buy: '/buying', sell: '/selling', manage: '/my-home' })[intent] || '/start';
}

export function journeyQuestionForProperty(owner, propertyId = null) {
  const draft = readJourney(owner);
  return draft?.propertyId === propertyId ? draft.question : '';
}
