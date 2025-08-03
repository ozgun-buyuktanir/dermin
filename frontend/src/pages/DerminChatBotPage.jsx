import { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

export default function DerminChatBotPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Chat geçmişi yükleme
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/chatbot/get_history", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("History load error:", err);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMsg = { sender: "user", message: newMessage };
    setMessages((prev) => [...prev, userMsg]);
    setNewMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/chatbot/chat",
        { message: userMsg.message },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const botMsg = { sender: "assistant", message: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#f3f4f6", minHeight: "100vh", padding: "20px" }}>
      {/* ✅ Üst Bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "white",
        padding: "10px 20px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: "20px"
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="/logo/dermin_logo.png" // ✅ logo'yu /frontend/public/logo içine at
            alt="Dermin Logo"
            style={{ height: "100px" }}
          />
          <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937" }}>
            Dermin Chat
          </h1>
        </div>

        {/* DERMIN DIAG butonu */}
        <button
          onClick={() => (window.location.href = "/yolo")}
          style={{
            background: "#2563eb",
            color: "white",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer"
          }}
        >
          DERMIN DIAG
        </button>
      </div>

      {/* ✅ Chat Kutusu */}
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        background: "white",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }}>
        <div style={{
          height: "600px",
          overflowY: "auto",
          padding: "10px",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          background: "#f9fafb",
          marginBottom: "12px"
        }}>
          {messages.length === 0 && (
            <p style={{ color: "#6b7280", textAlign: "center" }}>No messages yet.</p>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                background: msg.role === "user" ? "#dbeafe" : "#e2e8f0",
                textAlign: msg.role === "user" ? "right" : "left",
                padding: "8px 12px",
                borderRadius: "12px",
                margin: "6px 0",
                maxWidth: "75%",
                marginLeft: msg.role === "user" ? "auto" : "0"
              }}
            >
              <div style={{ fontSize: "12px", color: "#4b5563", marginBottom: "4px" }}>
                {msg.role === "user" ? "You" : "DerminBot"}
              </div>
              <ReactMarkdown>{msg.message}</ReactMarkdown>
            </div>
          ))}
        </div>

        {/* ✅ Mesaj Gönderme */}
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            style={{
              flex: 1,
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              padding: "8px"
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            style={{
              background: "#2563eb",
              color: "white",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer"
            }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
