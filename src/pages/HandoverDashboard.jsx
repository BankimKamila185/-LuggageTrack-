import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Hand, AlertCircle, X, RefreshCw, MapPin } from "lucide-react";
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

const ELIGIBLE_STATUSES = ["In Transit", "Arrived At Destination", "Handed Over"];

const HandoverDashboard = () => {
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
    if (bag.status === "In Transit") {
      actions.push({
        label: "Mark Arrived",
        newStatus: "Arrived At Destination",
        color: "text-amber-400 hover:text-amber-300 border-amber-500/30 bg-amber-500/10"
      });
    }
    if (bag.status === "Arrived At Destination") {
      actions.push({
        label: "Mark Handed Over",
        newStatus: "Handed Over",
        color: "text-emerald-400 hover:text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
      });
    }
    return actions;
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });
  };

  const counts = {
    inTransit: baggage.filter(b => b.status === "In Transit").length,
    arrived: baggage.filter(b => b.status === "Arrived At Destination").length,
    handedOver: baggage.filter(b => b.status === "Handed Over").length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Handover Operations</h1>
          <p className="text-sm text-slate-400 mt-1">Track arriving baggage and manage final passenger handovers.</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "In Transit", value: counts.inTransit, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
          { label: "Arrived At Destination", value: counts.arrived, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
          { label: "Handed Over Today", value: counts.handedOver, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
        ].map(item => (
          <div key={item.label} className={`rounded-xl border ${item.border} bg-slate-900/40 p-5`}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{item.label}</p>
            <p className={`text-4xl font-bold font-heading ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Baggage Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="font-heading text-base font-bold text-white">Arriving & Handover Queue</h2>
          <p className="text-xs text-slate-400 mt-0.5">{baggage.length} bags in arrival / handover pipeline</p>
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
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Origin → Dest</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Last Updated</th>
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
                      <td className="px-4 py-4 font-mono text-slate-400 text-xs">{bag.origin} → {bag.destination}</td>
                      <td className="px-4 py-4">
                        <span className={`status-badge ${STATUS_COLORS[bag.status] || ""}`}>
                          {bag.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500 font-mono">{formatDate(bag.lastUpdated)}</td>
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
                                <Hand className="h-3 w-3" />
                              )}
                              {action.label}
                            </button>
                          ))}
                          {actions.length === 0 && (
                            <span className="text-xs text-emerald-500/60 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {baggage.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500 text-sm">
                      <MapPin className="h-8 w-8 mx-auto mb-3 opacity-30" />
                      No arriving baggage at this time.
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

export default HandoverDashboard;
