import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Luggage, ArrowLeft, Mail, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-blue-600/8 blur-[100px]" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Luggage className="h-5 w-5 text-white" />
            </div>
            <span className="font-heading text-xl font-bold text-white">
              LUGGAGE<span className="text-blue-500">TRACK</span>
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-8">
          {!sent ? (
            <>
              <div className="text-center mb-8">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 border border-blue-500/20">
                  <Mail className="h-7 w-7 text-blue-400" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-white mb-2">Reset Password</h1>
                <p className="text-sm text-slate-400">
                  Enter your registered email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(""); }}
                      placeholder="you@company.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-blue-500 focus:bg-slate-800/80 transition-colors"
                    />
                  </div>
                  {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60 transition-all shadow-lg shadow-blue-900/30 cursor-pointer"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending Reset Link…</>
                  ) : (
                    <>Send Reset Link <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/20">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="font-heading text-xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-sm text-slate-400 mb-1">
                We've sent a password reset link to:
              </p>
              <p className="text-sm font-semibold text-blue-400 mb-6">{email}</p>
              <p className="text-xs text-slate-500">
                Didn't receive it? Check your spam folder or{" "}
                <button
                  onClick={() => setSent(false)}
                  className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                >
                  try again
                </button>.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
