import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/register", {
        username,
        email,
        password,
      });

      // ✅ Backend’den dönen token’i kaydet
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("isLoggedIn", "true");

      // ✅ Yeni kullanıcı için KVKK ve Survey state sıfırlansın
      localStorage.removeItem("kvkkAccepted");
      localStorage.removeItem("surveyCompleted");

      setSuccess("Registration successful! Redirecting...");

      // ✅ Yeni kullanıcı direkt KVKK’ya gitsin
      setTimeout(() => {
        navigate("/kvkk");
      }, 1500);
    } catch (err) {
      setError("This email is already registered.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      {/* ✅ CARD */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          padding: "32px",
          width: "100%",
          maxWidth: "380px",
          textAlign: "center",
        }}
      >
        {/* ✅ LOGO */}
        <img
          src="/logo/dermin_logo.png"
          alt="Dermin Logo"
          style={{
            height: "250px", // 🔽 Logo boyutu %40’a indirildi
            marginBottom: "8px",
            opacity: "0.9",
          }}
        />

        {/* ✅ FORM WRAPPER */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* ✅ USERNAME INPUT */}
          <input
            type="text"
            placeholder="Username"
            style={{
              width: "90%",
              padding: "10px",
              marginBottom: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "16px",
            }}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* ✅ EMAIL INPUT */}
          <input
            type="email"
            placeholder="Email"
            style={{
              width: "90%",
              padding: "10px",
              marginBottom: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "16px",
            }}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* ✅ PASSWORD INPUT */}
          <input
            type="password"
            placeholder="Password"
            style={{
              width: "90%",
              padding: "10px",
              marginBottom: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "16px",
            }}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* ✅ ERROR & SUCCESS MESSAGE */}
          {error && (
            <p style={{ color: "red", marginBottom: "12px", fontSize: "14px" }}>
              {error}
            </p>
          )}
          {success && (
            <p style={{ color: "green", marginBottom: "12px", fontSize: "14px" }}>
              {success}
            </p>
          )}

          {/* ✅ REGISTER BUTTON */}
          <button
            onClick={handleRegister}
            style={{
              width: "90%",
              background: "#16a34a", // ✅ yeşil
              color: "white",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              marginBottom: "12px",
            }}
          >
            Register
          </button>
        </div>

        {/* ✅ LOGIN LINK */}
        <p style={{ fontSize: "14px", color: "#4b5563" }}>
          Already have an account?{" "}
          <Link to="/" style={{ color: "#2563eb", fontWeight: "600" }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
