import { useEffect, useState } from "react";
import { getBudgetChatStatus } from "../api/api";

export default function ChatBox({ budgetCalculationId }) {
  const [statusMessage, setStatusMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await getBudgetChatStatus(budgetCalculationId);

        const statusMsg =
          res?.statusMessage ||
          res?.message || 
          "Preparing your budget insights. Please check back soon.";

        setStatusMessage(statusMsg);
      } catch (err) {
        console.error("Failed to fetch chat status:", err);
        setError("⚠️ Could not load chat status.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [budgetCalculationId]);

  return (
    <div className="bg-white rounded-xl shadow border mt-6 p-4 max-w-3xl mx-auto">
      <h2 className="text-lg font-semibold mb-2">Budget chat status</h2>

      {loading && <p className="text-sm text-gray-500">Loading status...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="bg-gray-100 rounded-md p-3 text-sm text-gray-800">
          {statusMessage}
        </div>
      )}
    </div>
  );
}
