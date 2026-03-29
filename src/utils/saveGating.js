export const SAVE_ACTION_TYPES = Object.freeze({
  SESSION: "SESSION",
  NOTE: "NOTE",
  BUDGET_NOTE: "BUDGET_NOTE",
});

export const PAYWALL_MODAL_TYPES = Object.freeze({
  SESSION: "SESSION",
  NOTES: "NOTES",
});

export const FREE_TIER_LIMITS = Object.freeze({
  SESSION: 3,
  NOTES: 5,
});

const toCount = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
};

export const getSaveGateDecision = ({
  actionType,
  usedSessions = 0,
  currentNotesCount = 0,
  sessionLimit = FREE_TIER_LIMITS.SESSION,
  notesLimit = FREE_TIER_LIMITS.NOTES,
}) => {
  const normalizedSessionLimit = toCount(sessionLimit);
  const normalizedNotesLimit = toCount(notesLimit);
  const normalizedUsedSessions = toCount(usedSessions);
  const normalizedNotesCount = toCount(currentNotesCount);

  if (actionType === SAVE_ACTION_TYPES.SESSION) {
    const blocked = normalizedUsedSessions >= normalizedSessionLimit;
    return {
      allowed: !blocked,
      modalType: blocked ? PAYWALL_MODAL_TYPES.SESSION : null,
      count: normalizedUsedSessions,
      limit: normalizedSessionLimit,
    };
  }

  if (
    actionType === SAVE_ACTION_TYPES.NOTE ||
    actionType === SAVE_ACTION_TYPES.BUDGET_NOTE
  ) {
    const blocked = normalizedNotesCount >= normalizedNotesLimit;
    return {
      allowed: !blocked,
      modalType: blocked ? PAYWALL_MODAL_TYPES.NOTES : null,
      count: normalizedNotesCount,
      limit: normalizedNotesLimit,
    };
  }

  return {
    allowed: true,
    modalType: null,
    count: 0,
    limit: 0,
  };
};

export const isLimitErrorMessage = (message = "") =>
  /(limit|quota|max(?:imum)?|upgrade to pro|saved.*limit)/i.test(
    String(message)
  );

export const getSavedItemsCountFromResponse = (response) => {
  const numericCandidates = [
    response?.data?.total,
    response?.data?.totalItems,
    response?.data?.count,
    response?.total,
    response?.totalItems,
    response?.count,
    response?.pagination?.total,
    response?.pagination?.totalItems,
    response?.meta?.total,
    response?.meta?.totalItems,
  ];

  for (const candidate of numericCandidates) {
    const parsed = Number(candidate);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.floor(parsed);
    }
  }

  const arrayCandidates = [
    response?.data?.items,
    response?.items,
    response?.data,
    response?.savedItems,
    response,
  ];

  for (const candidate of arrayCandidates) {
    if (Array.isArray(candidate)) return candidate.length;
  }

  return null;
};
