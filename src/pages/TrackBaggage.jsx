import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Luggage, Plane, ArrowLeft, Package, User, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { apiService } from "../services/api";
import StatusTimeline from "../components/StatusTimeline";

const STATUS_COLORS = {
  "Checked In": "text-blue-300 bg-blue-500/15 border-blue-500/30",
  "Security Cleared": "text-cyan-300 bg-cyan-500/15 border-cyan-500/30",
  "Loaded Into Aircraft": "text-violet-300 bg-violet-500/15 border-violet-500/30",
  "In Transit": "text-indigo-300 bg-indigo-500/15 border-indigo-500/30",
  "Arrived At Destination": "text-amber-300 bg-amber-500/15 border-amber-500/30",
  "Handed Over": "text-emerald-300 bg-emerald-500/15 border-emerald-500/30",
  "Lost": "text-red-300 bg-red-500/15 border-red-500/30",
  "Delayed": "text-orange-300 bg-orange-500/15 border-orange-500/30"
};

const TrackBaggage = () => {
  const [searchParams] = useSearchParams();
  const [bagId, setBagId] = useState(searchParams.get("id") || "");
  const [inputValue, setInputValue] = useState(searchParams.get("id") || "");
  const [baggage, setBaggage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (bagId) {
      handleSearch(bagId);
    }
  }, [bagId]);

  const handleSearch = async (id) => {
    const searchId = (id || inputValue).trim();
    if (!searchId) {
      setError("Please enter a Bag ID to track.");
      return;
    }
    setLoading(true);
    setError("");
    setBaggage(null);
    try {
      const res = await apiService.trackBaggage(searchId);
      setBaggage(res.data);
    } catch (err) {
      setError(err.message || "Baggage not found. Please check the ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setBagId(inputValue);
    handleSearch(inputValue);
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  const statusClass = baggage ? (STATUS_COLORS[baggage.status] || "text-slate-300 bg-slate-500/15 border-slate-500/30") : "";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-slate-800/70 bg-slate-900/60 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
            <div className="flex items-center gap-2 ml-2">
              <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Luggage className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-heading text-base font-bold text-white">
                LUGGAGE<span className="text-blue-500">TRACK</span>
              </span>
            </div>
          </Link>
          <Link
            to="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            Staff Login
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Page Title */}
        <div className="text-center mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5">
            <Search className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Passenger Self-Service</span>
          </div>
          <h1 className="font-heading text-4xl font-bold text-white mb-3">Track Your Baggage</h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Enter your Bag ID found on your baggage claim receipt or boarding pass to see real-time status.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-10">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="e.g. LT-89302-JFK"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-base focus:border-blue-500 focus:bg-slate-800 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-4 text-base font-semibold text-white hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/30 cursor-pointer"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              {loading ? "Searching..." : "Track"}
            </button>
          </div>

          {/* Quick Try */}
          <p className="text-xs text-slate-500 mt-2 ml-1">
            Try:{" "}
            {["LT-89302-JFK", "LT-55421-HND", "LT-11823-SYD", "LT-77381-CDG"].map((id, i) => (
              <button
                key={id}
                type="button"
                onClick={() => { setInputValue(id); handleSearch(id); }}
                className="font-mono text-blue-500 hover:text-blue-400 underline cursor-pointer mr-2"
              >
                {id}
              </button>
            ))}
          </p>
        </form>

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-300">Not Found</p>
              <p className="text-sm text-red-400/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !baggage && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Searching baggage records…</p>
          </div>
        )}

        {/* Result */}
        {baggage && (
          <div className="grid lg:grid-cols-5 gap-6 animate-fadeInUp">
            {/* Info Panel (Left) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Status Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Bag ID</p>
                    <p className="font-mono text-lg font-bold text-white">{baggage.id}</p>
                  </div>
                  <span className={`status-badge border ${statusClass}`}>
                    {baggage.status}
                  </span>
                </div>
                <div className="h-px bg-slate-800 my-4" />

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">Passenger</p>
                      <p className="text-sm font-semibold text-white">{baggage.passengerName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      <Plane className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">Flight</p>
                      <p className="text-sm font-semibold text-white font-mono">{baggage.flightNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">Route</p>
                      <p className="text-sm font-semibold text-white">
                        <span className="font-mono">{baggage.origin}</span>
                        <span className="mx-2 text-slate-500">→</span>
                        <span className="font-mono">{baggage.destination}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      <Package className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">Weight</p>
                      <p className="text-sm font-semibold text-white">{baggage.weight} kg</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-[10px] text-slate-500">Last Updated</p>
                  <p className="text-xs font-mono text-slate-300 mt-0.5">{formatDate(baggage.lastUpdated)}</p>
                </div>

                {baggage.notes && baggage.notes !== "None" && (
                  <div className="mt-3 rounded-lg bg-slate-800/60 p-3">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Notes</p>
                    <p className="text-xs text-slate-300">{baggage.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Panel (Right) */}
            <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="font-heading text-base font-bold text-white mb-6">Baggage Journey Timeline</h2>
              <StatusTimeline status={baggage.status} />
            </div>
          </div>
        )}

        {/* Empty / Intro State */}
        {!baggage && !loading && !error && (
          <div className="text-center py-16 text-slate-600">
            <Luggage className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-slate-500">Enter your Bag ID above to begin tracking</p>
            <p className="text-sm text-slate-600 mt-2">Your Bag ID is printed on the baggage claim receipt given at check-in.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default TrackBaggage;
