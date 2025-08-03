import { useState } from "react";
import axios from "axios";

export default function YoloChatPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios.post("http://127.0.0.1:8000/yolo/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResponse(res.data);
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#f3f4f6", minHeight: "100vh", padding: "20px" }}>
      {/* ✅ Üst Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: "20px",
        }}
      >
        {/* Logo ve başlık */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="/logo/dermin_logo.png" // ✅ logo'yu /frontend/public/logo içine at
            alt="Dermin Logo"
            style={{ height: "100px" }}
          />
          <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937" }}>
            YOLO Diagnosis
          </h1>
        </div>

        {/* Dermin Chat butonu */}
        <button
          onClick={() => (window.location.href = "/dermin-chat")}
          style={{
            background: "#2563eb",
            color: "white",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Dermin Chat
        </button>
      </div>

      {/* ✅ Upload Kutusu */}
      {!response && (
        <div
          style={{
            maxWidth: "500px",
            margin: "40px auto",
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}>
            Upload Image for Analysis
          </h2>
          <input type="file" onChange={handleFileChange} style={{ margin: "10px 0" }} />
          <button
            onClick={handleUpload}
            disabled={loading}
            style={{
              background: "#2563eb",
              color: "white",
              padding: "10px 20px",
              borderRadius: "6px",
              border: "none",
              marginTop: "10px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            {loading ? "Uploading..." : "Upload & Analyze"}
          </button>
        </div>
      )}

      {/* ✅ Sonuçlar */}
      {response && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            maxWidth: "1000px",
            margin: "20px auto",
          }}
        >
          {/* 📷 YOLO resmi */}
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>Processed Image</h3>
            {response.boxed_image_url ? (
              <img
                src={`http://127.0.0.1:8000${response.boxed_image_url}`}
                alt="YOLO Result"
                style={{ borderRadius: "8px", width: "100%", objectFit: "cover" }}
              />
            ) : (
              <p style={{ color: "#6b7280" }}>No image returned</p>
            )}
          </div>

          {/* 📝 Gemini Yanıtı */}
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>Gemini Analysis</h3>
            <p>
              <strong>Diagnosis:</strong> {response.top_class} ({response.confidence})
            </p>

            {/* 📝 Formatlı Gemini Response */}
            <div style={{ marginTop: "10px" }}>
              {response.gemini_response.split("\n").map((line, idx) => {
                if (line.trim().match(/^\d+\./)) {
                  // Başlıklar
                  return (
                    <h4 key={idx} style={{ fontSize: "18px", fontWeight: "bold", marginTop: "10px" }}>
                      {line.trim()}
                    </h4>
                  );
                }
                if (line.trim().startsWith("*")) {
                  // Bullet points
                  return (
                    <li key={idx} style={{ marginLeft: "20px", listStyle: "disc" }}>
                      {line.replace("*", "").trim()}
                    </li>
                  );
                }
                return (
                  line.trim() && (
                    <p key={idx} style={{ marginTop: "6px", lineHeight: "1.5" }}>
                      {line.trim()}
                    </p>
                  )
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
