import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBudgetConversationStatus } from "../../api/api";

export default function BudgetQAEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getBudgetConversationStatus(id);
        setFields(res?.fieldsWithAnswers || []);
      } catch (err) {
        console.error("Failed to load Q&A:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleUpdateEstimate = () => {
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="bg-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Project Estimation Questionnaire</h1>

      <div className="space-y-4">
        {fields.map((field, idx) => (
          <div key={idx} className="bg-gray-50 p-4 border rounded-lg">
            <p className="text-sm font-medium text-gray-700">{field.question}</p>
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-gray-900 bg-gray-100 p-2 rounded-md w-full mr-4">
                {field.answer ?? "No answer provided"}
              </div>
              <button className="text-blue-600 hover:underline text-sm">Edit ✎</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={handleUpdateEstimate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Update Estimate
        </button>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}
