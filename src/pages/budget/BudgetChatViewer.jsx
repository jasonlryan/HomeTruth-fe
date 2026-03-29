import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getBudgetConversationStatus,
  getAllSavedItems,
  getSavedNotes,
  markBudgetCalculationAsSaved,
  updateBudgetCalculationAll,
} from "../../api/api";
import {
  FREE_TIER_LIMITS,
  PAYWALL_MODAL_TYPES,
  SAVE_ACTION_TYPES,
  getSaveGateDecision,
  getSavedItemsCountFromResponse,
  isLimitErrorMessage,
} from "../../utils/saveGating";

export default function BudgetChatViewer() {
  const { id } = useParams();

  const [messages, setMessages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [estimateRange, setEstimateRange] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [qaPairs, setQaPairs] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [paywallModal, setPaywallModal] = useState(null);

  const refreshSavedNotesCount = async () => {
    try {
      const response = await getAllSavedItems({ page: 1, limit: 100 });
      const count = getSavedItemsCountFromResponse(response);
      if (typeof count === "number") return count;
    } catch (err) {
      console.error("Failed to fetch saved items count:", err);
    }

    try {
      const notes = await getSavedNotes();
      return Array.isArray(notes) ? notes.length : 0;
    } catch (err) {
      console.error("Failed to fetch saved notes count:", err);
      return null;
    }
  };

  useEffect(() => {
    const loadConversation = async () => {
      try {
        const res = await getBudgetConversationStatus(id);

        const flat = (res?.chatHistory || []).flatMap(
          ({ createdAt, role, content }) => {
            const time = createdAt
              ? new Date(createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";
            return { role, content, time };
          }
        );

        setMessages(flat);
        setProgress(res?.completionPercentage ?? 0);
        setEstimateRange(
          res?.budgetCalculation?.estimated_monthly_payment_range || ""
        );
        setIsSaved(res?.budgetCalculation?.is_saved ?? false);

        const pairs =
          res?.fieldsWithAnswers?.map((f) => ({
            fieldName: f.fieldName,
            question: f.question,
            answer: f.answer !== null ? f.answer : "",
          })) || [];

        setQaPairs(pairs);
      } catch (err) {
        console.error("❌ Failed to load conversation:", err);
      }
    };

    loadConversation();
  }, [id]);

  const handleSave = async () => {
    setSaveError("");
    setPaywallModal(null);

    const currentNotesCount = await refreshSavedNotesCount();
    if (typeof currentNotesCount !== "number") {
      setSaveError(
        "Couldn't verify your notes quota right now. Please try again in a moment."
      );
      return;
    }

    const gate = getSaveGateDecision({
      actionType: SAVE_ACTION_TYPES.BUDGET_NOTE,
      currentNotesCount,
      notesLimit: FREE_TIER_LIMITS.NOTES,
    });
    if (!gate.allowed) {
      setPaywallModal(gate);
      return;
    }

    try {
      await markBudgetCalculationAsSaved(id, "Saved Estimate");
      setIsSaved(true);
    } catch (err) {
      console.error("Failed to save:", err);
      const backendMessage = err?.response?.data?.message || "";
      if (isLimitErrorMessage(backendMessage)) {
        const latestCount = await refreshSavedNotesCount();
        setPaywallModal({
          modalType: PAYWALL_MODAL_TYPES.NOTES,
          count:
            typeof latestCount === "number"
              ? latestCount
              : currentNotesCount,
          limit: FREE_TIER_LIMITS.NOTES,
        });
        return;
      }

      setSaveError(backendMessage || "Failed to save calculation. Please try again.");
    }
  };
  const handleUpdate = async () => {
    try {
      const updatePayload = qaPairs.reduce((acc, { fieldName, answer }) => {
        acc[fieldName] = answer;
        return acc;
      }, {});
      await updateBudgetCalculationAll(id, updatePayload);
      setShowEditPopup(false);
    } catch (err) {
      console.error("❌ Failed to update:", err);
    }
  };

  let progressColor = "bg-red-600";
  if (progress >= 75) progressColor = "bg-green-500";
  else if (progress >= 40) progressColor = "bg-orange-400";

  return (
    <div className="chat-system-font bg-gray-50 px-4 py-4 min-h-screen">
      <div className="max-w-5xl mx-auto w-full relative">
        <div className="bg-white p-4 rounded-xl shadow-sm border mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Mortgage Calculations
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Hi, I'm your mortgage calculator!{" "}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Let’s work together to estimate what kind of real estate best
                fits your lifestyle and budget. I’m here to help you understand
                what’s affordable and guide you toward smart, confident
                financial decisions.{" "}
              </p>
            </div>
          </div>
        </div>

        <div className="relative w-full mb-4">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-black absolute top-[-30px] right-0">
            {`${progress}% complete`}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="h-[60vh] overflow-y-auto space-y-4 pb-4">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500">No messages yet.</p>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-xl px-4 py-2 text-sm max-w-[70%] whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-gray-200 text-gray-800"
                        : msg.role === "assistant"
                        ? "bg-customActiveText text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {msg.content}
                    <div className="text-[10px] text-gray-300 mt-1 text-right">
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-4">
          <button
            className="bg-sky-500 text-white px-4 py-2 rounded-md text-sm opacity-60 cursor-not-allowed"
            disabled
          >
            Get my estimate
          </button>
        </div>
        {estimateRange && (
          <>
            <div className="mt-6 p-6 rounded-xl bg-red-100 text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Estimated Monthly Payment Range:
              </h2>
              <div className="text-2xl font-bold text-red-800">
                {estimateRange}
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={handleSave}
                disabled={isSaved}
                className="bg-sky-500 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
              >
                {isSaved ? "Saved" : "Save"}
              </button>
              <button
                onClick={() => setShowEditPopup(true)}
                className="bg-customActiveText hover:bg-sky-500 text-white px-4 py-2 rounded-md text-sm"
              >
                Edit My Answers
              </button>
            </div>
          </>
        )}

        {saveError && (
          <div className="flex flex-col justify-start items-start mt-4 space-y-1">
            <p className="text-sm text-red-600 font-medium">{saveError}</p>
          </div>
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

        {showEditPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 relative">
              <button
                onClick={() => setShowEditPopup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold mb-4">
                Project Estimation Questionnaire
              </h2>
              <div className="max-h-[70vh] overflow-y-auto space-y-4">
                {qaPairs.map((pair, idx) => (
                  <div key={`qa-pair-${idx}-${pair.question?.slice(0, 10)}`} className="border rounded p-3 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {pair.question}
                    </p>
                    {editIndex === idx ? (
                      <input
                        type="text"
                        className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 w-full"
                        value={pair.answer}
                        onChange={(e) => {
                          const updated = [...qaPairs];
                          updated[idx].answer = e.target.value;
                          setQaPairs(updated);
                        }}
                      />
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="bg-gray-200 text-sm text-gray-800 px-3 py-2 rounded w-full">
                          {pair.answer || "No answer"}
                        </div>
                        <button
                          className="ml-2 text-blue-600 text-sm"
                          onClick={() => setEditIndex(idx)}
                        >
                          Edit ✎
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-start mt-6 gap-4">
                <button
                  onClick={handleUpdate}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
                >
                  Update Estimate
                </button>
                <button
                  onClick={() => setShowEditPopup(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

