import React, { useState, useEffect } from "react";
import { Server, Activity, ShieldAlert, Cpu, HardDrive, Wifi, CheckCircle2, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { apiService } from "../services/api";

const Monitoring = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  const [uiRefreshEnabled, setUiRefreshEnabled] = useState(() => {
    const saved = localStorage.getItem("luggagetrack_ui_refresh_enabled");
    return saved === null ? true : saved === "true";
  });
  const [uiRefreshInterval, setUiRefreshInterval] = useState(() => {
    const saved = localStorage.getItem("luggagetrack_ui_refresh_interval");
    return saved === null ? 3000 : parseInt(saved, 10);
  });

  const fetchTelemetry = async (init = false) => {
    try {
      if (init) setLoading(true);
      const res = await apiService.getHealth();
      setHealth(res.data);
      
      const notificationsRes = await apiService.getNotifications();
      // Filter out only warnings and errors as alert notifications
      setAlerts(notificationsRes.data.filter((n) => n.type === "error" || n.type === "warning"));
    } catch (err) {
      console.error("Failed to load telemetry metrics.", err);
    } finally {
      if (init) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry(true);

    let interval = null;
    if (uiRefreshEnabled) {
      interval = setInterval(() => {
        fetchTelemetry(false);
      }, uiRefreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [uiRefreshEnabled, uiRefreshInterval]);

  const toggleUIRefresh = () => {
    const nextVal = !uiRefreshEnabled;
    setUiRefreshEnabled(nextVal);
    localStorage.setItem("luggagetrack_ui_refresh_enabled", String(nextVal));
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // Format historical arrays for Recharts
  const formatHistoryData = (historyArray) => {
    return historyArray.map((val, idx) => ({
      index: idx,
      value: val
    }));
  };

  const metricCards = [
    {
      name: "CPU Utilization",
      value: `${health.cpu.current}%`,
      status: health.cpu.current > 85 ? "Critical" : health.cpu.current > 70 ? "Warning" : "Optimal",
      icon: Cpu,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      history: formatHistoryData(health.cpu.history),
      gradientColor: "#3b82f6"
    },
    {
      name: "Memory Pool",
      value: `${health.memory.current}%`,
      status: health.memory.current > 85 ? "Critical" : "Optimal",
      icon: Activity,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      history: formatHistoryData(health.memory.history),
      gradientColor: "#a855f7"
    },
    {
      name: "Distributed Storage",
      value: `${health.storage.current}%`,
      status: "Healthy",
      icon: HardDrive,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      history: formatHistoryData(health.storage.history),
      gradientColor: "#10b981"
    },
    {
      name: "Network Throughput",
      value: `${health.network.current} Mbps`,
      status: "Active",
      icon: Wifi,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      history: formatHistoryData(health.network.history),
      gradientColor: "#6366f1"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white m-0">System Telemetry</h1>
          <p className="text-sm text-slate-400 mt-1">Infrastructure container metrics and real-time processing channel status.</p>
        </div>
        <div className="flex items-center gap-2 self-start bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4" />
          <span>Gateway Status: Fully Operational</span>
        </div>
      </div>

      {/* Polling Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/30 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Auto-Refresh:</span>
          <div className="flex items-center gap-2 bg-slate-950/60 rounded-lg p-1 border border-slate-800">
            <button
              onClick={toggleUIRefresh}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                uiRefreshEnabled
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {uiRefreshEnabled ? "Active" : "Paused"}
            </button>
            {uiRefreshEnabled && (
              <span className="text-[10px] text-slate-500 px-1 font-mono">
                {uiRefreshInterval / 1000}s
              </span>
            )}
          </div>
          <button
            onClick={() => fetchTelemetry(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer border border-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-transition" />
            Refresh
          </button>
        </div>

        <div className="text-[10px] text-slate-500 font-mono">
          Last sync: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Alert Notifications Drawer */}
      {alerts.length > 0 && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-yellow-500 mb-2 font-semibold text-xs uppercase tracking-wider">
            <ShieldAlert className="h-4.5 w-4.5" />
            <span>Active Diagnostics Warnings ({alerts.length})</span>
          </div>
          <div className="space-y-2 mt-1">
            {alerts.map((al) => (
              <div key={al.id} className="text-xs text-slate-300 flex items-center justify-between border-b border-slate-800/40 pb-1.5 last:border-0 last:pb-0">
                <span>{al.message}</span>
                <span className="text-[10px] text-slate-500 font-mono">{al.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Metric Cards with charts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.name}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{metric.name}</span>
                  <p className="mt-1 text-3xl font-extrabold tracking-tight text-white">{metric.value}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex rounded-lg p-2.5 ${metric.bg} mb-1`}>
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      metric.status === "Critical"
                        ? "text-red-400"
                        : metric.status === "Warning"
                        ? "text-yellow-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {metric.status}
                  </p>
                </div>
              </div>

              {/* Sparkline trend area chart */}
              <div className="h-32 w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metric.history}>
                    <defs>
                      <linearGradient id={`gradient-${metric.name.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={metric.gradientColor} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={metric.gradientColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc", fontSize: "11px", borderRadius: "6px" }}
                      labelFormatter={() => "Tick"}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name="Utilization %"
                      stroke={metric.gradientColor}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#gradient-${metric.name.replace(/\s+/g, '')})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* Core Node Telemetry Summary */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
        <h3 className="font-heading text-sm font-semibold tracking-wider text-slate-400 uppercase mb-4">
          Telemetry Core Cluster Information
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs text-slate-400">
          <div className="border border-slate-800 bg-slate-950/40 rounded-lg p-3">
            <span className="font-semibold block text-white mb-1">Instance Hostname</span>
            <span className="font-mono">lt-baggage-cloud-node-01</span>
          </div>
          <div className="border border-slate-800 bg-slate-950/40 rounded-lg p-3">
            <span className="font-semibold block text-white mb-1">Environment</span>
            <span className="font-mono uppercase text-blue-400 font-bold">Production-US-East</span>
          </div>
          <div className="border border-slate-800 bg-slate-950/40 rounded-lg p-3">
            <span className="font-semibold block text-white mb-1">Uptime Duration</span>
            <span className="font-mono">412h 18m 45s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
