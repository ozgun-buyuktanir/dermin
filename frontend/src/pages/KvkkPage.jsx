import { useState } from "react";

export default function KvkkPage() {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    localStorage.setItem("kvkkAccepted", "true");
    window.location.href = "/survey";
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f3f4f6",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "800px",
        width: "100%",
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        padding: "24px",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Başlık */}
        <h1 style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "16px",
          textAlign: "center",
          color: "#1f2937"
        }}>
          KVKK Aydınlatma Metni
        </h1>

        {/* PDF ya da metin içerik */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "20px",
          background: "#fafafa",
          maxHeight: "500px"
        }}>
          {/* Eğer PDF embed desteğin varsa <iframe> kullanılabilir */}
          <iframe
            src="/pdf/kvkk_metni.pdf"
            title="KVKK Metni"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
          {/* Alternatif: uzun aydınlatma metni paragraflarla */}
          {/* <p>6698 sayılı Kanun kapsamında ...</p> */}
        </div>

        {/* ✅ Buton */}
        <button
          onClick={handleAccept}
          disabled={accepted}
          style={{
            background: accepted ? "#a0aec0" : "#2563eb",
            color: "white",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            cursor: accepted ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "16px"
          }}
        >
          {accepted ? "Kabul Edildi ✓" : "KVKK’yı Kabul Et & Devam Et"}
        </button>
      </div>
    </div>
  );
}
