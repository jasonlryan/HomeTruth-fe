export const HOME_RECORD_PATH = "/property-profile";
export const HOME_RECORD_REDIRECT = "?redirect=%2Fproperty-profile";
const guestSessionKey = "home_record_guest_session_id";

export function getHomeRecordGuestSession() {
  try {
    return sessionStorage.getItem(guestSessionKey);
  } catch {
    return null;
  }
}

export function setHomeRecordGuestSession(id) {
  try {
    if (id) sessionStorage.setItem(guestSessionKey, id);
    else sessionStorage.removeItem(guestSessionKey);
  } catch {
    // The record can still be started when browser storage is unavailable.
  }
}
