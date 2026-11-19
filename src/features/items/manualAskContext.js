import { isLocalDemoOrigin } from "../../utils/localDemo";

export const localManualAskEnabled =
  process.env.REACT_APP_LOCAL_APPLIANCE_FLOW === "true" && isLocalDemoOrigin();

export const isManualAction = actions => Array.isArray(actions) &&
  actions.some(action => action?.actionId === "find_appliance_manual");

const key = (userId, messageId) => `ht-manual-context:${userId}:${messageId || "selected"}`;

export function readManualContext(userId, messageId) {
  if (!userId) return null;
  try {
    return JSON.parse(sessionStorage.getItem(key(userId, messageId)));
  } catch {
    return null;
  }
}

export function rememberManualContext(userId, scope, messageId) {
  if (!userId) return;
  try {
    if (scope) sessionStorage.setItem(key(userId, messageId), JSON.stringify(scope));
    else sessionStorage.removeItem(key(userId, messageId));
  } catch {
    // The equipment links remain available if browser storage is disabled.
  }
}

export const appliancePath = (homeId, itemId) =>
  homeId ? `/appliances?home=${homeId}${itemId ? `&item=${itemId}` : ""}` : "/appliances";

export const savedExactManual = item => item?.evidence?.find(evidence =>
  evidence.role === "manual" && evidence.matchStatus === "user_confirmed" &&
  evidence.hasText && evidence.status === "ready" && evidence.exactModel
);
