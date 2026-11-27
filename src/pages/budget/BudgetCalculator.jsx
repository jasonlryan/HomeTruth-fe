import HTGlyph from "../../components/HTGlyph";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import { getSavedBudgets, updateBudgetCalculationName } from "../../api/api";

export default function BudgetCalculator() {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [tempName, setTempName] = useState("");

  const MAX_SAVED = 3;
  const hasReachedLimit = budgets.length >= MAX_SAVED;

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await getSavedBudgets();
        const data = Array.isArray(res?.data) ? res.data : [];
        setBudgets(data);
      } catch (err) {
        console.warn("⚠️ Backend failed. Using static fallback.");
        setBudgets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleEditClick = (budget) => {
    setEditingId(budget.id);
    setTempName(budget.name);
  };

  const handleSave = async (id) => {
    const trimmed = tempName.trim();
    if (!trimmed) {
      alert("Title cannot be empty.");
      return;
    }

    try {
      await updateBudgetCalculationName(id, trimmed);
      setBudgets((prev) =>
        prev.map((b) => (b.id === id ? { ...b, name: trimmed } : b))
      );
      setEditingId(null);
      setTempName("");
    } catch (err) {
      console.error("❌ Failed to update title:", err);
      alert("Failed to save title. Try again.");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setTempName("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ht-cyan mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your saved budgets...</p>
        </div>
      </div>
    );
  }

  // ✅ Fully loaded but no saved budgets
  if (!loading && budgets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <PageTitle>Budget Calculator</PageTitle>
            <p className="text-sm text-gray-500">
              Plan your budget confidently
            </p>
          </div>
          <button
            onClick={() => navigate("/budget")}
            className="bg-ht-cyan hover:bg-ht-cyan-light text-white px-6 py-3 rounded-lg text-sm shadow flex items-center"
          >
            {/* SVG icon */}
            <HTGlyph name="assistant" size={18} className="text-white" />
            &nbsp;Chat with your mortgage calculator
          </button>
        </div>

        {/* Empty state visual */}
        <div className="flex flex-col items-center justify-center text-center mt-48">
          <div className="w-64 h-64 bg-sky-50 rounded-full flex items-center justify-center mb-6 flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="137"
              height="137"
              viewBox="0 0 137 137"
              className="flex-shrink-0"
              aria-hidden
              fill="none"
            >
              <path
                d="M68.5 91.3333C65.3604 91.3333 62.6737 90.2164 60.4398 87.9825C58.206 85.7487 57.0871 83.0601 57.0833 79.9167C57.0795 76.7733 58.1984 74.0866 60.4398 71.8565C62.6813 69.6264 65.368 68.5076 68.5 68.5C71.632 68.4924 74.3206 69.6112 76.5659 71.8565C78.8112 74.1018 79.9281 76.7885 79.9167 79.9167C79.9053 83.0448 78.7883 85.7335 76.5659 87.9825C74.3434 90.2316 71.6548 91.3486 68.5 91.3333ZM42.099 39.9583H94.901L102.179 25.4021C103.131 23.4993 103.058 21.6441 101.962 19.8365C100.866 18.0288 99.2261 17.125 97.0417 17.125H39.9583C37.7701 17.125 36.1299 18.0288 35.0378 19.8365C33.9456 21.6441 33.8732 23.4993 34.8208 25.4021L42.099 39.9583ZM47.95 119.875H89.05C98.1125 120.375 105.391 117.403 111.384 111.459C117.378 105.514 120.375 98.2114 120.375 89.55C120.375 85.9347 119.757 82.4146 118.52 78.9896C117.283 75.5646 115.523 72.4726 113.24 69.7135L98.3979 51.875H39.6021L24.7604 69.7135C22.4771 72.4726 20.717 75.5646 19.4802 78.9896C18.2434 82.4146 17.625 85.9347 17.625 89.55C17.625 98.2076 20.599 105.51 26.5471 111.459C32.4952 117.407 39.7962 120.379 48.45 120.375Z"
                fill="url(#paint0_linear_budget_calc)"
                fillOpacity="0.941176"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_budget_calc"
                  x1="17.125"
                  y1="68.5"
                  x2="119.875"
                  y2="68.5"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="var(--ht-cyan)" />
                  <stop offset="0.555049" stopColor="var(--ht-purple-light)" />
                  <stop offset="1" stopColor="var(--ht-purple)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <p className="text-4xl font-semibold text-gray-800">
            You have no budget calculations yet!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <PageTitle>Budget Calculator</PageTitle>
          <p className="text-sm text-gray-500">Plan your budget confidently</p>
        </div>
        <button
          onClick={() => navigate("/budget")}
          className="bg-ht-cyan hover:bg-ht-cyan-light text-white px-4 py-2 rounded-lg text-sm shadow flex items-center gap-2"
        >
          {/* SVG */}
          <HTGlyph name="assistant" size={18} className="text-white" />
          Chat with your mortgage calculator
        </button>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {budgets.map((b) => (
          <div
            key={b.id}
            className="relative bg-white rounded-lg shadow-sm p-4 border"
          >
            {/* Edit button */}
            {editingId !== b.id && (
              <button aria-label="Edit budget"
                onClick={() => handleEditClick(b)}
                className="absolute top-3 right-3 text-ht-cyan hover:text-ht-cyan-light"
              >
                <HTGlyph name="edit" size={16} />
              </button>
            )}

            {/* Editable title */}
            <div className="mb-2 pr-6">
              {editingId === b.id ? (
                <>
                  <input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full bg-gray-100 text-sm font-semibold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-ht-cyan"
                  />
                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={() => handleSave(b.id)}
                      className="text-ht-cyan text-sm hover:underline"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-gray-500 text-sm hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <h2 className="text-sm font-semibold text-gray-900">
                  {b.name}
                </h2>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600">
              {b.description ||
                (b.estimated_monthly_payment_range
                  ? `Estimated range: ${b.estimated_monthly_payment_range}`
                  : "This budget hasn't been finalized yet.")}
            </p>

            {/* Footer */}
            <div className="mt-4 text-xs text-gray-400 flex justify-between">
              <span>{formatDate(b.createdAt)}</span>
              <button
                className="text-ht-cyan hover:underline"
                onClick={() => navigate(`/budget/view/${b.id}`)}
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upgrade CTA */}
      {hasReachedLimit && (
        <div className="mt-20 text-center">
          <p className="font-semibold text-lg mb-4">
            Want to add more scenarios for your budget calculator?
          </p>
          <button
            disabled
            title="Pro tier launching soon."
            className="bg-gray-400 text-white font-medium px-6 py-2 rounded-md text-sm opacity-50 cursor-not-allowed"
          >
            Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  );
}
