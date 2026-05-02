import { useState } from "react";
import { useNavigate } from "react-router";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const allowedEmails = ["mansiparande2006@gmail.com", "ixaaniketwalanj@gmail.com"];
    
    if (allowedEmails.includes(email) && password === "am@1234") {
      localStorage.setItem("admin_auth", "true");
      alert("Admin Login Successful!");
      navigate("/admin");
    } else {
      alert("Invalid admin credentials");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 font-sans">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-2xl shadow-xl border border-slate-700">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">
            CodeArena Admin
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Secure Proctoring System
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-slate-300 ml-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 ml-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
