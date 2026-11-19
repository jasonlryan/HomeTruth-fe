export function localMayaEntry() {
  return process.env.NODE_ENV === 'development' &&
    process.env.REACT_APP_HOMEOWNER_DEMO === 'true' &&
    process.env.REACT_APP_LOCAL_APPLIANCE_FLOW === 'true' &&
    window.location.port === '3014' &&
    ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

export function demoEntryEnabled(hostname = window.location.hostname) {
  return localMayaEntry() || (process.env.REACT_APP_HOMEOWNER_DEMO === 'true' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(hostname) &&
    Boolean(process.env.REACT_APP_DEMO_PASSWORD));
}

export async function startDemoSession() {
  if (!demoEntryEnabled()) throw new Error('Demo entry is unavailable here.');
  const local = localMayaEntry();
  const api = new URL(local ? window.location.origin : process.env.REACT_APP_API_BASE_URL);
  if (!['localhost', '127.0.0.1', '[::1]'].includes(api.hostname)) {
    throw new Error('Demo entry requires the local API.');
  }
  const options = local ? { headers: { 'x-hometruth-local-maya': '1' } } : {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'maya.demo@example.invalid', password: process.env.REACT_APP_DEMO_PASSWORD }),
  };
  const response = await fetch(new URL(local ? '/_local/maya-login' : '/api/auth/login', api), {
    method: 'POST', ...options,
  });
  const body = await response.json();
  const data = body.data?.data || body.data || body;
  const { token, user } = data;
  if (!response.ok || !token || user?.email !== 'maya.demo@example.invalid' || user?.role === 'admin') {
    throw new Error('Could not open Maya’s workspace. Check the local demo API and try again.');
  }
  localStorage.setItem('token', token);
  localStorage.setItem('userId', user.id);
  localStorage.setItem('user_role', user.role);
  localStorage.setItem('user_email', user.email);
  localStorage.setItem('user_name', `${user.first_name} ${user.last_name}`);
  ['new_user', 'require_profile', 'quiz_modal_active', 'onboarding_lock', 'partner_invite_code'].forEach(key => localStorage.removeItem(key));
  return { token, user };
}
