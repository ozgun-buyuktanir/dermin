import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload(); // sayfayı temizle
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <h1 className="text-white text-xl font-bold tracking-wide">Dermin AI</h1>

          <div className="flex gap-6">
            {!isLoggedIn ? (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `transition ${
                      isActive
                        ? "text-yellow-300 font-semibold"
                        : "text-white hover:text-yellow-200"
                    }`
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `transition ${
                      isActive
                        ? "text-yellow-300 font-semibold"
                        : "text-white hover:text-yellow-200"
                    }`
                  }
                >
                  Register
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `transition ${
                      isActive
                        ? "text-yellow-300 font-semibold"
                        : "text-white hover:text-yellow-200"
                    }`
                  }
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/yolo"
                  className={({ isActive }) =>
                    `transition ${
                      isActive
                        ? "text-yellow-300 font-semibold"
                        : "text-white hover:text-yellow-200"
                    }`
                  }
                >
                  DERMIN DIAG
                </NavLink>

                {/* ✅ Yeni eklenen Dermin ChatBot Linki */}
                <NavLink
                  to="/dermin-chat"
                  className={({ isActive }) =>
                    `transition ${
                      isActive
                        ? "bg-yellow-300 text-blue-900 px-3 py-1 rounded font-bold"
                        : "text-white hover:text-yellow-200"
                    }`
                  }
                >
                  Dermin Chat
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="text-white hover:text-red-400 transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
