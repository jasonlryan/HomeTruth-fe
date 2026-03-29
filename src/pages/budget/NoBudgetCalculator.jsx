import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { startAIBudgetChat } from "../../api/api"; // adjust path if needed
import { useState } from "react";

export default function MortgageIntro() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const data = await startAIBudgetChat();
      const { conversationId, budgetCalculationId, reply } = data;

      localStorage.setItem("conversationId", conversationId);
      localStorage.setItem("budgetCalculationId", budgetCalculationId);

      navigate("/budget-chat", {
        state: {
          conversationId,
          budgetCalculationId,
          initialReply: reply,
        },
      });
    } catch (err) {
      console.error("Failed to start AI budget chat:", err);
      // You could toast an error message here
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-sm text-gray-700 hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </button>

      <div className="mx-auto space-y-6">
        {/* Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h1 className="text-2xl font-bold text-gray-900">Mortgage Calculations</h1>
          <p className="mt-2 text-sm text-gray-600">
            Hi, I'm your mortgage calculator!
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Let's work together to estimate what kind of real estate best fits your lifestyle and budget.
            I’m here to help you understand what’s affordable and guide you toward smart, confident financial decisions.
          </p>
        </div>

        {/* Button */}
        <div className="flex justify-center">
          <button
            onClick={handleStart}
            disabled={loading}
            className="px-6 py-2 bg-customActiveText hover:bg-sky-500 text-white text-sm font-medium rounded-md transition disabled:opacity-50"
          >
            {loading ? "Starting..." : "Start now!"}
          </button>
        </div>
      </div>
    </div>
  );
}
