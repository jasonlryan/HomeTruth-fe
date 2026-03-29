import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import AttitudinalQuizModal from "../components/AttitudinalQuizModal";

export default function WelcomePage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    // Get user name from localStorage
    const name = localStorage.getItem("user_name");
    if (name) {
      setUserName(name);
    }
    
    // Mark that user has been to welcome page
    localStorage.setItem("has_been_to_welcome", "true");
  }, []);

  const handleGetStarted = () => {
    // Show quiz modal
    setShowQuiz(true);
  };

  const handleSkip = () => {
    // Set flag to indicate user came from welcome page
    localStorage.setItem("from_welcome_page", "true");
    // Mark quiz as checked for this session to prevent showing again
    localStorage.setItem("quiz_checked_this_session", "true");
    // Mark quiz as completed so it doesn't show on dashboard
    localStorage.setItem("quiz_completed", "true");
    // Clear new_user flag and navigate to dashboard
    localStorage.removeItem("new_user");
    navigate("/dashboard");
  };

  const handleQuizClose = () => {
    // Set flag to indicate user came from welcome page
    localStorage.setItem("from_welcome_page", "true");
    // Mark quiz as checked for this session to prevent showing again
    localStorage.setItem("quiz_checked_this_session", "true");
    // Mark quiz as completed (handled by AttitudinalQuizModal on actual completion)
    // But set it here too to prevent re-showing if user closes without completing
    localStorage.setItem("quiz_completed", "true");
    // Clear new_user flag and navigate to dashboard
    localStorage.removeItem("new_user");
    setShowQuiz(false);
    navigate("/dashboard");
  };

  // Show quiz modal if quiz is active
  if (showQuiz) {
    return (
      <div className="min-h-screen bg-white">
        <AttitudinalQuizModal onClose={handleQuizClose} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Logo */}
      <div className="flex items-center p-12">
        <div className="flex items-center space-x-3">
          <img 
            src="/assets/logo.png" 
            alt="Home Truth Logo" 
            className="w-80 h-20"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 md:px-16 lg:px-32 xl:px-96">
        <div className="w-full max-w-4xl text-center">
          {/* Welcome Message */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl text-gray-800 mb-4">
              Welcome, {userName || "User"}!
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              What's your vibe? A few fun questions and we'll craft your unique match.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8">
            <button
              onClick={handleGetStarted}
              className="bg-customActiveText hover:bg-sky-500 text-white px-12 py-4 rounded-lg text-lg font-medium transition-colors w-full sm:w-96"
            >
              Get Started
            </button>
            <button
              onClick={handleSkip}
              className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 px-12 py-4 rounded-lg text-lg font-medium transition-colors w-full sm:w-96"
            >
              Skip For Now
            </button>
          </div>

          {/* Info Text */}
          <p className="text-sm text-gray-500">
            This will only take 2-3 minutes and will help us provide you with better recommendations.
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
