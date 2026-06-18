import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Plane, AlertCircle, X, RefreshCw } from "lucide-react";
import { apiService } from "../services/api";

const STATUS_COLORS = {
  "Checked In": "text-blue-300 bg-blue-500/15",
  "Security Cleared": "text-cyan-300 bg-cyan-500/15",
  "Loaded Into Aircraft": "text-violet-300 bg-violet-500/15",
  "In Transit": "text-indigo-300 bg-indigo-500/15",
  "Arrived At Destination": "text-amber-300 bg-amber-500/15",
  "Handed Over": "text-emerald-300 bg-emerald-500/15",
  "Lost": "text-red-300 bg-red-500/15",
  "Delayed": "text-orange-300 bg-orange-500/15"
};

// Loading staff sees: Checked In, Security Cleared bags that need to be loaded
const ELIGIBLE_STATUSES = ["Checked In", "Security Cleared", "Loaded Into Aircraft", "In Transit"];

const LoadingDashboard = () => {
  const [baggage, setBaggage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBaggage();
  }, []);

  const fetchBaggage = async () => {
    setLoading(true);
    try {
      const res = await apiService.getBaggage();
      const eligible = res.data.filter(b => ELIGIBLE_STATUSES.includes(b.status));
      setBaggage(eligible);
    } catch (e) {
      setError("Failed to load baggage. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bag, newStatus) => {
    setUpdating(bag.id);
    setError("");
    try {
      await apiService.updateBaggageStatus(bag.id, newStatus);
      setSuccess(`${bag.id} marked as "${newStatus}"`);
      await fetchBaggage();
    } catch (e) {
      setError(e.message || "Update failed. Try again.");
    } finally {
      setUpdating(null);
    }
  };

  const getActions = (bag) => {
    const actions = [];
    if (bag.status === "Checked In" || bag.status === "Security Cleared") {
      actions.push({ label: "Mark Loaded Into Aircraft", newStatus: "Loaded Into Aircraft", color: "text-violet-400 hover:text-violet-300 border-violet-500/30 bg-violet-500/10" });
    }
    if (bag.status === "Loaded Into Aircraft") {
      actions.push({ label: "Mark In Transit", newStatus: "In Transit", color: "text-indigo-400 hover:text-indigo-300 border-indigo-500/30 bg-indigo-500/10" });
    }
    return actions;
  };

  const counts = {
    checkedIn: baggage.filter(b => b.status === "Checked In").length,
    securityCleared: baggage.filter(b => b.status === "Security Cleared").length,
    loaded: baggage.filter(b => b.status === "Loaded Into Aircraft").length,
    inTransit: baggage.filter(b => b.status === "In Transit").length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Loading Operations</h1>
          <p className="text-sm text-slate-400 mt-1">Manage baggage loading onto aircraft and departure updates.</p>
        </div>
        <button
          onClick={fetchBaggage}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:border-slate-600 transition-all self-start cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-300 font-medium">{success}</p>
          <button onClick={() => setSuccess("")} className="ml-auto cursor-pointer text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300 font-medium">{error}</p>
          <button onClick={() => setError("")} className="ml-auto cursor-pointer text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Checked In", value: counts.checkedIn, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Security Cleared", value: counts.securityCleared, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          { label: "Loaded Into Aircraft", value: counts.loaded, color: "text-violet-400", bg: "bg-violet-500/10" },
          { label: "In Transit", value: counts.inTransit, color: "text-indigo-400", bg: "bg-indigo-500/10" }
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{item.label}</p>
            <p className={`text-3xl font-bold font-heading ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Baggage Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="font-heading text-base font-bold text-white">Baggage Queue — Loading Operations</h2>
          <p className="text-xs text-slate-400 mt-0.5">{baggage.length} bags in loading pipeline</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Bag ID</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Passenger</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Flight</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Destination</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Current Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {baggage.map(bag => {
                  const actions = getActions(bag);
                  return (
                    <tr key={bag.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-blue-400">{bag.id}</td>
                      <td className="px-4 py-4 text-slate-200 font-medium">{bag.passengerName}</td>
                      <td className="px-4 py-4 font-mono text-slate-300">{bag.flightNumber}</td>
                      <td className="px-4 py-4 font-mono text-slate-400">{bag.destination}</td>
                      <td className="px-4 py-4">
                        <span className={`status-badge ${STATUS_COLORS[bag.status] || ""}`}>
                          {bag.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {actions.map(action => (
                            <button
                              key={action.newStatus}
                              onClick={() => updateStatus(bag, action.newStatus)}
                              disabled={updating === bag.id}
                              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer disabled:opacity-60 ${action.color}`}
                            >
                              {updating === bag.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Plane className="h-3 w-3" />
                              )}
                              {action.label}
                            </button>
                          ))}
                          {actions.length === 0 && (
                            <span className="text-xs text-slate-600 italic">No actions available</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {baggage.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                      <Plane className="h-8 w-8 mx-auto mb-3 opacity-30" />
                      No baggage in the loading pipeline.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingDashboard;
