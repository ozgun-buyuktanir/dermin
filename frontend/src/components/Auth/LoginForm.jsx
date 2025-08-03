import { useState } from "react";
import { loginUser } from "../../api";

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const data = await loginUser(email, password);
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      onLogin();
    } else {
      alert(data.detail || "Login failed");
    }
  }

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h2 className="text-xl font-bold mb-2">Login</h2>
      <input className="border p-2 w-full mb-2" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input className="border p-2 w-full mb-2" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin} className="bg-blue-500 text-white p-2 w-full">Login</button>
    </div>
  );
}
