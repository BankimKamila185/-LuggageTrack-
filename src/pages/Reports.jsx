import React, { useState, useEffect } from "react";
import { Download, FileSpreadsheet, TrendingUp, AlertTriangle, Clock, Percent } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { apiService } from "../services/api";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("daily");
  const [baggage, setBaggage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiService.getBaggage().then((res) => {
      setBaggage(res.data);
      setLoading(false);
    });
  }, []);

  const triggerMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3500);
  };

  // Export CSV Functionality
  const exportToCSV = () => {
    if (baggage.length === 0) return;
    
    // Headers
    const headers = ["Bag ID", "Passenger Name", "Flight", "Origin", "Destination", "Status", "Weight (kg)", "Last Updated"];
    
    // Rows
    const rows = baggage.map((b) => [
      b.id,
      `"${b.passengerName.replace(/"/g, '""')}"`,
      b.flightNumber,
      b.origin,
      b.destination,
      b.status,
      b.weight,
      b.lastUpdated
    ]);

    // CSV format
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    
    // Blob and Download trigger
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `luggagetrack_baggage_report_${activeTab}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerMessage("Successfully compiled and downloaded baggage CSV report.");
  };

  // Mock Report Stats
  const lostStats = baggage.filter((b) => b.status === "Lost").length;
  const delayedStats = baggage.filter((b) => b.status === "Delayed").length;
  const totalBags = baggage.length;
  const deliveryRate = totalBags ? (((totalBags - lostStats - delayedStats) / totalBags) * 100).toFixed(1) : 100;

  // Chart Mock Data based on tab selection
  const getChartData = () => {
    if (activeTab === "daily") {
      return [
        { label: "00:00", volume: 45, delayed: 2 },
        { label: "04:00", volume: 90, delayed: 4 },
        { label: "08:00", volume: 220, delayed: 8 },
        { label: "12:00", volume: 180, delayed: 5 },
        { label: "16:00", volume: 310, delayed: 12 },
        { label: "20:00", volume: 140, delayed: 3 }
      ];
    } else if (activeTab === "weekly") {
      return [
        { label: "Mon", volume: 480, delayed: 22 },
        { label: "Tue", volume: 550, delayed: 15 },
        { label: "Wed", volume: 620, delayed: 18 },
        { label: "Thu", volume: 590, delayed: 30 },
        { label: "Fri", volume: 710, delayed: 14 },
        { label: "Sat", volume: 410, delayed: 9 },
        { label: "Sun", volume: 450, delayed: 12 }
      ];
    } else {
      // Monthly
      return [
        { label: "Jan", volume: 12400, delayed: 410 },
        { label: "Feb", volume: 14100, delayed: 380 },
        { label: "Mar", volume: 16800, delayed: 490 },
        { label: "Apr", volume: 15900, delayed: 350 },
        { label: "May", volume: 18200, delayed: 520 },
        { label: "Jun", volume: 19100, delayed: 420 }
      ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white m-0">Reports & Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Deep analysis metrics, trend cycles, and logistics performance exports.</p>
        </div>
        <div className="flex items-center gap-3 self-start">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            Export CSV
          </button>
          <button
            onClick={() => triggerMessage("PDF Executive Summary compiling. Download will begin shortly.")}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Download PDF Report
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4 text-xs font-medium text-blue-400">
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("daily")}
          className={`px-4 py-2.5 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "daily" ? "border-blue-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Daily Summary
        </button>
        <button
          onClick={() => setActiveTab("weekly")}
          className={`px-4 py-2.5 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "weekly" ? "border-blue-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Weekly Analytics
        </button>
        <button
          onClick={() => setActiveTab("monthly")}
          className={`px-4 py-2.5 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "monthly" ? "border-blue-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Monthly History
        </button>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mishandle Rate</span>
            <Percent className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white">
            {(( (lostStats + delayedStats) / (totalBags || 1) ) * 100).toFixed(1)}%
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Delivery Accuracy</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white">{deliveryRate}%</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lost Inventory</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white">{lostStats}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Delays</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white">{delayedStats}</p>
        </div>
      </div>

      {/* Reports Chart Blocks */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* volume trend area chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <h3 className="font-heading text-sm font-semibold tracking-wider text-slate-400 uppercase mb-4">
            Baggage Ingestion Density
          </h3>
          <div className="h-72 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center animate-pulse bg-slate-950/40 rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getChartData()}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc", borderRadius: "8px" }}
                  />
                  <Area type="monotone" dataKey="volume" name="Bag Volume" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* delayed baggage breakdown chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <h3 className="font-heading text-sm font-semibold tracking-wider text-slate-400 uppercase mb-4">
            Mishandled & Delay Incidents
          </h3>
          <div className="h-72 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center animate-pulse bg-slate-950/40 rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()}>
                  <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc", borderRadius: "8px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="delayed" name="Delayed Alert Count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
