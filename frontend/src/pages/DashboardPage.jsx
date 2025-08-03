// src/pages/DashboardPage.jsx
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Welcome to Dermin</h1>
      <p className="mb-6 text-gray-700">Choose what you want to do:</p>

      <div className="flex gap-6">
        <button
          onClick={() => navigate("/yolo")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition text-lg"
        >
          DERMIN DIAG 
        </button>
        <button
          onClick={() => navigate("/dermin-chat")}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition text-lg"
        >
          DERMIN CHAT 
        </button>
      </div>
    </div>
  );
}
