import { useState } from "react";
import { askAIChat } from "../api/api"; // Adjust path as needed

export default function AiAssistant({ suggestions = [] }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const question = input;
    setInput("");

    const tempId = Date.now();
    const newMessage = {
      id: tempId,
      question,
      answer: "Loading...",
      saved: false
    };

    setMessages((prev) => [...prev, newMessage]);

    try {
      const answer = await askAIChat(question);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, answer } : msg
        )
      );
    } catch (error) {
      console.error("AI chat error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { ...msg, answer: "Something went wrong. Please try again." }
            : msg
        )
      );
    }
  };

  const toggleSave = (id) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, saved: !msg.saved } : msg
      )
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-4">
          <div className="flex gap-2 flex-wrap">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s)}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Q&A Message Box */}
      <div className="space-y-4 overflow-y-auto flex-1 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="bg-white shadow rounded-2xl p-6 border border-gray-200 relative"
          >
            {/* Save button */}
            <button
              onClick={() => toggleSave(msg.id)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              aria-label={msg.saved ? "Unsave message" : "Save message"}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontFamily: "Material Symbols Outlined",
                  fontVariationSettings: `'FILL' ${msg.saved ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
                  fontSize: "24px",
                  color: msg.saved ? "#2563eb" : "inherit"
                }}
              >
                bookmark
              </span>
            </button>

            {/* Combined Q&A */}
            <p className="text-sm text-gray-600 mb-2">
              <strong className="text-gray-800">Q:</strong> {msg.question}
            </p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              <strong className="text-gray-800">A:</strong> {msg.answer}
            </p>
          </div>
        ))}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="pt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-myblue"
          placeholder="Ask a question..."
        />
        <button
          type="submit"
          className="bg-myblue hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
}
