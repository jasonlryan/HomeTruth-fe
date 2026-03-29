import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PageTitle from "../components/PageTitle";
import {
  getAllSavedItems,
  getBudgetConversationStatus,
  getSavedNotes,
  updateBudgetCalculationName,
  updateSavedNoteTitle,
} from "../api/api";

const isBudgetItem = (item) =>
  item?.type === "budget_calculation" || item?.type === "budget";

const markdownComponents = {
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
    <p
      className="inline text-xl font-semibold mb-2 mt-1 leading-snug text-left break-words"
      {...props}
    >
      {props.children}
    </p>
  ),
  h2: ({ node, ...props }) => (
    <p
      className="inline text-lg font-semibold mb-2 mt-1 leading-snug text-left break-words"
      {...props}
    >
      {props.children}
    </p>
  ),
  h3: ({ node, ...props }) => (
    <h3
      className="inline text-base font-semibold mb-2 mt-1 leading-snug text-left break-words"
      {...props}
    >
      {props.children}
    </h3>
  ),
  p: ({ node, ...props }) => (
    <p className="mb-2 last:mb-0 text-left break-words" {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="mb-1 text-left break-words" {...props} />
  ),
  code: ({ inline, className, children, ...props }) => (
    <code
      className={`${inline ? "px-1 py-0.5 rounded bg-gray-200" : ""} break-words`}
      {...props}
    >
      {children}
    </code>
  ),
};

const getNormalizedSavedItems = (response) => {
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.savedItems)) return response.savedItems;
  if (Array.isArray(response)) return response;
  return [];
};

const getItemDate = (item) => {
  const dateField = item?.created_at || item?.createdAt || item?.created || item?.date;
  if (!dateField) return "No date";

  try {
    return new Date(dateField).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "Invalid date";
  }
};

const getItemTitle = (item) => item?.title || item?.name || "Untitled";

const getItemTextContent = (item) => {
  if (typeof item?.assistant_reply === "string") return item.assistant_reply;
  if (typeof item?.content?.assistant_reply === "string") return item.content.assistant_reply;
  if (typeof item?.content === "string") return item.content;
  if (typeof item?.description === "string") return item.description;
  return "";
};

const getBudgetPreview = (item) => {
  if (typeof item?.description === "string" && item.description.trim()) {
    return item.description;
  }

  if (item?.content && typeof item.content === "object") {
    const range = item.content.estimated_monthly_payment_range;
    const location = item.content.location;
    if (range) {
      return `Estimated monthly payment range: ${range}`;
    }
    if (location) {
      return `Budget calculation for ${location}`;
    }
  }

  return "Saved budget conversation";
};

const normalizeBudgetHistory = (history) => {
  if (!Array.isArray(history)) return [];

  return history.flatMap((entry) => {
    if (entry?.role && entry?.content) {
      return [
        {
          role: entry.role,
          content: entry.content,
          createdAt: entry.createdAt || entry.created_at,
        },
      ];
    }

    const createdAt = entry?.createdAt || entry?.created_at;
    const rows = [];

    const userMessage = entry?.userMessage || entry?.user_message;
    if (userMessage) {
      rows.push({ role: "user", content: userMessage, createdAt });
    }

    const assistantReply = entry?.assistantReply || entry?.assistant_reply;
    if (assistantReply) {
      rows.push({ role: "assistant", content: assistantReply, createdAt });
    }

    return rows;
  });
};

export default function SavedNotes() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [budgetConversation, setBudgetConversation] = useState([]);

  const [editNoteId, setEditNoteId] = useState(null);
  const [editNoteType, setEditNoteType] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);

        const allSaved = await getAllSavedItems({ page: 1, limit: 100 });
        const items = getNormalizedSavedItems(allSaved);

        if (items.length > 0) {
          setNotes(items);
          return;
        }

        const fallbackNotes = await getSavedNotes();
        setNotes(Array.isArray(fallbackNotes) ? fallbackNotes : []);
      } catch (err) {
        console.error("Failed to fetch saved items:", err);
        try {
          const fallbackNotes = await getSavedNotes();
          setNotes(Array.isArray(fallbackNotes) ? fallbackNotes : []);
        } catch (fallbackErr) {
          console.error("Failed to fetch saved notes fallback:", fallbackErr);
          setNotes([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleView = async (note) => {
    setSelectedNote(note);
    setShowModal(true);

    if (!isBudgetItem(note)) {
      setBudgetConversation([]);
      return;
    }

    try {
      setLoadingConversation(true);
      const response = await getBudgetConversationStatus(note.id);
      setBudgetConversation(normalizeBudgetHistory(response?.chatHistory));
    } catch (err) {
      console.error("Failed to load budget conversation:", err);
      setBudgetConversation([]);
    } finally {
      setLoadingConversation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <PageTitle as="h2">Saved Notes</PageTitle>
          <p className="text-sm text-gray-500">Keep your AI insights in one place</p>
        </div>
        <button
          onClick={() => navigate("/ask-ai")}
          disabled={notes.length >= 5}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-md 
            ${notes.length >= 5
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-customActiveText text-white hover:bg-sky-500"
            }`}
        >
          <span className="material-symbols-outlined text-sm">stars_2</span>
          Ask HomeTruth to save notes
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your saved notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center mt-48">
          <div className="w-64 h-64 bg-blue-100 rounded-full flex items-center justify-center mb-6 flex-shrink-0">
            <img src="/assets/notes.svg" alt="" className="w-36 h-36 object-contain" aria-hidden />
          </div>
          <p className="text-4xl font-semibold text-gray-800">
            You have no saved notes
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={`${note.type || "note"}-${note.id}`}
              className="relative bg-white shadow-md p-4 rounded-lg hover:shadow-lg transition flex flex-col"
            >
              <button
                onClick={() => {
                  if (isBudgetItem(note)) {
                    navigate(`/budget/view/${note.id}`);
                  } else {
                    setEditNoteId(note.id);
                    setEditNoteType(note.type || "note");
                    setNewTitle(getItemTitle(note));
                    setShowEditModal(true);
                  }
                }}
                className="absolute top-3 right-3 text-blue-500 hover:text-blue-700"
                title={isBudgetItem(note) ? "Edit in budget chat" : "Edit title"}
              >
                <span className="material-symbols-outlined text-xl">edit</span>
              </button>

              <h3 className="text-md font-semibold mb-2">{getItemTitle(note)}</h3>
              <div className="text-sm text-gray-700 line-clamp-3">
                {isBudgetItem(note) ? (
                  <p className="mb-0 text-left break-words">{getBudgetPreview(note)}</p>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {getItemTextContent(note) || ""}
                  </ReactMarkdown>
                )}
              </div>

              <div className="flex justify-between items-center mt-auto">
                <p className="text-xs text-gray-400">{getItemDate(note)}</p>
                <button
                  onClick={() => handleView(note)}
                  className="text-blue-500 text-sm hover:underline"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl max-h-[80vh] relative flex flex-col">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => setShowModal(false)}
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <button
              onClick={() => {
                setEditNoteId(selectedNote.id);
                setEditNoteType(selectedNote.type || "note");
                setNewTitle(getItemTitle(selectedNote));
                setShowModal(false);
                setShowEditModal(true);
              }}
              className="absolute top-3 right-10 text-blue-500 hover:text-blue-700"
              title="Edit"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>

            <h2 className="text-lg font-bold mb-2 flex-shrink-0">{getItemTitle(selectedNote)}</h2>
            <div className="text-gray-700 mb-4 flex-1 overflow-y-auto">
              {isBudgetItem(selectedNote) ? (
                loadingConversation ? (
                  <div className="h-40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                      <p className="text-sm text-gray-600">Loading conversation...</p>
                    </div>
                  </div>
                ) : budgetConversation.length === 0 ? (
                  <p className="text-sm text-gray-600">No conversation history available.</p>
                ) : (
                  <div className="space-y-3">
                    {budgetConversation.map((message, index) => {
                      const isUser = message.role === "user";
                      const timeLabel = message.createdAt
                        ? new Date(message.createdAt).toLocaleString()
                        : "";

                      return (
                        <div
                          key={`budget-message-${index}`}
                          className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-xl px-4 py-2 text-sm whitespace-pre-wrap ${isUser
                                ? "bg-customActiveText text-white"
                                : "bg-gray-200 text-gray-800"
                              }`}
                          >
                            {message.content}
                            {timeLabel && (
                              <p
                                className={`mt-2 text-[10px] ${isUser ? "text-blue-100" : "text-gray-500"
                                  }`}
                              >
                                {timeLabel}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {getItemTextContent(selectedNote) || ""}
                </ReactMarkdown>
              )}
            </div>
            <p className="text-sm text-gray-400 flex-shrink-0">{getItemDate(selectedNote)}</p>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => setShowEditModal(false)}
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h2 className="text-lg font-bold mb-2">Edit Your Saved Notes Title</h2>
            <p className="text-sm text-gray-600 mb-4">
              Update the title for this saved conversation.
            </p>

            <input
              type="text"
              placeholder="Enter Name"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 mb-4"
            />

            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              onClick={async () => {
                try {
                  if (isBudgetItem({ type: editNoteType })) {
                    await updateBudgetCalculationName(editNoteId, newTitle);
                  } else {
                    await updateSavedNoteTitle(editNoteId, newTitle);
                  }

                  setNotes((prev) =>
                    prev.map((note) =>
                      note.id === editNoteId
                        ? { ...note, title: newTitle, name: newTitle }
                        : note
                    )
                  );

                  setShowEditModal(false);
                } catch (err) {
                  console.error("Failed to update note title:", err);
                }
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
