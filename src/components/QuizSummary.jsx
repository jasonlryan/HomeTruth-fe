import { useEffect, useState } from "react";
import {
  getQuizAnswers,
  getQuizQuestions,
  updateAllQuizAnswers,
} from "../api/api";

export default function QuizEditor() {
  const [answers, setAnswers] = useState([]);
  const [editing, setEditing] = useState(false);
  const [currentAnswers, setCurrentAnswers] = useState({});

  // Add a loading state to prevent race conditions
  const [loading, setLoading] = useState(false);
  
  // Add notification state
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Function to show notifications
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const generatePrefilledAnswers = (data) => {
    const prefills = {};
    for (const q of data) {
      const userAnswers = q.user_answer || [];
      if (q.type === "multiple_choice") {
        prefills[q.id] = userAnswers
          .filter((ua) => ua.is_answered && ua.option_id)
          .map((ua) => ua.option_id);
      } else if (q.type === "single_choice") {
        const answeredOption = userAnswers.find(
          (ua) => ua.is_answered && ua.option_id
        );
        prefills[q.id] = answeredOption?.option_id || null;
      } else if (q.type === "text") {
        const answer = userAnswers[0]?.answer;
        prefills[q.id] = Array.isArray(answer)
          ? answer.join(", ")
          : answer || "";
      } else if (q.type === "rating") {
        const answer = userAnswers[0]?.answer;
        prefills[q.id] = Array.isArray(answer) ? answer[0] : answer || "";
      }
    }
    return prefills;
  };

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const [answersRes] = await Promise.all([
          getQuizAnswers(),
          getQuizQuestions(),
        ]);

        if (answersRes.success && Array.isArray(answersRes.data)) {
          setAnswers(answersRes.data);
          setCurrentAnswers(generatePrefilledAnswers(answersRes.data));
        } else {
          console.warn("No answers returned", answersRes);
        }
      } catch (err) {
        console.error("Error loading quiz answers", err);
      }
    };

    fetchAnswers();
  }, []);

  useEffect(() => {
    if (editing) {
      setCurrentAnswers(generatePrefilledAnswers(answers));
    }
  }, [editing, answers]);

  const handleAnswerChange = (questionId, value) => {
    setCurrentAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSaveAll = async () => {
    if (loading) return; // Prevent multiple simultaneous saves
    
    setLoading(true);
  
    
    // Better data formatting for the API
    const answerList = Object.entries(currentAnswers)
      .filter(([questionId, value]) => {
        // Only include answers that have actual values
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== null && value !== undefined && value !== "";
      })
      .map(([questionId, value]) => {
        const question = answers.find((a) => a.id === Number(questionId));
        if (!question) {
          console.warn(`Question not found for ID: ${questionId}`);
          return null;
        }
        

        
        return { 
          question, 
          value,
          questionId: Number(questionId)
        };
      })
      .filter(item => item !== null); // Remove any null items


    try {
      const res = await updateAllQuizAnswers(answerList);
      


      // Check for success in multiple possible formats
      const isSuccess = res.success || 
                       res.data?.success || 
                       res.status === 200 || 
                       (res.data && res.data.length > 0);

      if (!isSuccess) {
        console.error("Save all failed:", res);
        showNotification("Failed to save answers. Please try again.", "error");
        return;
      }

      
      // Show success message to user
      showNotification("Answers saved successfully!", "success");
      
      // APPROACH 1: Update local state immediately with saved values
      const updatedAnswers = answers.map(item => {
        const savedValue = currentAnswers[item.id];
        if (savedValue !== undefined) {
          // Create updated user_answer based on question type
          let updatedUserAnswer = [];
          
          if (item.type === "multiple_choice") {
            updatedUserAnswer = Array.isArray(savedValue) 
              ? savedValue.map(optionId => {
                  const option = item.options?.find(opt => opt.id === optionId);
                  return {
                    is_answered: true,
                    option_id: optionId,
                    option_text: option?.text || '',
                    answer: null
                  };
                })
              : [];
          } else if (item.type === "single_choice") {
            if (savedValue) {
              const option = item.options?.find(opt => opt.id === savedValue);
              updatedUserAnswer = [{
                is_answered: true,
                option_id: savedValue,
                option_text: option?.text || '',
                answer: null
              }];
            }
          } else if (item.type === "text" || item.type === "rating") {
            updatedUserAnswer = [{
              is_answered: true,
              option_id: null,
              option_text: null,
              answer: savedValue
            }];
          }
          
          return {
            ...item,
            user_answer: updatedUserAnswer
          };
        }
        return item;
      });
      
      setAnswers(updatedAnswers);
      
      // APPROACH 2: Also try to fetch fresh data from API (but don't wait for it)
      setTimeout(async () => {
        try {
          const updated = await getQuizAnswers();
          if (updated.success && Array.isArray(updated.data)) {
            const freshAnswers = updated.data.map(item => ({
              ...item,
              user_answer: item.user_answer ? [...item.user_answer] : []
            }));
            setAnswers(freshAnswers);
          }
        } catch (err) {
          console.warn("Could not sync with API:", err);
        }
      }, 500); // Wait 500ms before trying to sync with API
      
    } catch (err) {
      console.error("Error saving all answers", err);
      showNotification("An error occurred while saving. Please try again.", "error");
    } finally {
      // Always exit edit mode and reset loading, regardless of success/failure
      setLoading(false);
      setEditing(false);
      setCurrentAnswers({});
    }
  };

  const renderEditableInput = (question) => {
    const value =
      currentAnswers[question.id] ??
      (question.type === "multiple_choice" ? [] : "");
    const options = question.options || [];

    if (String(question.id) === "5") {
      const imageOptions = {
        [options[0]?.id]: {
          label: "Visuals (e.g., charts, diagrams)",
          img: "/assets/visuals.png",
        },
        [options[1]?.id]: {
          label: "Bullet summaries",
          img: "/assets/bullets.png",
        },
        [options[2]?.id]: {
          label: "Narrative guides",
          img: "/assets/narrative.png",
        },
        [options[3]?.id]: {
          label: "Interactive Q&A",
          img: "/assets/interactive.png",
        },
      };

      return (
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-4">
          {options.map((opt) => {
            const isSelected = value === opt.id;
            const meta = imageOptions[opt.id] || { label: opt.text, img: null };

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleAnswerChange(question.id, opt.id)}
                className={`flex flex-col items-center justify-center h-36 w-36 rounded-lg border transition-all text-center px-2 py-2 text-sm font-medium shadow-sm ${
                  isSelected
                    ? "bg-customActive border-customActiveText  ring-2 ring-customActive"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {meta.img && (
                  <img
                    src={meta.img}
                    alt={meta.label}
                    className="w-8 h-8 object-contain mb-2"
                  />
                )}
                <input
                  type="radio"
                  checked={isSelected}
                  readOnly
                  className="mb-1 sr-only"
                />
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      );
    }

    if (String(question.id) === "6") {
      return (
        <div className="flex justify-between gap-4 mt-4 max-w-xl mx-auto">
          {options.map((opt) => {
            const isSelected = value === opt.id;
            return (
              <label
                key={opt.id}
                className="flex flex-col items-center text-sm cursor-pointer"
              >
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  checked={isSelected}
                  onChange={() => handleAnswerChange(question.id, opt.id)}
                  className="appearance-none w-5 h-5 border-2 rounded-full checked:border-[6px] border-customActiveText checked:border-customActiveText transition mb-1"
                />
                <span
                  className={`mt-1 ${
                    isSelected ? "text-black font-medium" : "text-gray-600"
                  }`}
                >
                  {opt.text}
                </span>
              </label>
            );
          })}
        </div>
      );
    }

    if (
      (!options || options.length === 0) &&
      (question.type === "multiple_choice" || question.type === "single_choice")
    ) {
      return (
        <p className="text-red-600 mt-2">
          ⚠️ Missing options for this question
        </p>
      );
    }

    if (question.type === "multiple_choice") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {options.map((opt) => {
    const isSelected = Array.isArray(value) && value.includes(opt.id);

    return (
      <button
        key={opt.id}
        type="button"
        onClick={() => {
          const updated = isSelected
            ? value.filter((id) => id !== opt.id)
            : [...value, opt.id];
          handleAnswerChange(question.id, updated);
        }}
        className={`w-full flex items-center justify-start px-4 py-4 border rounded-md transition text-sm font-medium ${
          isSelected
            ? "bg-customActive border-customActive text-customActiveText"
            : "border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        {/* custom checkbox */}
        <span
          className={`mr-2 inline-flex items-center justify-center w-4 h-4 rounded border ${
            isSelected
              ? "bg-customActiveText border-customActiveText"
              : "border-gray-300"
          }`}
        >
          {isSelected && (
            <svg
              viewBox="0 0 20 20"
              className="w-3 h-3"
              fill="white"            // ✅ white check
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 111.414-1.414L8.5 11.086l6.543-6.543a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>

        {opt.text}
      </button>
    );
  })}
</div>

      );
    }

    if (question.type === "single_choice") {
      return (
        <div className="space-y-2">
          {options.map((opt) => {
            const isSelected = value === opt.id;
            return (
              <label
                key={opt.id}
                className={`block cursor-pointer p-3 border rounded-md transition ${
                  isSelected
                    ? "bg-primary border-customBlue text-black"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  checked={isSelected}
                  onChange={() => handleAnswerChange(question.id, opt.id)}
                  className="mr-2"
                />
                <span>{opt.text}</span>
              </label>
            );
          })}
        </div>
      );
    }

    if (question.type === "text") {
      return (
        <textarea
          className="w-full border rounded p-2 min-h-[80px]"
          placeholder="Enter your answer..."
          value={value}
          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
        />
      );
    }

    if (question.type === "rating") {
      return (
        <div className="space-y-2">
  {/* range slider */}
  <input
    type="range"
    min={question.options[0]?.text || "1"}
    max={question.options[1]?.text || "10"}
    value={value || question.options[0]?.text || "1"}
    onChange={(e) =>
      handleAnswerChange(question.id, Number(e.target.value))
    }
    className="
      w-full h-2 rounded-lg appearance-none cursor-pointer 
      bg-gray-200 accent-customActiveText
    "
  />

  {/* labels */}
  <div className="flex justify-between text-sm text-gray-600">
    <span>{question.options[0]?.text || "1"}</span>
    <span className="font-medium text-customActiveText">
      Current: {value || question.options[0]?.text || "1"}
    </span>
    <span>{question.options[1]?.text || "10"}</span>
  </div>

  {/* number input */}
  <input
    type="number"
    min={question.options[0]?.text || "1"}
    max={question.options[1]?.text || "10"}
    value={value}
    onChange={(e) =>
      handleAnswerChange(question.id, Number(e.target.value))
    }
    className="
      w-full border rounded-md p-2 mt-2 
      focus:ring-2 focus:ring-customActiveText focus:border-customActiveText
    "
    placeholder={`Enter a value between ${
      question.options[0]?.text || "1"
    } and ${question.options[1]?.text || "10"}`}
  />
</div>

      );
    }

    return (
      <span className="italic text-red-500">Unsupported question type</span>
    );
  };

  const renderReadOnlyAnswer = (question) => {
    const userAnswers = question.user_answer || [];

    if (question.type === "text" || question.type === "rating") {
      const answer = userAnswers[0]?.answer;
      return answer ? (
        answer.toString()
      ) : (
        <span className="italic text-gray-400">No answer</span>
      );
    }

    if (question.type === "multiple_choice") {
      const selected = userAnswers
        .filter((ua) => ua.is_answered && ua.option_text)
        .map((ua) => ua.option_text);
      return selected.length ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((text, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-customBlue text-black text-sm rounded-md"
            >
              {text}
            </span>
          ))}
        </div>
      ) : (
        <span className="italic text-gray-400">No answer</span>
      );
    }

    if (question.type === "single_choice") {
      const selected = userAnswers.find(
        (ua) => ua.is_answered && ua.option_text
      );
      return selected ? (
        <span className="inline-block px-3 py-1 bg-customBlue text-black text-sm rounded-full">
          {selected.option_text}
        </span>
      ) : (
        <span className="italic text-gray-400">No answer</span>
      );
    }

    return <span className="italic text-red-500">Unsupported type</span>;
  };

  return (
    <div className="p-6 rounded-xl w-full max-w-full">
      <div className="flex justify-between items-center mb-6 px-4 py-3 rounded-md bg-white border-gray-200 shadow-sm">
        <h2 className="text-2xl">Edit Questionnaire Answers
</h2>
        <button
          className={`text-sm font-medium rounded-md px-4 py-2 transition 
    ${
      editing
        ? "text-customActiveText border border-customActiveText hover:bg-blue-50"
        : "text-white bg-customActiveText hover:bg-sky-500"
    }`}
          onClick={() => setEditing((prev) => !prev)}
        >
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`mb-4 p-4 rounded-lg border-l-4 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-400 text-green-700' 
            : 'bg-red-50 border-red-400 text-red-700'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setNotification({ show: false, message: '', type: '' })}
                className="inline-flex text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {answers.map((item, index) => (
          <div
            key={item.id}
            className="bg-white shadow-md rounded-xl p-6 border border-gray-100"
          >
            <p className="text-base font-semibold text-gray-900 mb-2 ">
              {item.question_text}
            </p>
            {!editing && (!item.user_answer || item.user_answer.length === 0 || !item.user_answer.some(ua => ua.is_answered)) && (
              <p className="text-sm text-gray-500 mb-4">Choose one.</p>
            )}
            <div className="mt-2 text-sm text-gray-700 max-w-xl">
              {editing ? (
                <>
                  {renderEditableInput(item)}
                </>
              ) : (
                renderReadOnlyAnswer(item)
              )}
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <div className="mt-6 text-right">
          <button
            onClick={handleSaveAll}
            disabled={loading}
            className={`text-sm font-medium px-6 py-2 rounded transition ${
              loading 
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-customActiveText hover:bg-sky-500 text-white"
            }`}
          >
            {loading ? "Saving..." : "Save Responses"}
          </button>
        </div>
      )}
    </div>
  );
}