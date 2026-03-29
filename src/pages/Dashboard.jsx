import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AttitudinalQuizModal from "../components/AttitudinalQuizModal";
import CompleteProfileModal from "../components/CompleteProfileModal";
import PropertyCard from "../components/PropertyCard";
import PropertyDetailModal from "../components/PropertyDetailModal";
import PageTitle from "../components/PageTitle";
import { getAllSavedItems, getUserDocuments, getDocumentPreview } from "../api/api";
import { checkQuizCompletion } from "../utils/quizUtils";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showQuiz, setShowQuiz] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [query, setQuery] = useState("");
  const [aiResult] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [savedItems, setSavedItems] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [userDocuments, setUserDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [checkingQuizCompletion, setCheckingQuizCompletion] = useState(false);
  const [quizCheckedThisSession, setQuizCheckedThisSession] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  // Function to handle document preview
  const handleDocumentPreview = async (document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
    setDocumentPreview(null);
    setPreviewError(null);
    
    // Fetch document preview
    if (document?.id) {
      setIsLoadingPreview(true);
      try {
        const preview = await getDocumentPreview(document.id);
        setDocumentPreview(preview);
      } catch (error) {
        setPreviewError(`Failed to load document preview: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsLoadingPreview(false);
      }
    }
  };

  // Function to check quiz completion status
  // This function is called for existing users (not new users) to check if they have completed the quiz
  // If the quiz is not completed, the quiz modal will be shown
  const checkQuizCompletionStatus = async () => {
    try {
      setCheckingQuizCompletion(true);
      const isQuizCompleted = await checkQuizCompletion();
      
      if (!isQuizCompleted) {
        // User hasn't completed the quiz, show the modal
        setShowQuiz(true);
      } else {
        // User has completed the quiz, mark it as completed for future sessions
        localStorage.setItem("quiz_completed", "true");
      }
      
      // Mark that we've checked quiz completion for this session
      setQuizCheckedThisSession(true);
      localStorage.setItem("quiz_checked_this_session", "true");
    } catch (error) {
      console.error('Error checking quiz completion:', error);
      // If there's an error, don't show the quiz to avoid blocking the user
      // Still mark as checked to avoid repeated attempts
      setQuizCheckedThisSession(true);
      localStorage.setItem("quiz_checked_this_session", "true");
    } finally {
      setCheckingQuizCompletion(false);
    }
  };

  // Function to fetch user documents
  const fetchUserDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const response = await getUserDocuments({ limit: 3 }); // Get only 3 recent documents
      
      // Handle different possible response structures (matching Documents.jsx pattern)
      let documents = [];
      if (response?.data?.documents) documents = Array.isArray(response.data.documents) ? response.data.documents : [];
      else if (Array.isArray(response?.data)) documents = response.data;
      else if (Array.isArray(response)) documents = response;
      
      setUserDocuments(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setUserDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is admin - admins skip all onboarding flows
    const userRole = user?.role || localStorage.getItem("user_role");
    const isAdmin = userRole === "admin";

    // If admin, skip all onboarding and redirect to knowledge base if not already there
    if (isAdmin) {
      // Clear any onboarding flags for admin
      localStorage.removeItem("require_profile");
      localStorage.removeItem("new_user");
      localStorage.removeItem("quiz_modal_active");
      localStorage.removeItem("onboarding_lock");
      localStorage.setItem("quiz_completed", "true");
      localStorage.setItem("quiz_checked_this_session", "true");
      
      // Redirect admin to knowledge base if they're on dashboard
      if (window.location.pathname === "/dashboard") {
        navigate("/admin/knowledge-base", { replace: true });
      }
      return;
    }

    const needsProfile = localStorage.getItem("require_profile") === "true";
    const isNewUser = localStorage.getItem("new_user") === "true";
    const fromWelcomePage = localStorage.getItem("from_welcome_page") === "true";

    if (needsProfile) {
      setShowProfile(true);
    } else if (isNewUser && !fromWelcomePage) {
      // Only redirect if this is a fresh new user (not returning from welcome page)
      // Check if user has ever been to welcome page before
      const hasBeenToWelcome = localStorage.getItem("has_been_to_welcome") === "true";
      if (!hasBeenToWelcome) {
        navigate("/welcome", { replace: true });
        return;
      }
    }
    
    // Clear the from_welcome_page flag after checking
    if (fromWelcomePage) {
      localStorage.removeItem("from_welcome_page");
      // Also ensure new_user flag is cleared when coming from welcome page
      localStorage.removeItem("new_user");
      // Trigger storage event to update layout
      try { window.dispatchEvent(new StorageEvent("storage")); } catch {}
      // Force a small delay to ensure layout updates
      setTimeout(() => {
        try { window.dispatchEvent(new StorageEvent("storage")); } catch {}
      }, 100);
    }

    // Check quiz completion for existing users (not new users or profile completion)
    // Don't check if user just came from welcome page (they already had the chance to take quiz)
    // Only check once per session to avoid showing modal repeatedly
    // Also don't check if user has already completed quiz in a previous session
    if (!needsProfile && !isNewUser && !fromWelcomePage && !quizCheckedThisSession) {
      // Check if user has already completed quiz in a previous session
      const hasCompletedQuiz = localStorage.getItem("quiz_completed") === "true";
     
      if (!hasCompletedQuiz) {
        checkQuizCompletionStatus();
      } else {
        // Mark as checked for this session to avoid repeated checks
        setQuizCheckedThisSession(true);
        localStorage.setItem("quiz_checked_this_session", "true");
      }
    } 

    // Fetch all saved items (notes + budget calculations)
    getAllSavedItems({ page: 1, limit: 10 })
      .then((response) => {
        // Handle the API response structure: response.data.items
        let items = [];
        
        if (response?.data?.items && Array.isArray(response.data.items)) {
          items = response.data.items;
        } else if (Array.isArray(response)) {
          items = response;
        } else if (Array.isArray(response?.data)) {
          items = response.data;
        } else if (Array.isArray(response?.savedItems)) {
          items = response.savedItems;
        } else if (Array.isArray(response?.items)) {
          items = response.items;
        } else {
          console.warn("Unexpected API response structure:", response);
          items = [];
        }
        
        setSavedItems(items);
      })
      .catch((err) => console.error("Failed to load saved items", err));

    // Fetch user documents
    fetchUserDocuments();
  }, [navigate, quizCheckedThisSession, user]);

  const handleProfileComplete = () => {
    localStorage.removeItem("require_profile");
    localStorage.setItem("new_user", "true");
    setShowProfile(false);
    // Redirect to welcome page instead of showing quiz directly
    navigate("/welcome", { replace: true });
  };

  const handleQuizClose = () => {
    localStorage.setItem("new_user", "false");
    localStorage.removeItem("from_welcome_page");
    setShowQuiz(false);
    // Quiz completion is handled by the AttitudinalQuizModal component
  };

  const handleSearch = () => {
    if (!query.trim()) return;

    // Store the query in localStorage to pass it to Ask HomeTruth page
    localStorage.setItem("dashboard_query", query);

    // Navigate to Ask HomeTruth page
    navigate("/ask-ai");
  };

  const handleNextBatch = () => {
    if (!aiResult?.properties) return;
    const nextIndex = visibleIndex + 3;
    setVisibleIndex(nextIndex >= aiResult.properties.length ? 0 : nextIndex);
  };

  // --- Takeover screens with white background ---
  if (showProfile) {
    return (
      <div className="min-h-screen bg-white">
        <CompleteProfileModal onComplete={handleProfileComplete} />
      </div>
    );
  }

  if (showQuiz) {
    return (
      <div className="min-h-screen bg-white">
        <AttitudinalQuizModal onClose={handleQuizClose} />
      </div>
    );
  }

  // Show loading state while checking quiz completion
  if (checkingQuizCompletion) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  // ---------------------------------------------

  return (
    <>
      <div className="min-h-screen bg-[#F5F7FA] px-8 py-8">
        {/* Ask HomeTruth Title */}
        <PageTitle as="h2" className="mb-6">Ask HomeTruth</PageTitle>

        {/* Main Card with ht.png background */}
        <div
          className="relative rounded-2xl p-8 mb-8 overflow-hidden"
          style={{
            backgroundImage: "url(/assets/ht.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Dark overlay (same as LandingPage) */}
          <div className="absolute inset-0 bg-black/50 rounded-2xl" />
          <div className="relative z-10">
            {/* Search Bar */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Ask any property question..."
                className="flex-1 text-base bg-white h-14 pl-4 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="h-14 w-14 rounded-lg bg-customActiveText text-white flex items-center justify-center hover:bg-sky-500 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 29 30"
                  fill="none"
                >
                  <path
                    d="M12.428 17.0709L1.03516 11.8923L27.9637 1.53516L17.6066 28.4637L12.428 17.0709Z"
                    fill="white"
                  />
                  <path
                    d="M12.428 17.0709L18.6423 10.8566"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Search the web button */}
            <div className="mb-4">
              <button className="flex items-center text-sm px-4 py-2 rounded-md bg-white hover:bg-gray-50 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                  />
                </svg>
                <span className="ml-2">Search the web</span>
              </button>
            </div>

            {/* Try Asking label and Suggested Questions */}
            <div className="flex items-center gap-4">
              <span className="text-white text-md font-medium">Try Asking:</span>
              <div className="flex gap-2">
                {[
                  "How much stamp duty will I pay?",
                  "What's my property worth?",
                  "Should I remortgage?",
                ].map((suggestion, index) => (
                  <button
                    key={`suggestion-${index}`}
                    onClick={() => setQuery(suggestion)}
                    className="bg-white text-gray-700 text-md px-4 py-2 rounded-md hover:bg-gray-50 transition whitespace-nowrap"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="px-8 py-8">
          <PageTitle as="h2" className="mb-6">
            Notes & Budget Calculator
          </PageTitle>

          {/* Note limit message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-customActiveText">
              You can save up to 5 notes in total, shared between Budget
              Calculations and Ask HomeTruth.
              <br />
              For example, you might have 4 Budget notes + 1 Ask HomeTruth note, or 3
              + 2, etc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Existing Saved Items (Notes + Budget Calculations) */}
            {Array.isArray(savedItems) ? savedItems.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="relative bg-white shadow-md p-4 rounded-lg hover:shadow-lg transition flex flex-col"
              >
                <button 
                  className="absolute top-3 right-3 text-blue-500 hover:text-blue-700"
                  onClick={() => navigate('/saved-notes')}
                  title="Edit notes"
                >
                  <span className="material-symbols-outlined text-xl">edit</span>
                </button>

                <h3 className="text-md font-semibold mb-2">{item.title || item.name || "Saved Item"}</h3>
                <div className="text-sm text-gray-700 line-clamp-3">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline break-words"
                        >
                          {props.children || props.href}
                        </a>
                      ),
                      h1: ({ node, ...props }) => (
                        <p className="inline text-xl font-semibold mb-2 mt-1 leading-snug text-left break-words" {...props}>
                          {props.children}
                        </p>
                      ),
                      h2: ({ node, ...props }) => (
                        <p className="inline text-lg font-semibold mb-2 mt-1 leading-snug text-left break-words" {...props}>
                          {props.children}
                        </p>
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="inline text-base font-semibold mb-2 mt-1 leading-snug text-left break-words" {...props}>
                          {props.children}
                        </h3>
                      ),
                      p: ({ node, ...props }) => (
                        <p className="mb-2 last:mb-0 text-left break-words" {...props} />
                      ),
                      li: ({ node, ...props }) => <li className="mb-1 text-left break-words" {...props} />,
                      code: ({ inline, className, children, ...props }) => (
                        <code
                          className={`${inline ? "px-1 py-0.5 rounded bg-gray-200" : ""} break-words`}
                          {...props}
                        >
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {(() => {
                      // Handle different content types
                      if (typeof item.content?.assistant_reply === 'string') {
                        return item.content.assistant_reply;
                      } else if (typeof item.assistant_reply === 'string') {
                        return item.assistant_reply;
                      } else if (typeof item.content === 'string') {
                        return item.content;
                      } else if (typeof item.description === 'string') {
                        return item.description;
                      } else if (item.content && typeof item.content === 'object') {
                        // Handle budget calculation data
                        if (item.type === 'budget_calculation' || item.type === 'budget') {
                          return `Budget calculation for ${item.content.location || 'property'}`;
                        }
                        return 'Saved item content';
                      }
                      return "No description available";
                    })()}
                  </ReactMarkdown>
                </div>

                <div className="flex justify-between items-center mt-auto">
                  <p className="text-xs text-gray-400">
                    {new Date(item.created_at || item.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => {
                      if (item.type === "budget_calculation" || item.type === "budget") {
                        navigate(`/budget/view/${item.id}`);
                      } else {
                        // For notes and unknown types, show modal
                        setSelectedNote(item);
                        setShowNoteModal(true);
                      }
                    }}
                    className="text-blue-500 text-sm hover:underline"
                  >
                    View
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                No saved items found
              </div>
            )}
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <PageTitle as="h2">
              Document Upload
            </PageTitle>
            <button 
              onClick={() => navigate("/documents")}
              className="text-customActiveText hover:underline text-sm font-medium"
            >
              View all
            </button>
          </div>

          {/* Debug Info - Remove in production */}
          

          {/* Document Cards */}
          {documentsLoading ? (
            <div className="text-center text-gray-500 py-4 mb-6">
              Loading documents...
            </div>
          ) : userDocuments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {userDocuments.map((doc, index) => (
                <div
                  key={doc.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                  <div className="flex flex-col">
                    {/* Document Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                      index === 0 ? '' :
                      index === 1 ? '' :
                      ' border-green-200'
                    }`}>
                      <span className={`material-symbols-outlined text-lg ${
                        index === 0 ? 'text-red-600' :
                        index === 1 ? 'text-blue-600' :
                        'text-green-600'
                      }`}>
                        docs
                      </span>
                    </div>
                    
                    {/* Document Name */}
                    <h3 className="text-sm font-semibold text-gray-900 truncate mb-3">
                      {doc.name || doc.original_filename || doc.filename || 'Document'}
                    </h3>
                    
                    {/* Date and Eye Icon */}
                    <div className="flex justify-between items-center mt-auto">
                      <p className="text-xs text-gray-500">
                        {(() => {
                          const date = new Date(doc.created_at);
                          const today = new Date();
                          const isToday = date.toDateString() === today.toDateString();
                          
                          if (isToday) {
                            return `Today, ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                          } else {
                            return date.toLocaleDateString();
                          }
                        })()}
                      </p>
                      <button
                        onClick={() => handleDocumentPreview(doc)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        title="Preview document"
                      >
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4 mb-6">
              No documents uploaded yet
            </div>
          )}

          {/* Drag and Drop Area */}
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
            <div className="flex flex-col items-center">
              {/* Upload Icon with Gradient Background */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-white text-4xl">upload</span>
              </div>
              
              <p className="text-gray-700 text-lg font-medium mb-2">
                Drag and drop more documents here
              </p>
              
              <p className="text-gray-500 text-sm mb-6">
                Supports PDF, DOCX, JPG (max 10MB)
              </p>
              
              <button 
                onClick={() => navigate("/documents")}
                className="bg-customActiveText text-white px-6 py-3 rounded-lg font-medium hover:bg-sky-500 transition"
              >
                Choose Files
              </button>
            </div>
          </div>
        </div>

        {/* Property Results Section */}
        {Array.isArray(aiResult?.properties) && (
          <div className="px-8 py-8">
            <div className="bg-white rounded-xl shadow p-8 mx-auto mb-6 max-w-9xl">
              <p className="text-sm text-gray-500 mb-4">powered by Zoopla</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {aiResult.properties
                  .slice(visibleIndex, visibleIndex + 3)
                  .map((property, idx) => (
                    <PropertyCard
                      key={`property-${property.id || visibleIndex + idx}`}
                      property={property}
                      onClick={() => setSelectedProperty(property)}
                    />
                  ))}
              </div>

              {aiResult.properties.length > 3 && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleNextBatch}
                    className="text-sm text-gray-500 px-4 py-2 inline-flex items-center gap-x-2"
                  >
                    <span className="material-symbols-outlined text-base align-middle">
                      forward_media
                    </span>
                    Generate new listings
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {aiResult?.error && (
          <div className="px-8 py-4">
            <p className="text-red-600">⚠ {aiResult.error}</p>
          </div>
        )}
      </div>

      {/* Property detail modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      {/* Note viewer modal */}
      {showNoteModal && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[85vh] flex flex-col relative">
            {/* Modal Header - Fixed */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900 truncate pr-8">
                {selectedNote.title || selectedNote.name}
              </h2>
              <button
                className="text-gray-500 hover:text-black transition-colors"
                onClick={() => setShowNoteModal(false)}
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              <div className="text-gray-700 prose prose-sm max-w-none">
              {(() => {
                // Handle different content types in modal
                if (typeof selectedNote.content?.assistant_reply === 'string') {
                  return (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline break-words"
                          >
                            {props.children || props.href}
                          </a>
                        ),
                        h1: ({ node, ...props }) => (
                          <p className="inline text-xl font-semibold mb-2 mt-1 leading-snug text-left break-words" {...props}>
                            {props.children}
                          </p>
                        ),
                        h2: ({ node, ...props }) => (
                          <p className="inline text-lg font-semibold mb-2 mt-1 leading-snug text-left break-words" {...props}>
                            {props.children}
                          </p>
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="inline text-base font-semibold mb-2 mt-1 leading-snug text-left break-words" {...props}>
                            {props.children}
                          </h3>
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-2 last:mb-0 text-left break-words" {...props} />
                        ),
                        li: ({ node, ...props }) => <li className="mb-1 text-left break-words" {...props} />,
                        code: ({ inline, className, children, ...props }) => (
                          <code
                            className={`${inline ? "px-1 py-0.5 rounded bg-gray-200" : ""} break-words`}
                            {...props}
                          >
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {selectedNote.content.assistant_reply}
                    </ReactMarkdown>
                  );
                } else if (typeof selectedNote.assistant_reply === 'string') {
                  return (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline break-words"
                          >
                            {props.children || props.href}
                          </a>
                        ),
                        h1: ({ node, ...props }) => (
                          <p className="inline text-xl font-semibold mb-2 mt-1 leading-snug text-left break-words" {...props}>
                            {props.children}
                          </p>
                        ),
                        h2: ({ node, ...props }) => (
                          <p className="inline text-lg font-semibold mb-2 mt-1 leading-snug text-left break-words" {...props}>
                            {props.children}
                          </p>
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="inline text-base font-semibold mb-2 mt-1 leading-snug text-left break-words" {...props}>
                            {props.children}
                          </h3>
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-2 last:mb-0 text-left break-words" {...props} />
                        ),
                        li: ({ node, ...props }) => <li className="mb-1 text-left break-words" {...props} />,
                        code: ({ inline, className, children, ...props }) => (
                          <code
                            className={`${inline ? "px-1 py-0.5 rounded bg-gray-200" : ""} break-words`}
                            {...props}
                          >
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {selectedNote.assistant_reply}
                    </ReactMarkdown>
                  );
                } else if (typeof selectedNote.content === 'string') {
                  return (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline break-words"
                          >
                            {props.children || props.href}
                          </a>
                        ),
                        h1: ({ node, ...props }) => (
                          <p className="inline text-xl font-semibold mb-2 mt-1 leading-snug text-left break-words" {...props}>
                            {props.children}
                          </p>
                        ),
                        h2: ({ node, ...props }) => (
                          <p className="inline text-lg font-semibold mb-2 mt-1 leading-snug text-left break-words" {...props}>
                            {props.children}
                          </p>
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="inline text-base font-semibold mb-2 mt-1 leading-snug text-left break-words" {...props}>
                            {props.children}
                          </h3>
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-2 last:mb-0 text-left break-words" {...props} />
                        ),
                        li: ({ node, ...props }) => <li className="mb-1 text-left break-words" {...props} />,
                        code: ({ inline, className, children, ...props }) => (
                          <code
                            className={`${inline ? "px-1 py-0.5 rounded bg-gray-200" : ""} break-words`}
                            {...props}
                          >
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {selectedNote.content}
                    </ReactMarkdown>
                  );
                } else if (typeof selectedNote.description === 'string') {
                  return (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline break-words"
                          >
                            {props.children || props.href}
                          </a>
                        ),
                        h1: ({ node, ...props }) => (
                          <p className="inline text-xl font-semibold mb-2 mt-1 leading-snug text-left break-words" {...props}>
                            {props.children}
                          </p>
                        ),
                        h2: ({ node, ...props }) => (
                          <p className="inline text-lg font-semibold mb-2 mt-1 leading-snug text-left break-words" {...props}>
                            {props.children}
                          </p>
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="inline text-base font-semibold mb-2 mt-1 leading-snug text-left break-words" {...props}>
                            {props.children}
                          </h3>
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-2 last:mb-0 text-left break-words" {...props} />
                        ),
                        li: ({ node, ...props }) => <li className="mb-1 text-left break-words" {...props} />,
                        code: ({ inline, className, children, ...props }) => (
                          <code
                            className={`${inline ? "px-1 py-0.5 rounded bg-gray-200" : ""} break-words`}
                            {...props}
                          >
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {selectedNote.description}
                    </ReactMarkdown>
                  );
                } else if (selectedNote.content && typeof selectedNote.content === 'object') {
                  // Handle budget calculation data
                  if (selectedNote.type === 'budget_calculation' || selectedNote.type === 'budget') {
                    return (
                      <div>
                        <p className="mb-2">Budget Calculation Details:</p>
                        <div className="bg-gray-50 p-3 rounded">
                          <p><strong>Location:</strong> {selectedNote.content.location || 'N/A'}</p>
                          <p><strong>Household Income:</strong> {selectedNote.content.household_income || 'N/A'}</p>
                          <p><strong>Monthly Payment Range:</strong> {selectedNote.content.estimated_monthly_payment_range || 'N/A'}</p>
                        </div>
                      </div>
                    );
                  }
                  return <p>Saved item content</p>;
                }
                return <p>No description available</p>;
              })()}
              </div>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 flex-shrink-0">
              <p className="text-sm text-gray-400">
                {new Date(selectedNote.created_at || selectedNote.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 truncate">
                  {selectedDocument.name || selectedDocument.original_filename || selectedDocument.filename || 'Document'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedDocument.report_type || 'Document'}
                </p>
              </div>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Document Preview Area */}
              <div className="mb-6">
                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                  {isLoadingPreview ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading document preview...</p>
                    </div>
                  ) : previewError ? (
                    <div className="text-center">
                      <span className="material-symbols-outlined text-6xl text-red-400 mb-4 block">description</span>
                      <p className="text-red-500 text-lg">Preview Error</p>
                      <p className="text-red-400 text-sm">{previewError}</p>
                    </div>
                  ) : documentPreview ? (
                    <div className="w-full h-full flex items-center justify-center">
                      {documentPreview.imageUrl || documentPreview.image || documentPreview.preview_url ? (
                        <img 
                          src={documentPreview.imageUrl || documentPreview.image || documentPreview.preview_url} 
                          alt="Document Preview" 
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : documentPreview.preview_content ? (
                        <div className="p-4 text-left w-full h-full overflow-auto">
                          <div className="whitespace-pre-wrap text-sm text-gray-700">
                            {documentPreview.preview_content}
                          </div>
                        </div>
                      ) : documentPreview.text || documentPreview.content ? (
                        <div className="p-4 text-left w-full h-full overflow-auto">
                          <div className="whitespace-pre-wrap text-sm text-gray-700">
                            {documentPreview.text || documentPreview.content}
                          </div>
                        </div>
                      ) : documentPreview.url || documentPreview.previewUrl ? (
                        <iframe 
                          src={documentPreview.url || documentPreview.previewUrl} 
                          className="w-full h-full border-0"
                          title="Document Preview"
                        />
                      ) : (
                        <div className="text-center">
                          <span className="material-symbols-outlined text-6xl text-gray-400 mb-4 block">description</span>
                          <p className="text-gray-500 text-lg">Document Preview</p>
                          <p className="text-gray-400 text-sm">Preview format not supported</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="material-symbols-outlined text-6xl text-gray-400 mb-4 block">description</span>
                      <p className="text-gray-500 text-lg">Document Preview</p>
                      <p className="text-gray-400 text-sm">Preview format not supported</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">File Name</p>
                  <p className="font-medium text-gray-900 truncate">
                    {selectedDocument.name || selectedDocument.original_filename || selectedDocument.filename || 'Document'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Report Type</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">
                      {selectedDocument.report_type || 'Document'}
                    </p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ready
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">File Size</p>
                  <p className="font-medium text-gray-900">
                    {selectedDocument.file_size || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">File Type</p>
                  <p className="font-medium text-gray-900">
                    {selectedDocument.file_type || selectedDocument.mime_type || '.pdf'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Added</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedDocument.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => navigate('/documents')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                Ask HomeTruth
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
