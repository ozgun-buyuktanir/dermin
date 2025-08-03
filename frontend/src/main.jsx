import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import KvkkPage from "./pages/KvkkPage";
import SurveyPage from "./pages/SurveyPage";
import DashboardPage from "./pages/DashboardPage";
import YoloChatPage from "./pages/YoloChatPage";
import DerminChatBotPage from "./pages/DerminChatBotPage";
import ProtectedRoute from "./components/ProtectedRoute";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Linear Protected */}
        <Route
          path="/kvkk"
          element={
            <ProtectedRoute step="kvkk">
              <KvkkPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/survey"
          element={
            <ProtectedRoute step="survey">
              <SurveyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute step="yolo">
            <DashboardPage />
            </ProtectedRoute>
            }
        />
        <Route
          path="/yolo"
          element={
            <ProtectedRoute step="yolo">
              <YoloChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dermin-chat"
          element={
            <ProtectedRoute step="yolo">
              <DerminChatBotPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  </React.StrictMode>
);
