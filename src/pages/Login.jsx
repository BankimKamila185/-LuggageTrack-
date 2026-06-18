import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Luggage, Eye, EyeOff, AlertTriangle, ChevronRight, User } from "lucide-react";
import { apiService } from "../services/api";

const DEMO_ACCOUNTS = [
  { username: "admin", role: "Admin", badge: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  { username: "checkin", role: "Check-In Staff", badge: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { username: "loading", role: "Loading Staff", badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  { username: "handover", role: "Handover Staff", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { username: "passenger", role: "Passenger", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" }
];

const ROLE_REDIRECTS = {
  "Admin": "/",
  "Check-In Staff": "/checkin",
  "Loading Staff": "/loading",
  "Handover Staff": "/handover",
  "Passenger": "/track"
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiService.login(username, password);
      const role = res.data.user.role;
      const redirect = ROLE_REDIRECTS[role] || "/";
      navigate(redirect);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (uname) => {
    setUsername(uname);
    setPassword("demo123");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-5">
        {/* Logo */}
        <div className="flex flex-col items-center mb-2">
          <Link to="/" className="flex items-center gap-2.5 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30">
              <Luggage className="h-6 w-6 text-blue-500 animate-pulse" />
            </div>
          </Link>
          <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight">
            LUGGAGE<span className="text-blue-500">TRACK</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">Baggage Logistics Cloud Gateway</p>
        </div>

        {/* Main Login Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-7 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-medium text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  id="username"
                  type="text"
                  required
                  className="w-full pl-10 pr-4 rounded-xl border border-slate-800 bg-slate-950 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="admin, checkin, loading..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-100 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>Sign In <ChevronRight className="h-4 w-4" /></>
              )}
            </button>
          </form>
        </div>

        {/* Demo Quick Login */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Demo Access</p>
          <div className="grid grid-cols-1 gap-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.username}
                onClick={() => quickLogin(acc.username)}
                className="flex items-center justify-between w-full rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2.5 hover:border-slate-700 hover:bg-slate-900/70 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${acc.badge}`}>
                    {acc.role}
                  </span>
                  <span className="text-xs font-mono text-slate-400">/ demo123</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">← Back to Home</Link>
          <span className="text-slate-800">·</span>
          <Link to="/track" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Track a Bag</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
