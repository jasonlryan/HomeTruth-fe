import { demoEntryEnabled, startDemoSession } from './demoEntry';
const original = { ...process.env };
beforeEach(() => {
  process.env.REACT_APP_HOMEOWNER_DEMO = 'true';
  process.env.REACT_APP_DEMO_PASSWORD = 'synthetic-password';
  process.env.REACT_APP_API_BASE_URL = 'http://localhost:8005';
  localStorage.clear();
  global.fetch = jest.fn();
});
afterAll(() => { process.env = original; });
test('entry requires explicit configuration and loopback host', () => {
  expect(demoEntryEnabled('localhost')).toBe(true);
  expect(demoEntryEnabled('example.com')).toBe(false);
  delete process.env.REACT_APP_DEMO_PASSWORD;
  expect(demoEntryEnabled('localhost')).toBe(false);
});
test('never sends demo credentials to a remote API', async () => {
  process.env.REACT_APP_API_BASE_URL = 'https://example.com';
  await expect(startDemoSession()).rejects.toThrow('local API');
  expect(fetch).not.toHaveBeenCalled();
});
test('failed authentication cannot create a session', async () => {
  fetch.mockResolvedValue({ ok: false, json: async () => ({}) });
  await expect(startDemoSession()).rejects.toThrow('Could not open');
  expect(localStorage.getItem('token')).toBeNull();
});
test('only the synthetic homeowner can create a session', async () => {
  fetch.mockResolvedValue({ ok: true, json: async () => ({ data: { token: 'test', user: { email: 'other@example.com' } } }) });
  await expect(startDemoSession()).rejects.toThrow('Could not open');
  expect(localStorage.getItem('token')).toBeNull();
});
