import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Edit2, Trash2, SlidersHorizontal, RefreshCw } from "lucide-react";
import { apiService } from "../services/api";

const STATUS_OPTIONS = [
  "Checked In",
  "Security Cleared",
  "Loaded",
  "In Transit",
  "Delivered",
  "Delayed",
  "Lost"
];

const BaggageManagement = () => {
  const [baggage, setBaggage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const loadBaggage = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiService.getBaggage();
      setBaggage(res.data);
    } catch (err) {
      setError("Failed to fetch baggage records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaggage();
  }, []);

  const handleDelete = async (id) => {
    // Custom modal replacement
    if (window.confirm(`Are you sure you want to delete baggage record ${id}?`)) {
      try {
        await apiService.deleteBaggage(id);
        loadBaggage();
      } catch (err) {
        setError("Failed to delete record.");
      }
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "In Transit":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Checked In":
        return "bg-slate-500/10 text-slate-300 border-slate-700";
      case "Security Cleared":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "Loaded":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Delayed":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Lost":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-800 text-slate-400";
    }
  };

  // Filtering Logic
  const filteredBaggage = baggage.filter((bag) => {
    const matchesSearch =
      bag.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bag.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bag.flightNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || bag.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white m-0">Baggage Inventory</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time status tracking, filtering, and CRUD operations.</p>
        </div>
        <Link
          to="/baggage/add"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition-all cursor-pointer self-start"
        >
          <Plus className="h-4 w-4" />
          Add Baggage Record
        </Link>
      </div>

      {/* Filters & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder="Search by Bag ID, passenger, or flight..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter and Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            <span>Status:</span>
          </div>
          <select
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <button
            onClick={loadBaggage}
            disabled={loading}
            className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-xs font-medium text-red-400">
          {error}
        </div>
      )}

      {/* Main Table Card */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/20 backdrop-blur-sm">
        <table className="w-full border-collapse text-left text-sm text-slate-300">
          <thead className="bg-slate-900/60 font-heading text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Bag ID</th>
              <th className="px-6 py-4">Passenger Name</th>
              <th className="px-6 py-4">Flight</th>
              <th className="px-6 py-4">Origin / Dest</th>
              <th className="px-6 py-4">Current Status</th>
              <th className="px-6 py-4">Last Updated</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <span className="text-xs text-slate-500">Querying baggage log system...</span>
                  </div>
                </td>
              </tr>
            ) : filteredBaggage.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-xs text-slate-500">
                  No baggage records found matching the search filters.
                </td>
              </tr>
            ) : (
              filteredBaggage.map((bag) => (
                <tr key={bag.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-blue-400">
                    {bag.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {bag.passengerName}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-300">
                    {bag.flightNumber}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-400">
                    {bag.origin} &rarr; {bag.destination}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${getStatusStyle(bag.status)}`}>
                      {bag.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                    {formatDate(bag.lastUpdated)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/baggage/edit/${bag.id}`)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                        title="Edit Record"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(bag.id)}
                        className="rounded p-1.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BaggageManagement;
