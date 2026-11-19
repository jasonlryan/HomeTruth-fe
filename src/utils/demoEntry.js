import { isLocalDemoOrigin } from "./localDemo";

export function localMayaEntry() {
  return process.env.REACT_APP_HOMEOWNER_DEMO === 'true' &&
    process.env.REACT_APP_LOCAL_APPLIANCE_FLOW === 'true' && isLocalDemoOrigin();
}

export function demoReturnTo(path) {
  if (!path || !/^\/(?:ask-ai|appliances|control-centre|property-profile)(?:[?#]|$)/.test(path)) return null;
  return path;
}

export async function startDemoSession() {
  if (!localMayaEntry()) throw new Error('Demo entry is unavailable here.');
  const response = await fetch('/_local/maya-login', {
    method: 'POST',
    headers: { 'x-hometruth-local-maya': '1' },
  });
  const body = await response.json();
  const data = body.data?.data || body.data || body;
  const { token, user } = data;
  if (!response.ok || !token || user?.email !== 'maya.demo@example.invalid' || !['user', 'customer'].includes(user?.role)) {
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
