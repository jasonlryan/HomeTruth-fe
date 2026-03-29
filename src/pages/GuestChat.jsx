import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { askAnonymousAI, askAIChat, saveNote } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { MessageCircle, Save } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Reusable assistant bubble that renders Markdown safely.
function AssistantBubble({ text }) {
  return (
    <div className="bg-[#EDEDED] p-3 rounded-xl max-w-[70%] text-start whitespace-pre-wrap">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, children, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline break-words"
            >
              {children}
            </a>
          ),
          // Make headings inline and not full-width
          h1: ({ node, ...props }) => (
            <p className="inline text-xl font-semibold mb-2 mt-1 leading-snug text-left break-words" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <p className="inline text-lg font-semibold mb-2 mt-1 leading-snug text-left break-words" {...props} />
          ),
          h3: ({ node, children, ...props }) => (
            <h3 className="inline text-base font-semibold mb-2 mt-1 leading-snug text-left break-words" {...props}>
              {children}
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
        {text || ""}
      </ReactMarkdown>
    </div>
  );
}

export default function GuestChat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [savedMessageIds, setSavedMessageIds] = useState(new Set());
  const [conversationId, setConversationId] = useState(null);

  const suggestions = [
    "What is leasehold?",
    "How much stamp duty will I pay?",
    "What's my property worth?",
    "Should I remortgage?",
  ];

  // Handle user authentication changes
  useEffect(() => {
    if (user && chatHistory.length > 0 && !conversationId) {
      // User just logged in, we can now save notes
    }
  }, [user, chatHistory.length, conversationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    const q = question.trim();
    if (!q) return;

    setLoading(true);
    
    // Add user question to chat history
    const newChatEntry = { 
      type: 'user', 
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatHistory(prev => [...prev, newChatEntry]);
    setQuestion("");

    try {
      let resp;
      
      if (user) {
        // Use authenticated chat API
        const result = await askAIChat(q, conversationId);
        resp = result.reply;
        
        // Set conversation ID if this is the first message
        if (!conversationId && result.conversation_id) {
          setConversationId(result.conversation_id.toString());
        }
      } else {
        // Use anonymous AI API for guests
        resp = await askAnonymousAI(q);
      }
      
      // Add AI response to chat history
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        content: resp,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error("AI Error:", err);
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        content: "Something went wrong. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (text) => {
    if (loading) return;
    setQuestion(text);
  };

  const clearChat = () => {
    setChatHistory([]);
    setQuestion("");
    setConversationId(null);
    setSavedMessageIds(new Set());
  };

  const saveMessage = async (index) => {
    const message = chatHistory[index];
    if (message && message.type === 'ai') {
      // Check if user is authenticated
      if (!user) {
        setShowRegisterModal(true);
        return;
      }

      // User is authenticated, proceed with saving
      try {
        // Find the corresponding user question for this AI response
        const userMessage = chatHistory[index - 1];
        if (!userMessage || userMessage.type !== 'user') {
          console.error('No corresponding user message found');
          return;
        }

        // Generate a unique ID for this message pair
        const messageId = `guest-chat-${Date.now()}-${index}`;
        
        await saveNote({
          chat_history_id: messageId,
          title: userMessage.content.slice(0, 100),
        });
        

        // Mark as saved
        setSavedMessageIds(prev => new Set([...prev, index]));
        
        // Show success toast
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        
      } catch (error) {
        // You could show an error toast here
      }
    }
  };

  return (
    <div className="chat-system-font min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <MessageCircle className="w-8 h-8 text-sky-500" />
            <h1 className="text-xl font-semibold text-gray-800">
              HomeTruth Assistant
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Guest User</span>
            {chatHistory.length > 0 && (
              <button
                onClick={clearChat}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100 transition"
              >
                Clear Chat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Chat Header */}
          
          {/* Chat Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {chatHistory.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Start a conversation</h3>
                <p className="text-gray-500 mb-6">Ask me anything about property, buying, selling, or managing your home.</p>
                
                {/* Suggestions */}
                <div className="flex flex-wrap justify-center gap-3">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm transition"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chatHistory.map((message, index) => (
                <div key={`message-${index}-${message.timestamp}`} className="mb-6 relative">
                  {message.type === 'user' ? (
                    <>
                      <div className="flex justify-end">
                        <div className="bg-customActiveText p-3 rounded-xl max-w-[70%] whitespace-pre-wrap text-white">
                          {message.content}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="text-xs text-gray-400 mt-1">
                          {message.timestamp}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-start mt-2 items-start space-x-2">
                        <AssistantBubble text={message.content} />
                        <button
                          onClick={() => saveMessage(index)}
                          className={`${
                            savedMessageIds.has(index)
                              ? "text-green-600 cursor-default"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                          title={
                            savedMessageIds.has(index) 
                              ? 'Saved to notes' 
                              : user 
                                ? 'Save to notes' 
                                : 'Save to notes (requires registration)'
                          }
                          disabled={savedMessageIds.has(index)}
                        >
                          <span className="material-symbols-outlined">
                            {savedMessageIds.has(index)
                              ? "check_circle"
                              : "assignment"}
                          </span>
                        </button>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 ml-1">
                        {message.timestamp}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
            
            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start mt-2 items-start space-x-2">
                <div className="bg-[#EDEDED] p-3 rounded-xl max-w-[70%] whitespace-pre-wrap flex flex-col items-end space-y-2">
                  <span className="typing-dots inline-flex space-x-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chat Message
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !question.trim()}
                    className="bg-customActiveText hover:bg-sky-500 text-white rounded-xl px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                      <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 11l18-8-8 18-2-7-8-3z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="currentColor"
                />
              </svg>
                  </button>
                </div>
              </div>
              
              {/* Action Icons */}
              
            </form>
          </div>
        </div>

        {/* Call-to-Action */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Want to save your conversations and get more features?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="bg-customActiveText hover:bg-sky-500 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Sign Up for Free
            </button>
            <button
              onClick={() => navigate("/pro-features")}
              className="bg-white hover:bg-gray-50 text-customActiveText border-2 border-sky-500 px-6 py-3 rounded-lg font-medium transition"
            >
              Explore Pro Features
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Save className="w-4 h-4" />
          <span>{user ? 'Message saved to notes!' : 'Please register to save notes'}</span>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Save className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Save to Notes
              </h3>
              <p className="text-gray-600 mb-6">
                Please register to save your responses to your personal notes and access them anytime.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/register")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition flex-1"
                >
                  Register Now
                </button>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition flex-1"
                >
                  Maybe Later
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                Already have an account? 
                <button
                  onClick={() => {
                    setShowRegisterModal(false);
                    navigate("/login");
                  }}
                  className="text-blue-500 hover:text-blue-600 ml-1"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
