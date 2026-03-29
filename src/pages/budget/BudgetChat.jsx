import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  continueAIBudgetChat,
  getEstimate,
  markBudgetCalculationAsSaved,
  getAllSavedItems,
  getSavedNotes,
  startAIBudgetChat,
} from "../../api/api";
import {
  FREE_TIER_LIMITS,
  PAYWALL_MODAL_TYPES,
  SAVE_ACTION_TYPES,
  getSaveGateDecision,
  getSavedItemsCountFromResponse,
  isLimitErrorMessage,
} from "../../utils/saveGating";

export default function BudgetChat() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { budgetCalculationId: routeBudgetCalculationId, initialReply } = state || {};

  const [budgetCalculationId, setBudgetCalculationId] = useState(
    routeBudgetCalculationId || null
  );

  const [messages, setMessages] = useState(
    initialReply ? [{ role: "assistant", content: initialReply }] : []
  );
  const [initializing, setInitializing] = useState(
    !(routeBudgetCalculationId && initialReply)
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [estimateResult, setEstimateResult] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [title, setTitle] = useState("");
  const [saveError, setSaveError] = useState("");
  const [savedCount, setSavedCount] = useState(null);
  const [paywallModal, setPaywallModal] = useState(null);
  const MAX_SAVED = FREE_TIER_LIMITS.NOTES;

  const chatScrollRef = useRef(null);

  const refreshSavedNotesCount = async () => {
    try {
      const response = await getAllSavedItems({ page: 1, limit: 100 });
      const count = getSavedItemsCountFromResponse(response);
      if (typeof count === "number") {
        setSavedCount(count);
        return count;
      }
    } catch (err) {
      console.error("Failed to fetch saved items count:", err);
    }

    try {
      const notes = await getSavedNotes();
      const notesCount = Array.isArray(notes) ? notes.length : 0;
      setSavedCount(notesCount);
      return notesCount;
    } catch (err) {
      console.error("Failed to fetch saved notes count:", err);
      return null;
    }
  };

  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const fetchSavedCount = async () => {
      await refreshSavedNotesCount();
    };
    fetchSavedCount();
  }, []);

  useEffect(() => {
    if (routeBudgetCalculationId && initialReply) {
      setBudgetCalculationId(routeBudgetCalculationId);
      setMessages([{ role: "assistant", content: initialReply }]);
      setInitializing(false);
      return;
    }

    let isMounted = true;

    const bootstrapBudgetChat = async () => {
      try {
        setInitializing(true);
        setSaveError("");

        const data = await startAIBudgetChat();
        const { conversationId, budgetCalculationId: newBudgetId, reply } = data || {};

        if (!isMounted) return;

        if (conversationId) {
          localStorage.setItem("conversationId", conversationId);
        }
        if (newBudgetId) {
          localStorage.setItem("budgetCalculationId", newBudgetId);
          setBudgetCalculationId(newBudgetId);
        }

        setMessages(reply ? [{ role: "assistant", content: reply }] : []);
      } catch (err) {
        console.error("Failed to start AI budget chat:", err);
        if (!isMounted) return;
        setSaveError("Failed to start the budget chat. Please refresh and try again.");
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }
    };

    bootstrapBudgetChat();

    return () => {
      isMounted = false;
    };
  }, [routeBudgetCalculationId, initialReply]);

  const sendMessage = async () => {
    if (!input.trim() || !budgetCalculationId) return;

    const userMessage = input;
    setInput("");
    setSaveError(""); // Clear previous save errors
    const newUserMessage = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      setLoading(true);
      const response = await continueAIBudgetChat(
        userMessage,
        budgetCalculationId
      );

      const reply = response?.reply;
      const percentage = response?.questionProgress?.percentage;

      if (reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      }

      if (typeof percentage === "number") {
        setProgressPercent(Math.min(percentage, 100));
      }
    } catch (err) {
      console.error("❌ Chat API failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetEstimate = async () => {
    if (!budgetCalculationId) {
      console.error("No budgetCalculationId found.");
      return;
    }

    setSaveError("");
    try {
      const estimateData = await getEstimate(budgetCalculationId);
      const displayRange =
        estimateData?.estimate?.displayRange ||
        estimateData?.budgetCalculation?.estimated_monthly_payment_range ||
        "N/A";

      const riskLevel = estimateData?.riskLevel || "unknown";
      const missing = estimateData?.missingCriticalData || [];

      setEstimateResult({
        displayRange,
        riskLevel,
        missingCriticalData: missing,
      });

      setSaveEnabled(false);
      setIsSaved(false);

      setTimeout(() => setSaveEnabled(true), 1500);
    } catch (err) {
      console.error("❌ Failed to get estimate:", err);
      setEstimateResult({
        displayRange: "N/A",
        riskLevel: "unknown",
        missingCriticalData: [],
      });
      setSaveEnabled(false);
    }
  };

  // ---- Save button handler: checks notes limit BEFORE opening modal
  const handleSave = async () => {
    setSaveError("");
    setPaywallModal(null);

    // 1) Local check first
    if (savedCount !== null && savedCount >= MAX_SAVED) {
      const gate = getSaveGateDecision({
        actionType: SAVE_ACTION_TYPES.BUDGET_NOTE,
        currentNotesCount: savedCount,
        notesLimit: FREE_TIER_LIMITS.NOTES,
      });
      setPaywallModal(gate);
      return;
    }

    // 2) Verify with server
    const currentCount = await refreshSavedNotesCount();
    if (typeof currentCount !== "number") {
      setSaveError(
        "Couldn't verify your notes quota right now. Please try again in a moment."
      );
      return;
    }

    const gate = getSaveGateDecision({
      actionType: SAVE_ACTION_TYPES.BUDGET_NOTE,
      currentNotesCount: currentCount,
      notesLimit: FREE_TIER_LIMITS.NOTES,
    });
    if (!gate.allowed) {
      setPaywallModal(gate);
      return;
    }

    // Passed all checks, open modal
    setShowTitleModal(true);
  };

  const handleSaveWithName = async () => {
    if (!title.trim() || !budgetCalculationId) return;

    try {
      await markBudgetCalculationAsSaved(
        budgetCalculationId,
        encodeURIComponent(title.trim())
      );

      setIsSaved(true);
      setSaveEnabled(false);
      setShowTitleModal(false);

      // Optimistic local bump
      setSavedCount((prev) => (typeof prev === "number" ? prev + 1 : prev));

      // Refresh from server
      await refreshSavedNotesCount();

      navigate("/saved-notes");
    } catch (err) {
      console.error("Failed to save budget calculation:", err);
      const backendMessage = err?.response?.data?.message || "";
      if (isLimitErrorMessage(backendMessage)) {
        const latestCount = await refreshSavedNotesCount();
        setPaywallModal({
          modalType: PAYWALL_MODAL_TYPES.NOTES,
          count:
            typeof latestCount === "number"
              ? latestCount
              : typeof savedCount === "number"
                ? savedCount
                : 0,
          limit: FREE_TIER_LIMITS.NOTES,
        });
        setShowTitleModal(false);
        return;
      }

      setSaveError(backendMessage || "Failed to save calculation. Please try again.");
      setShowTitleModal(false);
    }
  };

  let progressColor = "bg-red-600";
  if (progressPercent >= 75) progressColor = "bg-green-500";
  else if (progressPercent >= 40) progressColor = "bg-orange-400";

  return (
    <div className="chat-system-font bg-gray-50 px-4 py-4 min-h-screen">
      <div className="mx-auto w-full">
        {/* Header */}
        <div className="bg-white p-4 rounded-xl shadow-sm border mb-12">
          <h1 className="text-xl font-bold text-gray-900">
            Mortgage Calculations
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Hi, I'm your mortgage calculator!
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Let's work together to estimate what kind of real estate best fits
            your lifestyle and budget.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full mb-4">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-xs text-black absolute top-[-30px] right-0">
            {`${progressPercent}% complete`}
          </div>
        </div>

        {/* Chat Area */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="relative h-[62vh] mb-6">
            <div
              ref={chatScrollRef}
              className="overflow-y-auto pr-1 space-y-4 h-full pb-24"
            >
              {initializing && messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">
                      Starting your budget chat...
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded-xl px-4 py-2 text-sm max-w-[60%] ${
                        msg.role === "user"
                          ? "bg-customActiveText text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 w-full bg-white border-t pt-2">
              <div className="bg-white border rounded-xl p-2 shadow-sm flex items-center mx-1">
                <input
                  type="text"
                  placeholder="Type your answer..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-grow px-3 py-2 text-sm bg-transparent focus:outline-none"
                />
                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                <button
                  onClick={sendMessage}
                  disabled={loading || initializing}
                  className="p-2 text-primary disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="29"
                    height="30"
                    viewBox="0 0 29 30"
                    fill="none"
                  >
                    <path
                      d="M12.428 17.0709L1.03516 11.8923L27.9637 1.53516L17.6066 28.4637L12.428 17.0709Z"
                      fill="#19B0F0F0"
                    />
                    <path
                      d="M12.428 17.0709L18.6423 10.8566"
                      stroke="#19B0F0F0"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Get Estimate Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleGetEstimate}
            className="bg-customActiveText hover:bg-sky-500 text-white px-4 py-2 rounded-md text-sm"
          >
            Get my estimate
          </button>
        </div>

        {/* Save Error */}
        {saveError && (
          <div className="flex flex-col justify-start items-start mt-4 space-y-1">
            <p className="text-sm it text-red-600 font-medium">{saveError}</p>
          </div>
        )}

        {/* Estimate Box + Save */}
        {estimateResult && (
          <>
            <div
              className={`mt-6 p-6 rounded-xl text-center font-semibold text-lg ${
                estimateResult.riskLevel === "high"
                  ? "bg-red-100 text-red-800"
                  : estimateResult.riskLevel === "medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : estimateResult.riskLevel === "low"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="text-base font-medium mb-1">
                Estimated Monthly Payment Range:
              </div>
              <div className="text-2xl font-bold">
                {estimateResult.displayRange || "N/A"}
              </div>
              {estimateResult.displayRange === "N/A" && (
                <p className="mt-2 text-sm text-gray-600 italic">
                  Your estimate could not be calculated due to incomplete data.
                </p>
              )}
              {estimateResult.missingCriticalData?.length > 0 && (
                <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                  Missing info:
                  {estimateResult.missingCriticalData.map((field) => (
                    <li key={field}>{field.replaceAll("_", " ")}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Save Button */}
            <div className="flex flex-col justify-end items-end mt-4 space-y-1">
              <button
                onClick={handleSave}
                disabled={
                  !saveEnabled ||
                  isSaved
                }
                className="bg-customActiveText hover:bg-sky-500 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
              >
                {isSaved ? "Saved" : "Save"}
              </button>
              
            </div>
          </>
        )}

        {paywallModal?.modalType === PAYWALL_MODAL_TYPES.NOTES && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative text-center">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-black"
                onClick={() => setPaywallModal(null)}
                aria-label="Close"
              >
                x
              </button>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Note Limit Reached
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                {`You currently have ${paywallModal.count} notes. To add more and unlock the full experience, upgrade to Pro and enjoy all the powerful features we offer.`}
              </p>
              <button
                disabled
                title="Pro tier launching soon."
                className="w-full bg-gray-400 text-white text-sm font-medium py-3 rounded-xl opacity-50 cursor-not-allowed"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        )}

        {/* Title Modal */}
        {showTitleModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl relative">
              {/* Close button */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                onClick={() => setShowTitleModal(false)}
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
              
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Give your calculation a name
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Enter the title of this budget calculation.
              </p>
              <input
                type="text"
                placeholder="Enter Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveWithName}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
