import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PageTitle from "../components/PageTitle";
import {
  askAIChat,
  getAIChatConversations,
  getAIChatHistory,
  saveAIChatConversation,
  getSavedNotes,
  getAllSavedItems,
  saveNote,
  deleteAIChatConversation,
} from "../api/api";
import {
  FREE_TIER_LIMITS,
  PAYWALL_MODAL_TYPES,
  SAVE_ACTION_TYPES,
  getSaveGateDecision,
  getSavedItemsCountFromResponse,
  isLimitErrorMessage,
} from "../utils/saveGating";

// Reusable assistant bubble that renders Markdown safely.
// - Links open in new tab (target/rel set on <a>)
// - No raw HTML allowed (avoids XSS)
// - GFM enabled (lists, tables, autolink literals, etc.)
function AssistantBubble({ text, messageId, onSave, isSaved, isStreaming = false, streamingText = "" }) {
  const displayText = isStreaming && streamingText ? streamingText : text;

  return (
    <div className="chat-system-font bg-[#EDEDED] p-3 rounded-xl max-w-[70%] text-start whitespace-pre-wrap relative">
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
          // Make headings inline and not full-width
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
        {displayText || ""}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-gray-600 ml-1 animate-pulse" />
      )}

      {/* Save button at bottom right */}
      <div className="flex items-center justify-end mt-3 pt-2 border-t border-gray-300">
        <button
          onClick={() => onSave(messageId)}
          title={isSaved ? "Saved response" : "Save response"}
          aria-label={isSaved ? "Saved response" : "Save response"}
          className={`p-1 rounded-md transition-opacity duration-200 ${isSaved ? "cursor-default" : "hover:opacity-80"
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300`}
          disabled={isSaved}
        >
          <img
            src={isSaved ? "/assets/saved.svg" : "/assets/Notsaved.svg"}
            alt=""
            aria-hidden="true"
            className="w-[10px] h-[14px]"
          />
        </button>
      </div>
    </div>
  );
}

export default function AskAI() {
  const location = useLocation();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [paywallModal, setPaywallModal] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [savedNoteResponseKeys, setSavedNoteResponseKeys] = useState(() => new Set());
  const [isAnswering, setIsAnswering] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isChatHistoryVisible, setIsChatHistoryVisible] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [searchWeb, setSearchWeb] = useState(true);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  const toStableResponseKey = (value) => {
    if (value === null || value === undefined || value === "") return null;
    return String(value);
  };

  const normalizeForSavedKey = (value) =>
    String(value ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const buildIdKey = (value) => {
    const stable = toStableResponseKey(value);
    return stable ? `id:${stable}` : null;
  };

  const buildContentKey = (questionValue, answerValue) => {
    const question = normalizeForSavedKey(questionValue);
    const answer = normalizeForSavedKey(answerValue);
    if (!answer) return null;
    return `content:${question}||${answer}`;
  };

  const getSavedNoteKeys = (note) => {
    const keys = [];
    const idCandidate =
      note?.chat_history_id ??
      note?.chatHistoryId ??
      note?.chat_history?.id ??
      note?.chatHistory?.id ??
      note?.message_id ??
      note?.messageId ??
      note?.ai_chat_history_id ??
      note?.aiChatHistoryId ??
      note?.source_message_id ??
      note?.sourceMessageId;
    const idKey = buildIdKey(idCandidate);
    if (idKey) keys.push(idKey);

    const savedQuestion =
      note?.question ??
      note?.user_message ??
      note?.userMessage ??
      note?.title ??
      "";
    const savedAnswer =
      note?.assistant_reply ??
      note?.assistantReply ??
      note?.answer ??
      note?.content ??
      note?.assistant_message ??
      note?.assistantMessage ??
      "";
    const contentKey = buildContentKey(savedQuestion, savedAnswer);
    if (contentKey) keys.push(contentKey);

    return keys;
  };

  const getQAPairKeys = (pair) => {
    const keys = [];
    const idKey = buildIdKey(pair?.answer?.chatHistoryId ?? pair?.answer?.id);
    if (idKey) keys.push(idKey);

    // `title` persisted by saveNote is truncated to 100 chars; mirror that for stable matching.
    const saveTitle = pair?.question?.content ? pair.question.content.slice(0, 100) : "";
    const answerContent = pair?.answer?.content ?? "";
    const contentKey = buildContentKey(saveTitle, answerContent);
    if (contentKey) keys.push(contentKey);

    return keys;
  };

  const isQAPairSaved = (pair) => {
    const keys = getQAPairKeys(pair);
    return keys.some((key) => savedNoteResponseKeys.has(key));
  };

  const hydrateSavedNoteResponseKeys = async () => {
    try {
      const notes = await getSavedNotes();
      const nextKeys = new Set();
      let idKeyCount = 0;
      let contentKeyCount = 0;
      notes.forEach((note) => {
        getSavedNoteKeys(note).forEach((key) => {
          if (key.startsWith("id:")) idKeyCount += 1;
          if (key.startsWith("content:")) contentKeyCount += 1;
          nextKeys.add(key);
        });
      });
      setSavedNoteResponseKeys(nextKeys);
      if (process.env.NODE_ENV === "development") {
        const sample = notes[0] || null;
        console.debug("AskAI saved-note hydration", {
          notesCount: notes.length,
          idKeyCount,
          contentKeyCount,
          sampleFields: sample
            ? {
              id: sample.id,
              chat_history_id: sample.chat_history_id,
              chatHistoryId: sample.chatHistoryId,
              title: sample.title,
              assistant_reply: sample.assistant_reply,
            }
            : null,
        });
      }
    } catch (err) {
      console.error("Error hydrating saved note response keys:", err);
    }
  };

  const refreshSavedNotesCount = async () => {
    try {
      const savedItemsResponse = await getAllSavedItems({ page: 1, limit: 100 });
      const combinedCount = getSavedItemsCountFromResponse(savedItemsResponse);
      if (typeof combinedCount === "number") {
        return combinedCount;
      }
    } catch (err) {
      console.error("Error refreshing saved items count:", err);
    }

    try {
      const notes = await getSavedNotes();
      const notesCount = Array.isArray(notes) ? notes.length : 0;
      return notesCount;
    } catch (err) {
      console.error("Error refreshing saved notes count:", err);
      return null;
    }
  };

  const openPaywallModal = ({ modalType, count, limit }) => {
    setSaveError(null);
    setPaywallModal({ modalType, count, limit });
  };


  const toggleSearchWeb = () => {
    setSearchWeb(prev => {
      const newValue = !prev;
      console.log("Search web toggled:", prev, "→", newValue);
      return newValue;
    });
    // Refocus input field after toggle to ensure it's ready for typing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const toggleSaveQAPair = async (id) => {
    const pair = qaPairs.find((p) => p.id === id);
    if (!pair) return;
    const pairKeys = getQAPairKeys(pair);

    // Check if already saved
    if (pairKeys.some((key) => savedNoteResponseKeys.has(key))) {
      return; // Already saved, do nothing
    }

    // Resolve note entitlement/quota before any state changes
    const currentNotesCount = await refreshSavedNotesCount();
    if (typeof currentNotesCount !== "number") {
      setSaveError(
        "Couldn't verify your notes quota right now. Please try again in a moment."
      );
      setTimeout(() => setSaveError(null), 5000);
      return;
    }

    const noteGate = getSaveGateDecision({
      actionType: SAVE_ACTION_TYPES.NOTE,
      currentNotesCount,
      notesLimit: FREE_TIER_LIMITS.NOTES,
    });
    if (!noteGate.allowed) {
      openPaywallModal(noteGate);
      return;
    }

    // Use the actual chat history ID from the backend
    // Prefer chatHistoryId if stored, otherwise use the answer.id (which should be the chat_history_id)
    const actualMessageId = pair.answer.chatHistoryId || pair.answer.id;

    // Validate that we have a valid chat_history_id from the backend
    // Backend IDs should be numbers or strings, not temporary Date.now() values
    if (!actualMessageId) {
      console.error("❌ Missing chat_history_id:", pair);
      setSaveError("Cannot save note: Message ID not found. Please try again.");
      setTimeout(() => setSaveError(null), 5000);
      return;
    }

    // Check if it looks like a temporary ID (very large timestamp-like number)
    // Backend IDs are typically smaller integers or strings
    if (typeof actualMessageId === 'number' && actualMessageId > 1000000000000) {
      console.warn("⚠️ Possible temporary ID detected:", actualMessageId);
      // Still try to save - the backend will validate
    }

    // Optimistically update UI immediately for better UX
    setSavedNoteResponseKeys((prev) => {
      const next = new Set(prev);
      pairKeys.forEach((key) => next.add(key));
      return next;
    });

    try {
      setPaywallModal(null);
      await saveNote({
        chat_history_id: actualMessageId,
        title: pair.question.content.slice(0, 100),
      });

      // Refresh the actual saved notes count from the backend
      await refreshSavedNotesCount();
      // Keep local mapping aligned with backend source of truth
      hydrateSavedNoteResponseKeys();

      // Show success feedback
      setSaveSuccess("Note saved successfully!");
      setTimeout(() => setSaveSuccess(null), 2000);
    } catch (err) {
      console.error("❌ Error saving note:", err);
      console.error("❌ Error response:", err?.response?.data);
      console.error("❌ Error message:", err?.response?.data?.message);

      // Revert optimistic update on error
      setSavedNoteResponseKeys((prev) => {
        const next = new Set(prev);
        pairKeys.forEach((key) => next.delete(key));
        return next;
      });

      const backendMessage = err?.response?.data?.message || "";
      if (isLimitErrorMessage(backendMessage)) {
        const latestCount = await refreshSavedNotesCount();
        openPaywallModal({
          modalType: PAYWALL_MODAL_TYPES.NOTES,
          count:
            typeof latestCount === "number" ? latestCount : currentNotesCount,
          limit: FREE_TIER_LIMITS.NOTES,
        });
        return;
      }

      setSaveError(
        backendMessage ||
        "Failed to save note. You may have reached the limit."
      );
      setTimeout(() => setSaveError(null), 5000);
    }
  };

  const qaPairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const next = messages[i + 1];
      if (msg?.role === "user" && next?.role === "assistant") {
        pairs.push({
          id: `qa-${msg.id}-${next.id}`, // unique ID with both message IDs
          question: msg,
          answer: next,
        });
        i++;
      }
    }
    return pairs;
  }, [messages]);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const prevMsgCountRef = useRef(0);
  const streamingIntervalRef = useRef(null);
  const restoredSessionRef = useRef(null);

  // const questionLimit = 5; // Commented out - removed 5 question limit per session
  // const questionLimit = Infinity; // Not needed anymore - limit removed
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const currentQuestionCount = currentSession?.questions.length || 0;
  // const questionLimitReached = currentQuestionCount >= questionLimit; // Commented out - removed message limitation
  const questionLimitReached = false; // Always allow questions - removed message limitation

  const suggestions = [
    "What is leasehold?",
    "How much stamp duty will I pay?",
    "What's a good mortgage deposit?",
    "Explain property chain risks",
    "What are conveyancing fees?",
  ];

  useEffect(() => {
    // Refresh saved notes count on component mount
    refreshSavedNotesCount();
    // Hydrate saved icon state from persisted notes
    hydrateSavedNoteResponseKeys();

    // Check if there's a query from Dashboard
    const dashboardQuery = localStorage.getItem("dashboard_query");
    if (dashboardQuery) {
      setInput(dashboardQuery);
      localStorage.removeItem("dashboard_query"); // Clear it after using
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoadingSessions(true);
        const response = await getAIChatConversations();
        const data = response?.conversations || [];
        const mapped = data.map((conv) => ({
          id: conv.conversation_id?.toString() || Date.now().toString(),
          title: conv.preview || "New Chat",
          preview: conv.preview,
          createdAt: new Date(conv.lastMessageAt),
          questions: Array(conv.messageCount).fill(null),
          remaining: conv.remainingQuestions,
          saved: conv.is_saved,
          messages: conv.messages || [],
        }));
        // Preserve restored guest session if it was added before fetch completed
        const restored = restoredSessionRef.current;
        if (restored && !mapped.some((s) => s.id === restored.id)) {
          setSessions([restored, ...mapped]);
        } else {
          setSessions(mapped);
        }
      } catch (err) {
        console.error("Could not load sessions", err);
      } finally {
        setIsLoadingSessions(false);
      }
    };

    fetchSessions();
  }, []);

  // Restore guest conversation when arriving from login/register (or any navigation from landing with chat)
  const GUEST_CHAT_MESSAGES_TO_RESTORE = "guest_chat_messages_to_restore";

  useEffect(() => {
    const id =
      location.state?.conversationId ||
      (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("ask_ai_open_conversation_id") : null) ||
      null;
    const claimId = id && String(id).trim() !== "" ? id : null;

    let restoredMessages = [];
    try {
      const stored =
        typeof sessionStorage !== "undefined" ? sessionStorage.getItem(GUEST_CHAT_MESSAGES_TO_RESTORE) : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          restoredMessages = parsed.map((msg, i) => ({
            id: Date.now() + i,
            role: msg.type === "user" ? "user" : "assistant",
            content: msg.text || "",
            time,
          }));
          sessionStorage.removeItem(GUEST_CHAT_MESSAGES_TO_RESTORE);
          const sessionId = claimId || "guest-restored";
          const questions = restoredMessages.filter((m) => m.role === "user").map((m) => m.content);
          setMessages(restoredMessages);
          prevMsgCountRef.current = restoredMessages.length;
          const newSession = {
            id: sessionId,
            title: questions[0]
              ? questions[0].substring(0, 50) + (questions[0].length > 50 ? "..." : "")
              : "Previous chat",
            preview: questions[0] || "New Chat",
            createdAt: new Date(),
            questions,
            remaining: 0,
            saved: false,
            messages: restoredMessages,
          };
          restoredSessionRef.current = newSession;
          setSessions((prev) => [newSession, ...prev]);
          setCurrentSessionId(sessionId);
        }
      }
    } catch (_) {}

    if (claimId) {
      const hasRestoredMessages = restoredMessages.length > 0;
      loadConversationHistory(claimId, { silent: hasRestoredMessages })
        .then((apiMsgs) => {
          if (apiMsgs.length === 0 && restoredMessages.length > 0) {
            const questions = restoredMessages.filter((m) => m.role === "user").map((m) => m.content);
            setMessages(restoredMessages);
            prevMsgCountRef.current = restoredMessages.length;
            setSessions((prev) => {
              const existing = prev.find((s) => s.id === claimId);
              if (existing) {
                return prev.map((s) =>
                  s.id === claimId ? { ...s, messages: restoredMessages, questions } : s
                );
              }
              return [
                {
                  id: claimId,
                  title: questions[0]
                    ? questions[0].substring(0, 50) + (questions[0].length > 50 ? "..." : "")
                    : "Previous chat",
                  preview: questions[0] || "New Chat",
                  createdAt: new Date(),
                  questions,
                  remaining: 0,
                  saved: false,
                  messages: restoredMessages,
                },
                ...prev,
              ];
            });
          }
        })
        .finally(() => {
          try {
            sessionStorage.removeItem("ask_ai_open_conversation_id");
          } catch (_) {}
        });
    }

    window.history.replaceState({}, document.title, location.pathname);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const isNewMsg = messages.length > prevMsgCountRef.current;
    if (isNewMsg) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      prevMsgCountRef.current = messages.length;
    }
    if (!questionLimitReached) inputRef.current?.focus();
  }, [messages, questionLimitReached]);

  // Cleanup streaming interval on unmount
  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
        streamingIntervalRef.current = null;
      }
      setStreamingMessageId(null);
      setStreamingText("");
    };
  }, []);

  const loadConversationHistory = async (sessionId, options = {}) => {
    const { silent = false } = options;
    if (!silent) setIsLoadingHistory(true);
    try {
      const msgs = await getAIChatHistory(sessionId);
      const questions = msgs.filter((m) => m.role === "user").map((m) => m.content);
      setSessions((prev) => {
        const existing = prev.find((s) => s.id === sessionId);
        if (existing) {
          return prev.map((s) =>
            s.id === sessionId ? { ...s, messages: msgs, questions } : s
          );
        }
        // Claimed guest session: add to list so sidebar shows it even before fetchSessions completes
        return [
          {
            id: sessionId,
            title: questions[0] ? questions[0].substring(0, 50) + (questions[0].length > 50 ? "..." : "") : "Previous chat",
            preview: questions[0] || "New Chat",
            createdAt: new Date(),
            questions,
            remaining: 0,
            saved: false,
            messages: msgs,
          },
          ...prev,
        ];
      });
      setMessages(msgs);
      prevMsgCountRef.current = msgs.length;
      return msgs;
    } catch (err) {
      console.error(err);
      setMessages([]);
      return [];
    } finally {
      if (!silent) setIsLoadingHistory(false);
    }
  };

  // Function to simulate typing effect
  const streamText = (fullText, messageId) => {
    // Clear any existing interval
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
    }

    setStreamingMessageId(messageId);
    setStreamingText("");

    let currentIndex = 0;
    const words = fullText.split(" ");

    const streamInterval = setInterval(() => {
      if (currentIndex < words.length) {
        const currentText = words.slice(0, currentIndex + 1).join(" ");
        setStreamingText(currentText);
        // Auto-scroll as text streams
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 0);
        currentIndex++;
      } else {
        clearInterval(streamInterval);
        streamingIntervalRef.current = null;
      }
    }, 30); // Adjust speed: lower = faster, higher = slower (30ms per word)

    streamingIntervalRef.current = streamInterval;
    return streamInterval;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim() || questionLimitReached || isAnswering) return;
    setIsAnswering(true);

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const tempUserMsg = {
      id: Date.now(),
      role: "user",
      content: input,
      time,
    };

    const loadingMsg = {
      id: Date.now() + 1,
      role: "assistant",
      content: "__typing__",
      time,
    };

    setMessages((prev) => [...prev, tempUserMsg, loadingMsg]);
    setInput("");

    try {
      const result = await askAIChat(input, currentSessionId, searchWeb, false);

      const latestHistory = result.chatHistory?.[result.chatHistory.length - 1];
      // Use the chat_history_id from backend - this is the ID we need for saving
      const chatHistoryId = latestHistory?.id || null;
      const userMessageId = chatHistoryId || Date.now();
      // Assistant message uses the same chat_history_id as they're part of the same record
      const assistantMessageId = chatHistoryId || Date.now() + 1;

      const userMsg = {
        id: userMessageId,
        role: "user",
        content: latestHistory?.userMessage || input,
        time,
        chatHistoryId: chatHistoryId, // Store the backend chat_history_id
      };

      const fullResponse = latestHistory?.assistantReply || result.reply || "";

      const assistantMsg = {
        id: assistantMessageId,
        role: "assistant",
        content: fullResponse,
        time,
        chatHistoryId: chatHistoryId, // Store the backend chat_history_id for saving
      };

      if (!currentSessionId) {
        const newSessionId = result.conversation_id?.toString();
        const newSession = {
          id: newSessionId,
          title: input,
          preview: input,
          createdAt: new Date(),
          questions: [input],
          remaining: result.remainingQuestions ?? Infinity, // Unlimited questions
          saved: false,
          messages: [userMsg, assistantMsg],
        };
        setSessions((prev) => [newSession, ...prev]);
        setCurrentSessionId(newSessionId);
      } else {
        // Existing session
        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? {
                ...s,
                questions: [...s.questions, input],
                remaining: result.remainingQuestions ?? Infinity, // Unlimited questions
                preview: s.preview || input,
                messages: [...s.messages, userMsg, assistantMsg],
              }
              : s
          )
        );
      }

      // Replace loading message with actual user message and add streaming assistant message
      const streamingAssistantMsg = {
        ...assistantMsg,
        content: "", // Start with empty content, will be filled by streaming
      };

      setMessages((prev) => prev.slice(0, -1).concat([userMsg, streamingAssistantMsg]));

      // Start streaming the response
      const streamInterval = streamText(fullResponse, assistantMessageId);

      // Clean up interval and finalize message when streaming completes
      const estimatedTime = fullResponse.split(" ").length * 30 + 100;
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId && m.role === "assistant"
              ? { ...m, content: fullResponse }
              : m
          )
        );
        setStreamingMessageId(null);
        setStreamingText("");
        setIsAnswering(false);
        if (streamInterval) {
          clearInterval(streamInterval);
          streamingIntervalRef.current = null;
        }
      }, estimatedTime);

      if (!currentSessionId && result.conversation_id) {
        setCurrentSessionId(result.conversation_id.toString());
      }
    } catch (err) {
      console.error("Chat error", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? { ...m, content: "Something went wrong. Please try again." }
            : m
        )
      );
      setIsAnswering(false);
    }
  };


  const handleSaveSession = async (sessionId = null) => {
    // If sessionId is provided, use it; otherwise use currentSessionId
    const targetSessionId = sessionId !== null ? sessionId : currentSessionId;
    const savedSessionsCount = sessions.filter((s) => s.saved).length;
    const isCurrentDisplayedSession = targetSessionId === currentSessionId;

    const sessionGate = getSaveGateDecision({
      actionType: SAVE_ACTION_TYPES.SESSION,
      usedSessions: savedSessionsCount,
      sessionLimit: FREE_TIER_LIMITS.SESSION,
    });
    if (!sessionGate.allowed) {
      openPaywallModal(sessionGate);
      return;
    }


    if (!targetSessionId) {
      console.error("❌ No session ID to save");
      setSaveError("No session to save. Please start a conversation first.");
      return;
    }

    // Check if target session has any content
    const targetSession = sessions.find((s) => s.id === targetSessionId);
    const displayedConversationHasContent =
      qaPairs.length > 0 || messages.some((m) => m?.role === "user");
    const targetSessionHasContent =
      !!targetSession &&
      ((Array.isArray(targetSession.questions) &&
        targetSession.questions.length > 0) ||
        (Array.isArray(targetSession.messages) &&
          targetSession.messages.some((m) => m?.role === "user")));
    const hasContentToSave = isCurrentDisplayedSession
      ? displayedConversationHasContent
      : targetSessionHasContent;
    if (!hasContentToSave) {
      console.error("❌ No content to save in target session");
      setSaveError("No conversation to save. Please ask a question first.");
      return;
    }

    try {
      setPaywallModal(null);
      await saveAIChatConversation(targetSessionId, true);

      // Update local state
      setSessions((prev) =>
        prev.map((s) => (s.id === targetSessionId ? { ...s, saved: true } : s))
      );

      // Show success message
      setSaveSuccess("Session saved successfully!");
      setSaveError(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      console.error("❌ Error saving session:", err);
      console.error("Error details:", err.response?.data);

      const backendMessage = err?.response?.data?.message || "";
      if (isLimitErrorMessage(backendMessage)) {
        openPaywallModal({
          modalType: PAYWALL_MODAL_TYPES.SESSION,
          count: Math.max(savedSessionsCount, FREE_TIER_LIMITS.SESSION),
          limit: FREE_TIER_LIMITS.SESSION,
        });
        return;
      }

      // Show user-friendly error message
      setSaveError(backendMessage || "Failed to save session. Please try again.");
      setSaveSuccess(null);
    }
  };

  const handleSaveCurrentSession = () => {
    handleSaveSession(currentSessionId);
  };

  const handleDeleteSession = (sessionId, e) => {
    e?.stopPropagation(); // Prevent session selection when clicking delete

    // Check if session is saved
    const session = sessions.find((s) => s.id === sessionId);
    if (session?.saved) {
      setSaveError("Saved sessions cannot be deleted. Please unsave the session first.");
      setTimeout(() => setSaveError(null), 5000);
      return;
    }

    setSessionToDelete(sessionId);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;

    // Double-check if session is saved before deletion
    const session = sessions.find((s) => s.id === sessionToDelete);
    if (session?.saved) {
      setSessionToDelete(null);
      setSaveError("Saved sessions cannot be deleted. Please unsave the session first.");
      setTimeout(() => setSaveError(null), 5000);
      return;
    }

    try {
      const response = await deleteAIChatConversation(sessionToDelete);

      // Check if backend returned an error message even with 200 status
      if (response?.message && response.message.toLowerCase().includes("not deleted")) {
        setSessionToDelete(null);
        setSaveError(response.message || "Cannot delete this session. It may be saved.");
        setTimeout(() => setSaveError(null), 5000);
        return;
      }

      // Remove session from state
      setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete));

      // If the deleted session was the current one, clear it
      if (sessionToDelete === currentSessionId) {
        setMessages([]);
        setInput("");
        setCurrentSessionId(null);
        prevMsgCountRef.current = 0;
      }

      // Close confirmation modal
      setSessionToDelete(null);

      // Show success message
      setSaveSuccess("Session deleted successfully!");
      setTimeout(() => setSaveSuccess(null), 2000);
    } catch (err) {
      console.error("Error deleting session:", err);
      setSessionToDelete(null);
      const errorMessage = err?.response?.data?.message || err?.response?.data?.error || "Failed to delete session. Please try again.";
      setSaveError(errorMessage);
      setTimeout(() => setSaveError(null), 5000);
    }
  };

  const cancelDeleteSession = () => {
    setSessionToDelete(null);
  };

  const handleNewSession = () => {
    setMessages([]);
    setInput("");
    setSaveError(null);
    setSaveSuccess(null);
    setCurrentSessionId(null);
    setIsAnswering(false);
    setStreamingText("");
    setStreamingMessageId(null);
    // Clear any active streaming intervals
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    // Preserve persisted saved note state across sessions
    // Reset message count ref for scrolling
    prevMsgCountRef.current = 0;
    // Focus input field for new session
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleSessionSelect = (sessionId) => {
    setCurrentSessionId(sessionId);
    loadConversationHistory(sessionId);
  };

  const formatTimeAgo = (ts) => {
    const now = Date.now();
    const past = new Date(ts).getTime();
    const diffMs = now - past;

    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / (60000 * 60));
    const days = Math.floor(diffMs / (60000 * 60 * 24));
    const weeks = Math.floor(diffMs / (60000 * 60 * 24 * 7));
    const months = Math.floor(diffMs / (60000 * 60 * 24 * 30));
    const years = Math.floor(diffMs / (60000 * 60 * 24 * 365));

    if (years > 0) return `${years}y ago`;
    if (months > 0) return `${months}mo ago`;
    if (weeks > 0) return `${weeks}w ago`;
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "now";
  };

  const firstQuestion = currentSession?.questions?.[0];
  const sessionTitle = useMemo(() => {
    if (!currentSessionId || !currentSession) return "New Chat Session";
    // const remaining = questionLimit - currentQuestionCount; // Commented out - removed limit display
    return firstQuestion
      ? `${firstQuestion}` // Removed remaining questions count
      : "New Chat Session";
  }, [currentSessionId, currentSession, firstQuestion]);

  return (
    <div className="chat-system-font flex h-full">
      {/* Sidebar */}
      {isChatHistoryVisible && (
        <aside className="w-[356px] flex flex-col bg-white">
          <div className="flex-shrink-0 px-4 py-3 text-xs text-gray-500 flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-gray-400 text-sm">schedule</span>
                <span>Chat history will be deleted after 7 days.</span>
              </div>
              <span
                title="Pro tier launching soon."
                className="inline-block  text-gray-600  py-1 rounded-md text-xs font-medium opacity-50 cursor-not-allowed ml-6"
              >
                Upgrade to pro
              </span>
            </div>
            <button
              onClick={() => setIsChatHistoryVisible(!isChatHistoryVisible)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title={isChatHistoryVisible ? "Hide sidebar" : "Show sidebar"}
            >
              <img
                src="/assets/expand.png"
                alt={isChatHistoryVisible ? "Hide sidebar" : "Show sidebar"}
                className="w-5 h-5"
              />
            </button>
          </div>

          <div className="flex-shrink-0 px-4 pb-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">search</span>
              <input
                type="text"
                placeholder="Search Chats"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-indigo-300"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 space-y-2 scroll-smooth ">
            {isLoadingSessions ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-500 text-sm">Loading sessions...</p>
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-gray-400 text-sm">No chat sessions found</p>
            ) : (
              sessions
                .filter((s) => {
                  if (!searchTerm.trim()) return true;
                  const lower = searchTerm.toLowerCase();
                  return (
                    s.preview?.toLowerCase().includes(lower) ||
                    s.questions.some((q) => q?.toLowerCase().includes(lower))
                  );
                })
                .map((s) => (
                  <div
                    key={s.id}
                    className={`group relative rounded-lg p-4 cursor-pointer transition-colors ${s.id === currentSessionId
                      ? "bg-indigo-50"
                      : "bg-white hover:bg-indigo-100"
                      }`}
                    onClick={() => handleSessionSelect(s.id)}
                  >
                    {/* Saved indicator and Delete button */}
                    <div className="absolute top-2 right-2 flex items-center gap-2">
                      {s.saved && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <span className="text-gray-500">Saved</span>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      )}
                      {!s.saved && (
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-red-100 text-red-500 hover:text-red-700"
                          onClick={(e) => handleDeleteSession(s.id, e)}
                          title="Delete session"
                        >
                          <span className="material-symbols-outlined text-sm">
                            delete
                          </span>
                        </button>
                      )}
                    </div>
                    <div className="space-y-0.5 pr-8">
                      <div className="text-sm font-medium text-gray-900 leading-tight">
                        {s.preview || s.title || "New Chat"}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 leading-tight">
                        <span>{formatTimeAgo(s.createdAt)}</span>
                        <span className="mx-1">·</span>
                        <span>{s.questions.length}</span>
                      </div>
                      {!s.saved && s.questions.length > 0 && (
                        <button
                          className="text-xs text-customActiveText hover:underline leading-tight"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveSession(s.id);
                          }}
                        >
                          Save Session
                        </button>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>

          <div className="flex-shrink-0 px-4 py-3 text-xs text-gray-400 space-y-1">

            <p>{sessions.length} total sessions</p>

            <p
              className={
                sessions.filter((s) => s.saved).length >= 3
                  ? "text-red-600"
                  : "text-gray-400"
              }
            >
              {sessions.filter((s) => s.saved).length}/3 sessions saved
            </p>

            <p>
              {sessions.reduce((total, s) => total + s.questions.length, 0)} total
              questions asked
            </p>

            {sessions.filter((s) => s.saved).length >= 3 && (
              <p className="text-red-600 mt-1">
                save limit reached.{" "}
                <span
                  title="Pro tier launching soon."
                  className="text-gray-400 cursor-not-allowed line-through"
                >
                  upgrade to pro
                </span>{" "}
                to save unlimited sessions.
              </p>
            )}
          </div>
        </aside>
      )}


      <main className="flex-1 flex flex-col px-8 py-4 overflow-hidden">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            {!isChatHistoryVisible && (
              <button
                onClick={() => setIsChatHistoryVisible(true)}
                className=" rounded-lg p-2 transition-all flex items-center justify-center"
                title="Show sidebar"
              >
                <img
                  src="/assets/expand.png"
                  alt="Show sidebar"
                  className="w-5 h-5"
                />
              </button>
            )}
            <PageTitle>Ask HomeTruth</PageTitle>
            <div className="flex gap-2">
              <div className="bg-gray-100 text-gray-600 text-sm rounded-lg px-3 py-1">
                {sessions.length} total sessions
              </div>
              <div
                className={`text-sm rounded-lg px-3 py-1 ${sessions.filter((s) => s.saved).length >= 3
                  ? "bg-red-100 text-red-600"
                  : "bg-indigo-50 text-customActiveText"
                  }`}
              >
                {sessions.filter((s) => s.saved).length}/3 Saved
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">

            <button
              onClick={handleNewSession}
              className="bg-customActiveText hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-sm"
            >
              New session
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 flex flex-col overflow-hidden mt-4">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center flex-1">
              <div className="text-gray-500">
                Loading conversation history...
              </div>
            </div>
          ) : messages.length === 0 ? (
            <>
              {/* Empty state */}
              <div className="w-full mb-4">
                {/* Header with dynamic title */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {sessionTitle}
                    </h2>
                  </div>

                  {currentSessionId &&
                    !currentSession?.saved &&
                    currentQuestionCount > 0 && (
                      <button
                        onClick={handleSaveCurrentSession}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Save Session
                      </button>
                    )}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-3 flex flex-col gap-3 shadow-sm">
                  <div className="relative w-full">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSubmit(); // or whatever function you're using
                        }
                      }}
                      placeholder="Ask a property question..."
                      disabled={questionLimitReached}
                      className="w-full text-base bg-white h-14 pl-4 pr-12 focus:outline-none disabled:cursor-not-allowed"
                    />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSubmit();
                      }}
                      disabled={questionLimitReached}
                      className={`absolute top-1/2 right-3 -translate-y-1/2 h-8 w-8 rounded-full text-white flex items-center justify-center ${questionLimitReached
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-customActiveText"
                        }`}
                    >
                      →
                    </button>
                  </div>

                  <div className="border-t border-gray-200" />

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSearchWeb();
                      }}
                      className={`relative flex items-center justify-between text-sm px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer select-none border-2 min-w-[140px] ${searchWeb
                        ? "bg-customActiveText border-customActiveText text-white hover:bg-customActiveText hover:border-customActiveText shadow-md"
                        : "bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className={`size-4 transition-colors ${searchWeb ? "text-white" : "text-gray-600"}`}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                          />
                        </svg>
                        <span className="font-medium">Search the web</span>
                      </div>
                      <div className={`flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full text-xs font-bold transition-all ${searchWeb
                        ? "bg-white/30 text-white"
                        : "bg-gray-200 text-gray-600"
                        }`}>
                        {searchWeb ? "ON" : "OFF"}
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-indigo-600 flex-shrink-0"
                  >
                    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
                  </svg>
                  <p className="text-sm font-medium text-indigo-900">
                    You've got 3 months of unlimited questions, explore freely while it's active!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 shrink-0">
                {suggestions.map((text, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(text)}
                    className="bg-gray-100 text-gray-800 text-sm px-4 py-2 rounded-full hover:bg-gray-200 transition"
                  >
                    {text}
                  </button>
                ))}
              </div>

              {/* <div className="bg-indigo-50 border border-blue-200 text-primary text-sm p-4 rounded-lg shrink-0">
                <div className="flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className="w-5 h-5"
                  >
                    <path
                      fill="#19B0F0F0"
                      d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-112c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
                    />
                  </svg>{" "}
                  <p className="font-medium text-[#6C757D]">Welcome to Ask HomeTruth!</p>
                </div>

                <p className="text-[#6C757D] ml-8 text-xs mt-2">
                  You can create unlimited sessions with unlimited questions. Save
                  up to 3 important sessions to prevent them from being deleted
                  after 7 days.
                </p>
                <p className="ml-8 text-customActiveText mt-2 text-xs">
                  Try asking one of the suggested questions above, or type your
                  own property-related question.
                </p>
              </div> */}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 shrink-0 ">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    <span className="text-black">
                      {currentSession?.questions?.[0] || "New Chat Session"}
                    </span>
                    {/* Removed remaining questions count display */}
                  </h2>
                </div>

                {currentSessionId &&
                  !currentSession?.saved &&
                  currentQuestionCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveCurrentSession();
                      }}
                      className="text-xs text-customActiveText hover:underline leading-tight"
                    >
                      Save Session
                    </button>
                  )}
              </div>

              <div className="bg-white rounded-3xl p-4 mb-4 overflow-y-auto max-h-[580px]">
                {qaPairs.map((pair) => (
                  <div key={pair.id} className="mb-6 relative">
                    <div className="flex justify-end">
                      <div className="bg-customActiveText p-3 rounded-xl max-w-[70%] whitespace-pre-wrap text-white">
                        {pair.question.content}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="text-xs text-gray-400 mt-1">
                        {pair.question.time}
                      </div>
                    </div>

                    <div className="flex justify-start mt-2 items-start space-x-2">
                      {pair.answer.content === "__typing__" ? (
                        <div className="bg-[#EDEDED] p-3 rounded-xl max-w-[70%] whitespace-pre-wrap">
                          <span className="text-gray-600 italic">Thinking...</span>
                        </div>
                      ) : (
                        <AssistantBubble
                          text={pair.answer.content}
                          messageId={pair.answer.id}
                          onSave={() => toggleSaveQAPair(pair.id)}
                          isSaved={isQAPairSaved(pair)}
                          isStreaming={streamingMessageId === pair.answer.id}
                          streamingText={streamingMessageId === pair.answer.id ? streamingText : ""}
                        />
                      )}

                    </div>

                    <div className="text-xs text-gray-400 mt-1 ml-1">
                      {pair.question.time}
                    </div>
                  </div>
                ))}

                <div ref={scrollRef} />
              </div>

              <div className="shrink-0">
                <div className="rounded-3xl border border-gray-200 bg-white p-3 flex flex-col gap-3 shadow-sm">
                  <div className="relative w-full">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSubmit();
                      }}
                      placeholder="Ask a property question..."
                      disabled={questionLimitReached || isAnswering}
                      className="w-full text-base bg-white h-14 pl-4 pr-12 focus:outline-none disabled:cursor-not-allowed rounded-full border border-gray-300"
                    />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSubmit();
                      }}
                      disabled={questionLimitReached || isAnswering}
                      className={`absolute top-1/2 right-4 -translate-y-1/2 h-8 w-8 rounded-full text-white flex items-center justify-center transition
                        ${questionLimitReached || isAnswering
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-customActiveText"
                        }`}
                    >
                      →
                    </button>
                  </div>

                  <div className="border-t border-gray-200" />

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSearchWeb();
                      }}
                      className={`relative flex items-center justify-between text-sm px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer select-none border-2 min-w-[140px] ${searchWeb
                        ? "bg-purple-600 border-purple-600 text-white hover:bg-purple-700 hover:border-purple-700 shadow-md"
                        : "bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className={`size-4 transition-colors ${searchWeb ? "text-white" : "text-gray-600"}`}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                          />
                        </svg>
                        <span className="font-medium">Search the web</span>
                      </div>
                      <div className={`flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full text-xs font-bold transition-all ${searchWeb
                        ? "bg-white/30 text-white"
                        : "bg-gray-200 text-gray-600"
                        }`}>
                        {searchWeb ? "ON" : "OFF"}
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4 mt-4 shrink-0">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-indigo-600 flex-shrink-0"
                  >
                    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
                  </svg>
                  <p className="text-sm font-medium text-indigo-900">
                    You've got 3 months of unlimited questions, explore freely while it's active!
                  </p>
                </div>
              </div>

              {/* Removed remaining questions warning - limit removed */}
            </>
          )}

          {currentQuestionCount >= 1 &&
            !currentSession?.saved &&
            sessions.filter((s) => s.saved).length < 3 && (
              <div className="border border-primary/20 bg-indigo-50 rounded-lg p-1 flex items-center justify-between mt-4 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="rounded-full p-2">
                    <span className="text-primary text-base">💾</span>
                  </div>
                  <div className="text-sm text-customActiveText">
                    <strong>Save this session?</strong>
                    <span className="ml-1">You have</span>
                    <strong className="mx-1">
                      {3 - sessions.filter((s) => s.saved).length}
                    </strong>
                    <span>slots remaining.</span>
                  </div>
                </div>
                <button
                  onClick={handleSaveCurrentSession}
                  className="bg-customActiveText text-white px-4 py-2 rounded-full text-sm"
                >
                  Save
                </button>
              </div>
            )}

          {/* Removed question limit reached warning - limit removed */}
        </div>
      </main>

      {saveSuccess && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative text-center">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
              onClick={() => setSaveSuccess(null)}
              aria-label="Close"
            >
              ✕
            </button>

            {/* Success Icon */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                >
                  <path
                    d="M6.75 9L8.25 10.5L11.25 7.5M15.75 9C15.75 12.7279 12.7279 15.75 9 15.75C5.27208 15.75 2.25 12.7279 2.25 9C2.25 5.27208 5.27208 2.25 9 2.25C12.7279 2.25 15.75 5.27208 15.75 9Z"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {saveSuccess.toLowerCase().includes("deleted")
                ? "Session Deleted!"
                : saveSuccess.toLowerCase().includes("note")
                  ? "Note Saved!"
                  : "Session Saved!"}
            </h2>

            {/* Message */}
            <p className="text-sm text-gray-600 mb-6">{saveSuccess}</p>
          </div>
        </div>
      )}

      {paywallModal && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative text-center">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
              onClick={() => setPaywallModal(null)}
              aria-label="Close"
            >
              x
            </button>

            {/* Icon */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-customActive p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="24"
                  viewBox="0 0 18 24"
                  fill="none"
                >
                  <path
                    d="M6 3.83333H4C2.89543 3.83333 2 4.878 2 6.16667V20.1667C2 21.4554 2.89543 22.5 4 22.5H14C15.1046 22.5 16 21.4554 16 20.1667V6.16667C16 4.878 15.1046 3.83333 14 3.83333H12M6 3.83333C6 5.122 6.89543 6.16667 8 6.16667H10C11.1046 6.16667 12 5.122 12 3.83333M6 3.83333C6 2.54467 6.89543 1.5 8 1.5H10C11.1046 1.5 12 2.54467 12 3.83333M6 14.3333H12M6 19H10"
                    stroke="#19B0F0F0"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {paywallModal.modalType === PAYWALL_MODAL_TYPES.SESSION
                ? "Session Save Limit Reached"
                : "Note Limit Reached"}
            </h2>

            {/* Message */}
            <p className="text-sm text-gray-600 mb-6">
              {paywallModal.modalType === PAYWALL_MODAL_TYPES.SESSION
                ? "You used up all your sessions. To save more, unlock the full experience. Upgrade to Pro and enjoy all the powerful features we offer."
                : `You currently have ${paywallModal.count} notes. To add more and unlock the full experience, upgrade to Pro and enjoy all the powerful features we offer.`}
            </p>

            {/* CTA Button */}
            <button
              disabled
              title="Pro tier launching soon."
              className="w-full bg-gray-400 text-white text-sm font-medium py-3 rounded-xl flex justify-center items-center gap-2 opacity-50 cursor-not-allowed"
            >
              Upgrade to Pro
              <span className="text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="16"
                  viewBox="0 0 18 16"
                  fill="none"
                >
                  <path
                    d="M9.65625 3.3125C10.0125 3.09375 10.25 2.69687 10.25 2.25C10.25 1.55937 9.69063 1 9 1C8.30937 1 7.75 1.55937 7.75 2.25C7.75 2.7 7.9875 3.09375 8.34375 3.3125L6.55312 6.89375C6.26875 7.4625 5.53125 7.625 5.03438 7.22813L2.25 5C2.40625 4.79063 2.5 4.53125 2.5 4.25C2.5 3.55938 1.94062 3 1.25 3C0.559375 3 0 3.55938 0 4.25C0 4.94062 0.559375 5.5 1.25 5.5H1.27188L2.7 13.3562C2.87188 14.3062 3.7 15 4.66875 15H13.3313C14.2969 15 15.125 14.3094 15.3 13.3562L16.7281 5.5H16.75C17.4406 5.5 18 4.94062 18 4.25C18 3.55938 17.4406 3 16.75 3C16.0594 3 15.5 3.55938 15.5 4.25C15.5 4.53125 15.5938 4.79063 15.75 5L12.9656 7.22813C12.4688 7.625 11.7312 7.4625 11.4469 6.89375L9.65625 3.3125Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
      )}

      {saveError && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative text-center">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
              onClick={() => setSaveError(null)}
              aria-label="Close"
            >
              x
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Save
            </h2>
            <p className="text-sm text-gray-600 mb-6">{saveError}</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
              onClick={cancelDeleteSession}
              aria-label="Close"
            >
              ✕
            </button>

            {/* Warning Icon */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="#EF4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-900 mb-2 text-center">
              Delete Session?
            </h2>

            {/* Message */}
            <p className="text-sm text-gray-600 mb-6 text-center">
              Are you sure you want to delete this session? This action cannot be undone.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={cancelDeleteSession}
                className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSession}
                className="flex-1 bg-red-600 text-white text-sm font-medium py-3 rounded-xl hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

