import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { askAnonymousAI } from "../api/api";

const GUEST_SESSION_KEY = "guest_chat_session_id";
const GUEST_MESSAGE_COUNT_KEY = "guest_chat_message_count";
const GUEST_CHAT_MESSAGES_TO_RESTORE = "guest_chat_messages_to_restore";

const MessageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00c0f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

function getStoredSessionId() {
  try {
    return sessionStorage.getItem(GUEST_SESSION_KEY) || null;
  } catch {
    return null;
  }
}

function getStoredMessageCount() {
  try {
    const n = sessionStorage.getItem(GUEST_MESSAGE_COUNT_KEY);
    return n != null ? parseInt(n, 10) : 0;
  } catch {
    return 0;
  }
}

function setStoredSession(sessionId, messageCount) {
  try {
    if (sessionId) sessionStorage.setItem(GUEST_SESSION_KEY, sessionId);
    sessionStorage.setItem(GUEST_MESSAGE_COUNT_KEY, String(messageCount));
  } catch (_) {}
}

export default function AiAssistant() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [messages, setMessages] = useState([
    { type: "ai", text: "Hi! I'm your property assistant. What would you like to know? You can ask up to 5 questions here, then log in or register for unlimited chats." },
  ]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(getStoredSessionId);
  const [userMessageCount, setUserMessageCount] = useState(getStoredMessageCount);
  const [blockedByApi, setBlockedByApi] = useState(false);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const limitReached = userMessageCount >= 5 || blockedByApi;

  useEffect(() => {
    setSessionId(getStoredSessionId());
    setUserMessageCount(getStoredMessageCount());
  }, []);

  // Persist conversation when leaving the page (e.g. user clicks Log in in navbar) so Ask HomeTruth can restore it
  useEffect(() => {
    return () => {
      const sid = getStoredSessionId();
      const latest = messagesRef.current;
      if (sid && latest.length > 1) {
        try {
          sessionStorage.setItem(GUEST_CHAT_MESSAGES_TO_RESTORE, JSON.stringify(latest));
        } catch (_) {}
      }
    };
  }, []);

  const suggestions = [
    { text: "What is leasehold?", color: "#c084fc" },
    { text: "Should i remortgage?", color: "#c084fc" },
    { text: "How much stamp duty will I pay?", color: "#c084fc" },
  ];

  const persistConversationForRedirect = () => {
    try {
      sessionStorage.setItem(GUEST_CHAT_MESSAGES_TO_RESTORE, JSON.stringify(messages));
    } catch (_) {}
  };

  const goToLogin = () => {
    const sid = sessionId || "";
    if (sid) {
      try {
        sessionStorage.setItem("guest_session_id_redirect", sid);
      } catch (_) {}
    }
    persistConversationForRedirect();
    navigate(`/login?redirect=/ask-ai&guest_session_id=${encodeURIComponent(sid)}`);
  };

  const goToRegister = () => {
    const sid = sessionId || "";
    if (sid) {
      try {
        sessionStorage.setItem("guest_session_id_redirect", sid);
      } catch (_) {}
    }
    persistConversationForRedirect();
    navigate(`/register?redirect=/ask-ai&guest_session_id=${encodeURIComponent(sid)}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || limitReached) return;
    const q = question.trim();
    if (!q) return;

    const newMessages = [...messages, { type: "user", text: q }];
    setMessages(newMessages);
    setQuestion("");
    setLoading(true);

    try {
      const data = await askAnonymousAI(q, sessionId);
      const newCount = data.messageCount ?? userMessageCount + 1;
      const newSid = data.session_id || sessionId;
      setSessionId(newSid);
      setUserMessageCount(newCount);
      setStoredSession(newSid, newCount);
      setMessages([...newMessages, { type: "ai", text: data.reply }]);
    } catch (err) {
      const msg = (err?.response?.data?.message || err?.message || "").toLowerCase();
      const isBlocked = err?.response?.status === 429 || /blocked|too many request|rate limit/i.test(msg);
      const isLimit = err?.response?.data?.conversationEnded || (err?.response?.status === 400 && err?.response?.data?.message?.includes("log in")) || isBlocked;

      if (isBlocked) setBlockedByApi(true);
      if (isLimit && err?.response?.data?.session_id) {
        setSessionId(err.response.data.session_id);
        setUserMessageCount(5);
        setStoredSession(err.response.data.session_id, 5);
      }
      // When limit/blocked: don't add duplicate text — the yellow box already shows the login/register prompt
      if (isLimit) {
        setMessages(newMessages);
      } else {
        setMessages([
          ...newMessages,
          {
            type: "ai",
            text: err?.response?.data?.message || err?.message || "Something went wrong. Please try again.",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (text) => {
    if (loading || limitReached) return;
    setQuestion(text);
  };

  return (
    <div className="chat-system-font flex justify-center py-10 px-5 bg-[#f3f7fa] mx-auto">
      <div className="bg-white rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-[#eef2f6] w-full max-w-[720px] p-6 flex flex-col hover:border-[#00c0f9] hover:shadow-[0_20px_40px_rgba(0,192,249,0.1)] transition-all duration-300 ease-in-out group">
        <div className="flex items-center gap-2.5 mb-5">
          <MessageIcon />
          <span className="text-[17px] font-medium text-[#334155]">HomeTruth Assistant</span>
        </div>

        <div className="flex flex-col gap-3 min-h-[180px] mb-5">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={
                msg.type === "ai"
                  ? "max-w-[85%] self-start"
                  : "max-w-[80%] py-3 px-[18px] text-[14px] leading-relaxed bg-[#00c0f9] text-white rounded-tl-xl rounded-tr-xl rounded-br-[4px] rounded-bl-xl self-end font-medium"
              }
            >
              {msg.type === "ai" ? (
                <div className="chat-system-font bg-[#EDEDED] text-gray-800 p-3 rounded-xl text-[14px] leading-relaxed text-left">
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
                      p: ({ node, ...props }) => (
                        <p className="mb-2 last:mb-0 text-left break-words" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong className="font-semibold text-gray-900" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="mb-1 text-left break-words ml-4" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc mb-2 pl-4 text-left" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal mb-2 pl-4 text-left" {...props} />
                      ),
                      code: ({ inline, className, children, ...props }) => (
                        <code
                          className={
                            inline
                              ? "px-1 py-0.5 rounded bg-gray-200 text-gray-800"
                              : "block p-2 rounded bg-gray-200 text-gray-800 text-sm overflow-x-auto"
                          }
                          {...props}
                        >
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {msg.text || ""}
                  </ReactMarkdown>
                </div>
              ) : (
                <div>{msg.text}</div>
              )}
            </div>
          ))}

          {limitReached && (
            <div className="max-w-[100%] py-3 px-[18px] bg-[#fef3c7] text-[#92400e] rounded-xl self-start text-[14px]">
              <p className="mb-3">To continue chatting with HomeTruth, please log in or register for unlimited chats.</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={goToLogin}
                  className="bg-[#00c0f9] text-white border-none py-2 px-4 rounded-lg font-medium cursor-pointer hover:bg-[#00a0d1] transition"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={goToRegister}
                  className="bg-white text-[#00c0f9] border-2 border-[#00c0f9] py-2 px-4 rounded-lg font-medium cursor-pointer hover:bg-[#f0f9ff] transition"
                >
                  Register
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="max-w-[85%] self-start">
              <div className="bg-[#EDEDED] p-3 rounded-xl">
                <div className="flex gap-1 py-2">
                  <div className="w-[7px] h-[7px] bg-[#cbd5e1] rounded-full animate-bounce [animation-delay:-0.32s]" />
                  <div className="w-[7px] h-[7px] bg-[#cbd5e1] rounded-full animate-bounce [animation-delay:-0.16s]" />
                  <div className="w-[7px] h-[7px] bg-[#cbd5e1] rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>

        {!limitReached && (
          <>
            <div className="text-center mb-5 mt-2.5">
              <span className="text-[13px] text-[#94a3b8] mb-2.5 block">Try asking:</span>
              <div className="flex flex-wrap justify-center gap-2.5">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    className="border-none text-white py-2 px-[18px] rounded-full text-[13px] font-medium cursor-pointer transition-all duration-200 hover:-translate-y-px hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: hoveredIndex === i ? "#00c0f9" : s.color }}
                    onClick={() => handleSuggestionClick(s.text)}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    disabled={loading}
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2.5 items-center">
              <div className="relative flex-1">
                <input
                  className="w-full bg-white border border-[#e2e8f0] rounded-lg py-3.5 px-4 text-[14px] text-[#334155] outline-none transition-colors duration-200 focus:border-[#00c0f9] placeholder:text-[#94a3b8] disabled:opacity-50"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask any property question..."
                  disabled={loading}
                />
              </div>
              <button
                className="bg-[#00c0f9] border-none w-11 h-11 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#00a0d1] hover:scale-[1.02] disabled:bg-[#cbd5e1] disabled:cursor-not-allowed disabled:transform-none"
                type="submit"
              >
                <SendIcon />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
