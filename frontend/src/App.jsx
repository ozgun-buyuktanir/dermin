import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import KvkkPage from "./pages/KvkkPage";
import SurveyPage from "./pages/SurveyPage";
import DashboardPage from "./pages/DashboardPage";
import YoloChatPage from "./pages/YoloChatPage";
import DerminChatBotPage from "./pages/DerminChatBotPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 🔓 Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 🔒 KVKK */}
        <Route
          path="/kvkk"
          element={
            <ProtectedRoute step="kvkk">
              <KvkkPage />
            </ProtectedRoute>
          }
        />

        {/* 🔒 Survey */}
        <Route
          path="/survey"
          element={
            <ProtectedRoute step="survey">
              <SurveyPage />
            </ProtectedRoute>
          }
        />

        {/* 🔒 Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute step="dashboard">
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* 🔒 YOLO */}
        <Route
          path="/yolo"
          element={
            <ProtectedRoute step="yolo">
              <YoloChatPage />
            </ProtectedRoute>
          }
        />

        {/* 🔒 Chatbot */}
        <Route
          path="/dermin-chat"
          element={
            <ProtectedRoute step="chatbot">
              <DerminChatBotPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
