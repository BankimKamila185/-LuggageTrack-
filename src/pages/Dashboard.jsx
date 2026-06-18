import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Luggage,
  CheckCircle2,
  TrendingUp,
  AlertOctagon,
  Clock,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Hand,
  MapPin,
  Package,
  AlertTriangle
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import { apiService } from "../services/api";
import { weeklyBaggageData, flightWiseBaggageData } from "../services/mockData";

const COLORS = ["#3b82f6", "#10b981", "#6366f1", "#f43f5e", "#f59e0b", "#64748b", "#8b5cf6", "#06b6d4"];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [baggage, setBaggage] = useState([]);
  const [activity, setActivity] = useState([]);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bagRes = await apiService.getBaggage();
        const actRes = await apiService.getRecentActivity();
        const healthRes = await apiService.getHealth();
        setBaggage(bagRes.data);
        setActivity(actRes.data);
        setHealth(healthRes.data);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // Calculate Metrics
  const totalBaggage = baggage.length;
  const statusCounts = baggage.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const checkedIn = statusCounts["Checked In"] || 0;
  const securityCleared = statusCounts["Security Cleared"] || 0;
  const loaded = statusCounts["Loaded Into Aircraft"] || 0;
  const inTransit = statusCounts["In Transit"] || 0;
  const arrived = statusCounts["Arrived At Destination"] || 0;
  const handedOver = statusCounts["Handed Over"] || 0;
  const lost = statusCounts["Lost"] || 0;
  const delayed = statusCounts["Delayed"] || 0;

  // Pie Chart Data
  const pieData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));

  // Daily processing bar chart
  const barData = [
    { day: "Mon", processed: 450, delayed: 12 },
    { day: "Tue", processed: 520, delayed: 8 },
    { day: "Wed", processed: 490, delayed: 15 },
    { day: "Thu", processed: 610, delayed: 5 },
    { day: "Fri", processed: 580, delayed: 22 },
    { day: "Sat", processed: 390, delayed: 14 },
    { day: "Sun", processed: 430, delayed: 9 }
  ];

  const kpis = [
    { name: "Total Baggage", value: totalBaggage, icon: Luggage, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { name: "Checked In", value: checkedIn, icon: Package, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
    { name: "Loaded", value: loaded, icon: CheckCircle2, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    { name: "In Transit", value: inTransit, icon: TrendingUp, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    { name: "Arrived", value: arrived, icon: MapPin, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { name: "Handed Over", value: handedOver, icon: Hand, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { name: "Lost Baggage", value: lost, icon: AlertOctagon, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    { name: "Delayed", value: delayed, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" }
  ];

  const tooltipStyle = {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    color: "#f8fafc",
    borderRadius: "8px",
    fontSize: "11px"
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white m-0">Operations Control Center</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time status overview of all baggage processing channels.</p>
        </div>
        <Link
          to="/baggage"
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-500 transition-all cursor-pointer self-start"
        >
          Manage Baggage
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* KPI Cards Grid — 8 cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.name}
              className={`rounded-xl border ${kpi.border} bg-slate-900/40 p-4 backdrop-blur-sm hover:bg-slate-900/60 transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{kpi.name}</span>
                <div className={`rounded-lg p-1.5 ${kpi.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight text-white">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1: Daily Bar + Status Pie */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Daily Processing Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <h3 className="font-heading text-sm font-semibold tracking-wider text-slate-400 uppercase mb-4">
            Daily Baggage Processing Volume
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barGap={4}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(59,130,246,0.05)" }} />
                <Legend wrapperStyle={{ fontSize: "11px", marginTop: "10px" }} />
                <Bar dataKey="processed" name="Processed" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="delayed" name="Delayed Alert" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <h3 className="font-heading text-sm font-semibold tracking-wider text-slate-400 uppercase mb-4">
            Status Distribution
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] text-slate-400">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Weekly + Flight-Wise */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly Baggage Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <h3 className="font-heading text-sm font-semibold tracking-wider text-slate-400 uppercase mb-4">
            Weekly Processing Trend
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyBaggageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="processed" name="Processed" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: "#3b82f6", r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="delayed" name="Delayed" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#f59e0b", r: 3 }} />
                <Line type="monotone" dataKey="lost" name="Lost" stroke="#f43f5e" strokeWidth={2} dot={{ fill: "#f43f5e", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flight-Wise Baggage Volume */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <h3 className="font-heading text-sm font-semibold tracking-wider text-slate-400 uppercase mb-4">
            Flight-Wise Baggage Volume
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flightWiseBaggageData} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="flight" type="category" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={60} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(59,130,246,0.05)" }} />
                <Bar dataKey="baggage" name="Bags" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Info Rows: Activity + Health */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <h3 className="font-heading text-sm font-semibold tracking-wider text-slate-400 uppercase mb-4">
            Recent Logs & Activities
          </h3>
          <div className="space-y-4">
            {activity.slice(0, 6).map((act) => (
              <div key={act.id} className="flex items-start justify-between border-b border-slate-800/60 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-xs font-semibold text-white">{act.action}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{act.details}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">Triggered by {act.user}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Infrastructure & Health */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-sm font-semibold tracking-wider text-slate-400 uppercase mb-4">
              Logistics Infrastructure Health
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Core API Gateway</span>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                  <ShieldCheck className="h-4 w-4" /> Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Baggage Belt Sorting Feeders</span>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                  <ShieldCheck className="h-4 w-4" /> Active (Belt A, B, C)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">System Telemetry CPU</span>
                <span className="text-xs font-mono text-white flex items-center gap-1">
                  <Cpu className="h-3.5 w-3.5 text-blue-500" />
                  {health?.cpu.current}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Memory Usage</span>
                <span className="text-xs font-mono text-white">{health?.memory.current}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Ingestion Network Bandwidth</span>
                <span className="text-xs font-mono text-blue-400 font-semibold">{health?.network.current} Mbps</span>
              </div>
            </div>
          </div>
          <Link
            to="/monitoring"
            className="flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-400 mt-6 transition-colors self-start cursor-pointer"
          >
            Open Monitoring Console <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
