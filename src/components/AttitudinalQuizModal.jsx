import { useEffect, useState } from "react";
import { getQuizQuestions, submitQuizAnswer } from "../api/api";

export default function AttitudinalQuizModal({ onClose }) {
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Lock layout while quiz is visible
  useEffect(() => {
    localStorage.setItem("onboarding_lock", "true");
    localStorage.setItem("quiz_modal_active", "true");
    try { window.dispatchEvent(new StorageEvent("storage")); } catch {}
    return () => {
      // don't unlock here; unlock only on final click or bailout
    };
  }, []);

  // Load questions
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError("");
        const res = await getQuizQuestions();
        if (!mounted) return;

        const questions = Array.isArray(res?.data) ? res.data : [];
        const completedFlag = !!res?.meta?.completed; // if your API returns it

        // ✅ If no questions left OR API says completed, auto-finish
        if (completedFlag || questions.length === 0) {
        // mark onboarding done & unlock, then exit immediately
        localStorage.setItem("new_user", "false");
        localStorage.removeItem("onboarding_lock");
        localStorage.removeItem("quiz_modal_active");
        try { window.dispatchEvent(new StorageEvent("storage")); } catch {}
        onClose?.();
          return;
        }

        setAllQuestions(questions);
      } catch (e) {
        console.error(e);
        if (mounted) setLoadError("Failed to load quiz. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [onClose]);

  const currentQuestion = allQuestions[currentIndex];

  const handleAnswerChange = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const canProceed = (q) => {
    if (!q) return false;
    const a = answers[q.id];
    if (q.type === "text" || q.type === "rating") return a !== undefined && a !== null && a !== "";
    if (q.type === "single_choice") return !!a;
    if (q.type === "multiple_choice") return Array.isArray(a) && a.length > 0;
    return false;
  };

  const submitAnswer = async (q, a) => {
    try { await submitQuizAnswer(q, a); }
    catch (e) { console.error("submit failed", e); /* non-blocking */ }
  };

  const gotoNextOrFinish = async () => {
    const q = currentQuestion;
    const a = answers[q.id];
    await submitAnswer(q, a);

    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Check if user has answered any questions before showing completion
      const hasAnsweredAny = Object.values(answers).some(answer => {
        if (Array.isArray(answer)) {
          return answer.length > 0;
        }
        return answer !== undefined && answer !== null && answer !== "";
      });
      
      if (hasAnsweredAny) {
        // go directly to finished screen
        setIsFinished(true);
      } else {
        // No answers provided, just close without completion message
        localStorage.setItem("new_user", "false");
        localStorage.setItem("quiz_completed", "true");
        localStorage.removeItem("onboarding_lock");
        localStorage.removeItem("quiz_modal_active");
        try { window.dispatchEvent(new StorageEvent("storage")); } catch {}
        onClose?.();
      }
    }
  };

  const handleSkip = () => {
    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Check if user has answered any questions before showing completion
      const hasAnsweredAny = Object.values(answers).some(answer => {
        if (Array.isArray(answer)) {
          return answer.length > 0;
        }
        return answer !== undefined && answer !== null && answer !== "";
      });
      
      if (hasAnsweredAny) {
        setIsFinished(true);
      } else {
        // No answers provided, just close without completion message
        localStorage.setItem("new_user", "false");
        localStorage.setItem("quiz_completed", "true");
        localStorage.removeItem("onboarding_lock");
        localStorage.removeItem("quiz_modal_active");
        try { window.dispatchEvent(new StorageEvent("storage")); } catch {}
        onClose?.();
      }
    }
  };

  const handleFinishClick = () => {
    // only on explicit finish do we mark onboarding complete
    localStorage.setItem("new_user", "false");
    localStorage.setItem("quiz_completed", "true");
    localStorage.removeItem("onboarding_lock");
    localStorage.removeItem("quiz_modal_active");
    try { window.dispatchEvent(new StorageEvent("storage")); } catch {}
    onClose?.();
  };


  const renderQuestionInput = (question) => {
    const value =
      answers[question.id] || (question.type === "multiple_choice" ? [] : "");

    switch (question.type) {
      case "single_choice":
        return (
          <div className="space-y-2">
            {question.quiz_options.map((opt) => (
              <label key={opt.id} className="block">
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  checked={value === opt.id}
                  onChange={() => handleAnswerChange(question.id, opt.id)}
                />
                <span className="ml-2">{opt.option}</span>
              </label>
            ))}
          </div>
        );

      case "multiple_choice":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
            {question.quiz_options.map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => {
                  const updated = value.includes(opt.id)
                    ? value.filter((id) => id !== opt.id)
                    : [...value, opt.id];
                  handleAnswerChange(question.id, updated);
                }}
                className={`w-full flex items-center justify-start px-4 py-4 border rounded-md transition text-md font-medium text-slateColor ${
                  value.includes(opt.id)
                    ? "bg-customActive border-customActiveText text-customActiveText"
                    : "border-gray-300 text-black hover:bg-gray-50"
                }`}
              >
<label className="flex items-start cursor-pointer relative">
  <div className="relative flex-shrink-0 mt-0.5">
    <input
      type="checkbox"
      checked={value.includes(opt.id)}
      readOnly
      className="peer appearance-none h-5 w-5 border border-gray-400 rounded bg-white checked:bg-customActiveText checked:border-customActiveText"
    />

    {/* Centered checkmark */}
    <svg
      className="absolute top-0 left-0 w-5 h-5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200 flex items-center justify-center"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </div>
  <span className="ml-2 text-sm leading-5">{opt.option}</span>
</label>
              </button>
            ))}
          </div>
        );

      case "text":
        return (
          <textarea
            className="w-full border rounded p-2 h-72"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        );

      case "rating":
        const ratingValue = answers[question.id] ?? 50000;
        const minRating = question.quiz_options?.[0]?.option || "50000";
        const maxRating = question.quiz_options?.[1]?.option || "750000";
        
        // Format number with Euro sign and commas
        const formatCurrency = (value) => {
          return `£${Number(value).toLocaleString()}`;
        };
        
        return (
          <div className="space-y-6">
            {/* Range Slider */}
            <div className="relative">
              <input
                type="range"
                min={minRating}
                max={maxRating}
                step="10000"
                value={ratingValue}
                onChange={(e) => handleAnswerChange(question.id, Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-customActiveText slider"
                style={{
                  background: `linear-gradient(to right, #19B0F0F0 0%, #19B0F0F0 ${((ratingValue - minRating) / (maxRating - minRating)) * 100}%, #E5E7EB ${((ratingValue - minRating) / (maxRating - minRating)) * 100}%, #E5E7EB 100%)`
                }}
              />
              
              {/* Current Value Tooltip */}
              <div 
                className="absolute top-[-50px] bg-gray-100 px-3 py-1 rounded-md text-sm font-medium text-gray-800 shadow-sm"
                style={{
                  left: `calc(${((ratingValue - minRating) / (maxRating - minRating)) * 100}% - 30px)`,
                  transform: 'translateX(0)'
                }}
              >
                {formatCurrency(ratingValue)}
              </div>
            </div>
            
            {/* Min/Max Labels */}
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>{formatCurrency(minRating)}</span>
              <span>{formatCurrency(maxRating)}</span>
            </div>
          </div>
        );

      default:
        return <p>Unsupported question type: {question.type}</p>;
    }
  };


  // Finished screen
  if (isFinished) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl w-80 max-w-md p-8 text-center border border-gray-100">
          <div className="flex items-center justify-center gap-2 mb-4 text-3xl">
            <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Thanks for sharing!</h2>
          <p className="text-sm text-gray-600 mb-6">
            We've used your answers to customize your dashboard, insights, and tone.
          </p>
          <button className="bg-customActiveText text-white px-4 py-2 rounded-md" onClick={handleFinishClick}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Loading / Error
  if (loading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          {loadError ? (
            <>
              <p className="text-gray-700 mb-4">{loadError}</p>
              <button
                className="bg-primary text-white px-4 py-2 rounded-md"
                onClick={() => {
                  // bailout: unlock and exit
                  localStorage.removeItem("onboarding_lock");
                  localStorage.removeItem("quiz_modal_active");
                  try { window.dispatchEvent(new StorageEvent("storage")); } catch {}
                  onClose?.();
                }}
              >
                Continue to Dashboard
              </button>
            </>
          ) : (
            <>
              <div className="animate-pulse">
                <div className="h-6 w-48 bg-gray-200 rounded mb-3 mx-auto"></div>
                <div className="h-4 w-80 bg-gray-200 rounded mb-6 mx-auto"></div>
                <div className="h-40 w-[32rem] bg-gray-200 rounded mx-auto"></div>
              </div>
              <p className="text-sm text-gray-500 mt-4">Loading quiz…</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Active quiz
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl h-[600px] p-6 flex flex-col overflow-hidden border border-gray-100">
        <h2 className="text-2xl font-bold">Let's understand your lifestyle</h2>
        <p className="text-sm text-gray-500 mb-4">
          Help us personalize your experience by understanding your needs.
        </p>

        <div className="flex-grow overflow-y-auto pr-1">
          <div className="mb-4 text-sm font-medium text-gray-700">
            Step {currentIndex + 1} of {allQuestions.length}
            <div className="h-2 mt-2 bg-gray-200 rounded-full">
              <div
                className="bg-customActiveText h-2 rounded-full"
                style={{ width: `${((currentIndex + 1) / allQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          <p className="text-md font-bold mb-1 mt-5">{currentQuestion.question_text}</p>
          <p className="text-xs text-gray-500 mb-4">
            {currentQuestion.type === "multiple_choice" ? "Choose all that apply." : "\u00A0"}
          </p>

          <div>{renderQuestionInput(currentQuestion)}</div>
        </div>

        <div className="flex justify-between pt-4 mt-2 border-t border-gray-200">
          <button type="button" onClick={handleSkip} className="text-sm text-gray-600 hover:underline">
            Skip for now
          </button>
          <button
            type="button"
            onClick={gotoNextOrFinish}
            disabled={!canProceed(currentQuestion)}
            className={`px-4 py-2 rounded-md text-sm text-white transition ${
              canProceed(currentQuestion) ? "bg-customActiveText" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {currentIndex < allQuestions.length - 1 ? "Next →" : "Finish"}
          </button>
        </div>
      </div>
    </div>
  );
}
