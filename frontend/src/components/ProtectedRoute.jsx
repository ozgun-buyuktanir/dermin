import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, step }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const kvkkAccepted = localStorage.getItem("kvkkAccepted");
  const surveyCompleted = localStorage.getItem("surveyCompleted");

  // 🔹 1️⃣ Eğer login değilse → Login sayfasına at
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // 🔹 2️⃣ KVKK onaylanmamışsa → KVKK sayfasına yönlendir
  // step "kvkk", "survey", "yolo", "chatbot" ne olursa olsun KVKK zorunlu
  if (!kvkkAccepted && step !== "kvkk") {
    return <Navigate to="/kvkk" replace />;
  }

  // 🔹 3️⃣ Survey tamamlanmamışsa → Survey sayfasına yönlendir
  // Ama KVKK onaylı olmalı ki Survey'e geçebilsin
  if (!surveyCompleted && step !== "kvkk" && step !== "survey") {
    return <Navigate to="/survey" replace />;
  }

  // 🔹 4️⃣ KVKK sayfasına girilmiş ama KVKK zaten onaylanmış → Survey’e gönder
  if (step === "kvkk" && kvkkAccepted) {
    return <Navigate to="/survey" replace />;
  }

  // 🔹 5️⃣ Survey sayfasına girilmiş ama Survey zaten tamamlanmış → Dashboard’a gönder
  if (step === "survey" && surveyCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Tüm koşullar uygunsa erişim izni ver
  return children;
}
