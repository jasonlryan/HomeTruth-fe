import { demoReturnTo, localMayaEntry, mayaHomeDestination, startDemoSession } from './demoEntry';
import * as localDemo from './localDemo';

const original = { ...process.env };
beforeEach(() => {
  process.env.NODE_ENV = 'development';
  process.env.REACT_APP_HOMEOWNER_DEMO = 'true';
  process.env.REACT_APP_LOCAL_APPLIANCE_FLOW = 'true';
  process.env.REACT_APP_LOCAL_DEMO_PORT = window.location.port;
  localStorage.clear();
  global.fetch = jest.fn();
});
afterEach(() => { process.env = { ...original }; jest.restoreAllMocks(); });

test('the demo origin requires a loopback host and the configured port in development', () => {
  process.env.REACT_APP_LOCAL_DEMO_PORT = '3018';
  expect(localDemo.isLocalDemoOrigin({ hostname: 'localhost', port: '3018' })).toBe(true);
  expect(localDemo.isLocalDemoOrigin({ hostname: '127.0.0.1', port: '3014' })).toBe(false);
  expect(localDemo.isLocalDemoOrigin({ hostname: 'demo.example.com', port: '3018' })).toBe(false);
  process.env.NODE_ENV = 'production';
  expect(localDemo.isLocalDemoOrigin({ hostname: 'localhost', port: '3018' })).toBe(false);
});

test('outside demo configuration the browser sends no login request', async () => {
  delete process.env.REACT_APP_LOCAL_APPLIANCE_FLOW;
  expect(localMayaEntry()).toBe(false);
  await expect(startDemoSession()).rejects.toThrow('Demo entry is unavailable here.');
  expect(fetch).not.toHaveBeenCalled();
});

test('configured browser sign-in contains no credentials and only accepts the demo customer', async () => {
  jest.spyOn(localDemo, 'isLocalDemoOrigin').mockReturnValue(true);
  process.env.REACT_APP_LOCAL_DEMO_PORT = '3018';
  const json = jest.fn().mockResolvedValue({ data: { token: 'fixture-token', user: { id: 7, email: 'maya.demo@example.invalid', role: 'admin' } } });
  fetch.mockResolvedValue({ ok: true, json });
  await expect(startDemoSession()).rejects.toThrow('Could not open');
  expect(localStorage.getItem('token')).toBeNull();
  json.mockResolvedValue({ data: { token: 'fixture-token', user: { id: 7, email: 'maya.demo@example.invalid', role: 'user' } } });
  await expect(startDemoSession()).resolves.toHaveProperty('user.role', 'user');
  expect(fetch).toHaveBeenLastCalledWith('/_local/maya-login', { method: 'POST', headers: { 'x-hometruth-local-maya': '1' } });
});

test('preserves supported demo return routes and rejects admin and off-origin destinations', () => {
  expect(demoReturnTo('/ask-ai?conversation=abc')).toBe('/ask-ai?conversation=abc');
  expect(demoReturnTo('/appliances?home=31&item=12')).toBe('/appliances?home=31&item=12');
  expect(demoReturnTo('/admin/operations')).toBeNull();
  expect(demoReturnTo('//example.com')).toBeNull();
  expect(demoReturnTo('/ask-ai-fake')).toBeNull();
});


test('Maya’s local home entry returns to the selected home and keeps admin entry separate', () => {
  jest.spyOn(localDemo, 'isLocalDemoOrigin').mockReturnValue(true);
  process.env.REACT_APP_CONTROL_CENTRE_ENABLED = 'true';
  const user = { id: 7, email: 'maya.demo@example.invalid', role: 'user' };
  sessionStorage.setItem('ht-manual-context:7:selected', JSON.stringify({ homeId: 31, itemId: 12 }));
  expect(mayaHomeDestination(user)).toBe('/control-centre?propertyId=31');
  expect(mayaHomeDestination({ ...user, role: 'admin' })).toBeNull();
  expect(mayaHomeDestination({ ...user, email: 'other@example.invalid' })).toBeNull();
  sessionStorage.removeItem('ht-manual-context:7:selected');
});
