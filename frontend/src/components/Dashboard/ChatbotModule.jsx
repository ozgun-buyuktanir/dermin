import { useState } from "react";

export default function ChatbotModule() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;

    // Kullanıcı mesajını ekle
    setMessages((prev) => [...prev, { sender: "user", text: input }]);

    const res = await fetch("http://localhost:8000/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input })
    });

    const data = await res.json();

    // Gemini yanıtını ekle
    setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    setInput("");
  }

  return (
    <div className="border rounded p-4 shadow">
      <h2 className="text-xl font-bold mb-3">💬 Chatbot</h2>

      <div className="h-64 overflow-y-auto border p-2 mb-3 bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
            <span className={`${msg.sender === "user" ? "bg-blue-200" : "bg-green-200"} px-2 py-1 rounded`}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Mesaj yaz..."
          className="border flex-grow px-2"
        />
        <button onClick={sendMessage} className="bg-green-500 text-white px-4 py-2 rounded">
          Gönder
        </button>
      </div>
    </div>
  );
}
