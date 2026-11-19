import { claimGuestSession } from "../api/api";

export const HOME_RECORD_PATH = "/property-profile";
export const HOME_RECORD_REDIRECT = "?redirect=%2Fproperty-profile";
const guestSessionKey = "home_record_guest_session_id";
const answerKey = "home_record_claimed_answer";
const claimsInFlight = new Map();

export function getEntryPartnerInvite(searchParams, startingRecord) {
  return searchParams.get("partner_invite") ||
    (startingRecord ? "" : localStorage.getItem("partner_invite_code")) || "";
}

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

export function getHomeRecordAnswer(userId) {
  if (!userId) return null;
  try {
    const answer = JSON.parse(sessionStorage.getItem(answerKey));
    return answer?.userId === String(userId) ? answer.conversationId : null;
  } catch {
    return null;
  }
}

export function claimHomeRecordAnswer(userId, sessionId) {
  const key = JSON.stringify([String(userId), sessionId]);
  if (claimsInFlight.has(key)) return claimsInFlight.get(key);

  const request = claimGuestSession(sessionId).then(result => {
    const conversationId = result?.conversation_id;
    if (!conversationId) throw new Error("Homepage conversation unavailable");
    if (getHomeRecordGuestSession() === sessionId) {
      setHomeRecordGuestSession(null);
      try {
        if (userId) sessionStorage.setItem(answerKey, JSON.stringify({ userId: String(userId), conversationId }));
      } catch {
        // The open Property profile can still display the answer link.
      }
    }
    return conversationId;
  }).finally(() => claimsInFlight.delete(key));
  claimsInFlight.set(key, request);
  return request;
}

export function clearHomeRecordHandoff() {
  setHomeRecordGuestSession(null);
  try {
    sessionStorage.removeItem(answerKey);
  } catch {
    // Sign-out remains available when browser storage is blocked.
  }
}
