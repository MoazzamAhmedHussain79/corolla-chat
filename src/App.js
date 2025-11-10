import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function App() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("corolla-chat");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("corolla-chat", JSON.stringify(messages));
  }, [messages]);

  const sendQuery = async () => {
    if (!query.trim()) return;

    const userMessage = { role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      const botMessage = { role: "assistant", content: data.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        role: "assistant",
        content: "⚠️ Failed to connect to the assistant. Is the backend running?",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setQuery("");
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 sm:py-6 font-sans">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">🧠 Corolla Assistant</h1>

      <div className="border rounded-lg p-4 bg-gray-50 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
            <div className={`inline-block p-4 rounded-lg max-w-[90%] sm:max-w-[80%] whitespace-pre-wrap ${
              msg.role === "user" ? "bg-blue-100" : "bg-green-100"
            }`}>
              <p className="text-sm sm:text-base font-medium">
                <strong>{msg.role === "user" ? "You" : "Assistant"}:</strong>{" "}
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-gray-200 px-1 rounded">{children}</code>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </p>
            </div>
          </div>
        ))}
        {loading && <p className="italic text-sm text-gray-500">Assistant is thinking…</p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendQuery()}
          placeholder="Ask something about your Corolla..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none"
        />
        <button
          onClick={sendQuery}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
