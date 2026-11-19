import { claimGuestSession } from "../api/api";
import {
  claimHomeRecordAnswer,
  clearHomeRecordHandoff,
  getEntryPartnerInvite,
  getHomeRecordAnswer,
  getHomeRecordGuestSession,
  setHomeRecordGuestSession,
} from "./homeRecordEntry";

jest.mock("../api/api", () => ({ claimGuestSession: jest.fn() }));

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  claimGuestSession.mockReset();
});

test("concurrent claims share one request and leave an account-scoped answer", async () => {
  setHomeRecordGuestSession("guest-1");
  claimGuestSession.mockResolvedValue({ conversation_id: "answer-1" });

  const first = claimHomeRecordAnswer(42, "guest-1");
  expect(claimHomeRecordAnswer(42, "guest-1")).toBe(first);
  await expect(first).resolves.toBe("answer-1");
  expect(claimGuestSession).toHaveBeenCalledTimes(1);
  expect(getHomeRecordAnswer("42")).toBe("answer-1");
  expect(getHomeRecordAnswer(43)).toBeNull();
  expect(getHomeRecordGuestSession()).toBeNull();

  clearHomeRecordHandoff();
  expect(getHomeRecordAnswer(42)).toBeNull();
});

test("an unsuccessful claim can be retried", async () => {
  setHomeRecordGuestSession("guest-1");
  claimGuestSession.mockRejectedValueOnce(new Error("Temporarily unavailable"));
  claimGuestSession.mockResolvedValueOnce({ conversation_id: "answer-1" });

  await expect(claimHomeRecordAnswer(42, "guest-1")).rejects.toThrow("Temporarily unavailable");
  expect(getHomeRecordGuestSession()).toBe("guest-1");
  await expect(claimHomeRecordAnswer(42, "guest-1")).resolves.toBe("answer-1");
});

test("an explicit home-record journey takes precedence over a stored partner invite", () => {
  localStorage.setItem("partner_invite_code", "previous-invite");
  expect(getEntryPartnerInvite(new URLSearchParams(), true)).toBe("");
  expect(getEntryPartnerInvite(new URLSearchParams(), false)).toBe("previous-invite");
  expect(getEntryPartnerInvite(new URLSearchParams("partner_invite=new-invite"), true)).toBe("new-invite");
});
