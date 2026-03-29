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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            className="bg-customActiveText hover:bg-sky-500 text-white px-6 py-3 rounded-lg text-sm shadow flex items-center"
          >
            {/* SVG icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M15.5347 6.09583L15.3502 6.52033C15.3214 6.58946 15.2728 6.64851 15.2104 6.69004C15.1481 6.73157 15.0749 6.75373 15 6.75373C14.9251 6.75373 14.8519 6.73157 14.7896 6.69004C14.7272 6.64851 14.6786 6.58946 14.6498 6.52033L14.4653 6.09583C14.1409 5.34488 13.5468 4.74277 12.8002 4.40833L12.231 4.15408C12.1619 4.12232 12.1034 4.07141 12.0624 4.00741C12.0214 3.9434 11.9996 3.86898 11.9996 3.79296C11.9996 3.71694 12.0214 3.64252 12.0624 3.57851C12.1034 3.51451 12.1619 3.4636 12.231 3.43183L12.7687 3.19258C13.5341 2.84862 14.1383 2.22425 14.457 1.44808L14.6467 0.989834C14.6746 0.91885 14.7232 0.857908 14.7862 0.814953C14.8492 0.771998 14.9237 0.749023 15 0.749023C15.0763 0.749023 15.1508 0.771998 15.2138 0.814953C15.2768 0.857908 15.3254 0.91885 15.3533 0.989834L15.543 1.44733C15.8614 2.22364 16.4653 2.84828 17.2305 3.19258L17.769 3.43258C17.8379 3.46444 17.8961 3.51534 17.937 3.57926C17.9779 3.64319 17.9996 3.71747 17.9996 3.79333C17.9996 3.8692 17.9779 3.94348 17.937 4.0074C17.8961 4.07133 17.8379 4.12222 17.769 4.15408L17.199 4.40758C16.4526 4.74236 15.8588 5.34473 15.5347 6.09583ZM9 1.49983C4.85775 1.49983 1.5 4.85758 1.5 8.99983C1.5 10.2771 1.81875 11.4793 2.382 12.5316L1.5 16.4998L5.46825 15.6178C6.55476 16.1986 7.76803 16.5016 9 16.4998C13.1423 16.4998 16.5 13.1421 16.5 8.99983C16.5 8.69783 16.4825 8.40033 16.4475 8.10734L14.958 8.28358C14.986 8.51858 15 8.75733 15 8.99983C15 10.5911 14.3679 12.1173 13.2426 13.2425C12.1174 14.3677 10.5913 14.9998 9 14.9998C8.01475 15.0015 7.0444 14.7593 6.1755 14.2948L5.68575 14.0331L3.4755 14.5243L3.96675 12.3141L3.70425 11.8243C3.24004 10.9554 2.9981 9.98502 3 8.99983C2.99977 8.084 3.20919 7.18026 3.61222 6.35788C4.01526 5.53549 4.6012 4.81628 5.32516 4.25536C6.04912 3.69444 6.89188 3.30668 7.78886 3.12182C8.68585 2.93695 9.61325 2.95988 10.5 3.18883L10.8735 1.73608C10.2735 1.58158 9.64575 1.49983 9 1.49983ZM6.75 8.99983H5.25C5.25 9.9944 5.64509 10.9482 6.34835 11.6515C7.05161 12.3547 8.00544 12.7498 9 12.7498C9.99456 12.7498 10.9484 12.3547 11.6517 11.6515C12.3549 10.9482 12.75 9.9944 12.75 8.99983H11.25C11.25 9.59657 11.0129 10.1689 10.591 10.5908C10.169 11.0128 9.59674 11.2498 9 11.2498C8.40326 11.2498 7.83097 11.0128 7.40901 10.5908C6.98705 10.1689 6.75 9.59657 6.75 8.99983Z"
                fill="white"
              />
            </svg>
            &nbsp;Chat with your mortgage calculator
          </button>
        </div>

        {/* Empty state visual */}
        <div className="flex flex-col items-center justify-center text-center mt-48">
          <div className="w-64 h-64 bg-blue-100 rounded-full flex items-center justify-center mb-6 flex-shrink-0">
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
                  <stop stopColor="#19B0F0" />
                  <stop offset="0.555049" stopColor="#89A4E1" />
                  <stop offset="1" stopColor="#AE9CD9" />
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
          className="bg-customActiveText hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-sm shadow flex items-center gap-2"
        >
          {/* SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
          >
            <path
              d="M15.5347 6.09583L15.3502 6.52033C15.3214 6.58946 15.2728 6.64851 15.2104 6.69004C15.1481 6.73157 15.0749 6.75373 15 6.75373C14.9251 6.75373 14.8519 6.73157 14.7896 6.69004C14.7272 6.64851 14.6786 6.58946 14.6498 6.52033L14.4653 6.09583C14.1409 5.34488 13.5468 4.74277 12.8002 4.40833L12.231 4.15408C12.1619 4.12232 12.1034 4.07141 12.0624 4.00741C12.0214 3.9434 11.9996 3.86898 11.9996 3.79296C11.9996 3.71694 12.0214 3.64252 12.0624 3.57851C12.1034 3.51451 12.1619 3.4636 12.231 3.43183L12.7687 3.19258C13.5341 2.84862 14.1383 2.22425 14.457 1.44808L14.6467 0.989834C14.6746 0.91885 14.7232 0.857908 14.7862 0.814953C14.8492 0.771998 14.9237 0.749023 15 0.749023C15.0763 0.749023 15.1508 0.771998 15.2138 0.814953C15.2768 0.857908 15.3254 0.91885 15.3533 0.989834L15.543 1.44733C15.8614 2.22364 16.4653 2.84828 17.2305 3.19258L17.769 3.43258C17.8379 3.46444 17.8961 3.51534 17.937 3.57926C17.9779 3.64319 17.9996 3.71747 17.9996 3.79333C17.9996 3.8692 17.9779 3.94348 17.937 4.0074C17.8961 4.07133 17.8379 4.12222 17.769 4.15408L17.199 4.40758C16.4526 4.74236 15.8588 5.34473 15.5347 6.09583ZM9 1.49983C4.85775 1.49983 1.5 4.85758 1.5 8.99983C1.5 10.2771 1.81875 11.4793 2.382 12.5316L1.5 16.4998L5.46825 15.6178C6.55476 16.1986 7.76803 16.5016 9 16.4998C13.1423 16.4998 16.5 13.1421 16.5 8.99983C16.5 8.69783 16.4825 8.40033 16.4475 8.10734L14.958 8.28358C14.986 8.51858 15 8.75733 15 8.99983C15 10.5911 14.3679 12.1173 13.2426 13.2425C12.1174 14.3677 10.5913 14.9998 9 14.9998C8.01475 15.0015 7.0444 14.7593 6.1755 14.2948L5.68575 14.0331L3.4755 14.5243L3.96675 12.3141L3.70425 11.8243C3.24004 10.9554 2.9981 9.98502 3 8.99983C2.99977 8.084 3.20919 7.18026 3.61222 6.35788C4.01526 5.53549 4.6012 4.81628 5.32516 4.25536C6.04912 3.69444 6.89188 3.30668 7.78886 3.12182C8.68585 2.93695 9.61325 2.95988 10.5 3.18883L10.8735 1.73608C10.2735 1.58158 9.64575 1.49983 9 1.49983ZM6.75 8.99983H5.25C5.25 9.9944 5.64509 10.9482 6.34835 11.6515C7.05161 12.3547 8.00544 12.7498 9 12.7498C9.99456 12.7498 10.9484 12.3547 11.6517 11.6515C12.3549 10.9482 12.75 9.9944 12.75 8.99983H11.25C11.25 9.59657 11.0129 10.1689 10.591 10.5908C10.169 11.0128 9.59674 11.2498 9 11.2498C8.40326 11.2498 7.83097 11.0128 7.40901 10.5908C6.98705 10.1689 6.75 9.59657 6.75 8.99983Z"
              fill="white"
            />
          </svg>
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
              <button
                onClick={() => handleEditClick(b)}
                className="absolute top-3 right-3 text-blue-500 hover:text-blue-700"
              >
                <span className="material-symbols-outlined text-base">
                  border_color
                </span>
              </button>
            )}

            {/* Editable title */}
            <div className="mb-2 pr-6">
              {editingId === b.id ? (
                <>
                  <input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full bg-[#EFEFEF] text-sm font-semibold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={() => handleSave(b.id)}
                      className="text-blue-600 text-sm hover:underline"
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
                className="text-blue-500 hover:underline"
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
