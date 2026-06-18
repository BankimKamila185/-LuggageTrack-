import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Luggage,
  Plane,
  Shield,
  BarChart3,
  Globe,
  Users,
  Zap,
  ChevronRight,
  Search,
  ArrowRight,
  CheckCircle2,
  Star
} from "lucide-react";

const FEATURES = [
  {
    icon: Luggage,
    title: "Real-Time Tracking",
    description: "Track every bag across 6 journey stages from check-in to final handover with live status updates.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20"
  },
  {
    icon: Shield,
    title: "Security Integration",
    description: "Seamless integration with airport security systems to ensure all baggage passes clearance protocols.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20"
  },
  {
    icon: Users,
    title: "Multi-Role Access",
    description: "Dedicated portals for Check-In, Loading, Handover Staff and Passengers with role-appropriate views.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Daily, weekly, and monthly analytics with KPI dashboards, flight-wise volumes, and trend charts.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20"
  },
  {
    icon: Globe,
    title: "Global Airports",
    description: "Support for multi-airport operations across international hubs with timezone-aware tracking.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20"
  },
  {
    icon: Zap,
    title: "AWS Cloud Infrastructure",
    description: "Built on AWS with real-time monitoring of CPU, memory, storage, and network metrics.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20"
  }
];

const STATS = [
  { value: "2.4M+", label: "Bags Tracked Daily" },
  { value: "180+", label: "Airport Partners" },
  { value: "99.98%", label: "Tracking Accuracy" },
  { value: "<2s", label: "Status Update Latency" }
];

const Landing = () => {
  const [trackId, setTrackId] = useState("");
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackId.trim()) {
      navigate(`/track?id=${encodeURIComponent(trackId.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 backdrop-blur-xl bg-slate-950/80">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Luggage className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading text-lg font-bold tracking-wide text-white">
              LUGGAGE<span className="text-blue-500">TRACK</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer">Features</a>
            <a href="#stats" className="text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer">Overview</a>
            <Link
              to="/track"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Track Baggage
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/track"
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:border-blue-500 hover:text-blue-400 transition-all"
            >
              <Search className="h-4 w-4" />
              Track Bag
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/30"
            >
              Staff Login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute top-40 right-0 h-[400px] w-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />
          <div className="absolute top-20 left-0 h-[300px] w-[300px] rounded-full bg-cyan-600/6 blur-[80px]" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
              backgroundSize: "64px 64px"
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="animate-fadeInUp">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-semibold text-blue-400 tracking-wide uppercase">
                  Enterprise Baggage Logistics Cloud
                </span>
              </div>

              <h1 className="font-heading text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-white mb-6">
                Track Every Bag,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600">
                  Every Flight,
                </span>{" "}
                Every Time
              </h1>

              <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl">
                LuggageTrack is the airport industry's most advanced baggage logistics management
                platform — real-time tracking, role-based dashboards, and AI-powered analytics
                across your entire operation.
              </p>

              {/* Track Form */}
              <form onSubmit={handleTrack} className="flex gap-3 mb-8 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={trackId}
                    onChange={e => setTrackId(e.target.value)}
                    placeholder="Enter Bag ID (e.g. LT-89302-JFK)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:bg-slate-800 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/30 cursor-pointer whitespace-nowrap"
                >
                  Track <ChevronRight className="h-4 w-4" />
                </button>
              </form>

              {/* Quick Links */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/login"
                  className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-400 transition-all"
                >
                  Staff Login <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>No login required for passenger tracking</span>
                </div>
              </div>
            </div>

            {/* Right: Illustration / Dashboard Preview */}
            <div className="animate-fadeInUp-delay-2 flex justify-center">
              <div className="relative w-full max-w-sm">
                {/* Floating Airport Illustration */}
                <div className="animate-float relative z-10">
                  {/* Main card */}
                  <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 backdrop-blur-sm p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                          <Luggage className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">LT-55421-HND</p>
                          <p className="text-[10px] text-slate-400">Aiko Tanaka · JL-0006</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-1 text-[10px] font-bold text-indigo-300 uppercase">In Transit</span>
                    </div>

                    {/* Mini Timeline */}
                    <div className="space-y-2.5">
                      {["Checked In", "Security Cleared", "Loaded Into Aircraft", "In Transit"].map((step, i) => (
                        <div key={step} className="flex items-center gap-2.5">
                          <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${i < 3 ? "bg-emerald-600 border-emerald-500" : i === 3 ? "bg-blue-600 border-blue-400 ring-2 ring-blue-400/20" : "bg-slate-800 border-slate-600"}`}>
                            {i < 3 ? <CheckCircle2 className="h-3 w-3 text-white" /> : <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                          </div>
                          <span className={`text-[11px] font-medium ${i <= 3 ? "text-slate-200" : "text-slate-600"}`}>{step}</span>
                        </div>
                      ))}
                    </div>

                    {/* Route */}
                    <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-800">
                      <div className="text-center">
                        <p className="font-mono text-base font-bold text-white">LAX</p>
                        <p className="text-[9px] text-slate-500">Origin</p>
                      </div>
                      <div className="flex-1 flex items-center gap-1">
                        <div className="h-px flex-1 bg-slate-700" />
                        <Plane className="h-4 w-4 text-blue-500 rotate-90" />
                        <div className="h-px flex-1 bg-slate-700" />
                      </div>
                      <div className="text-center">
                        <p className="font-mono text-base font-bold text-white">HND</p>
                        <p className="text-[9px] text-slate-500">Destination</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative floating chips */}
                <div className="absolute -top-4 -right-4 rounded-xl border border-emerald-500/30 bg-slate-900 px-3 py-2 shadow-xl">
                  <p className="text-[10px] text-slate-400">Today's Throughput</p>
                  <p className="text-sm font-bold text-emerald-400">2,847 bags ↑</p>
                </div>
                <div className="absolute -bottom-4 -left-4 rounded-xl border border-amber-500/30 bg-slate-900 px-3 py-2 shadow-xl">
                  <p className="text-[10px] text-slate-400">System Health</p>
                  <p className="text-sm font-bold text-amber-400">98.7% Uptime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 border-y border-slate-800/60">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <div key={stat.label} className={`text-center animate-fadeInUp-delay-${i + 1}`}>
                <p className="font-heading text-4xl font-extrabold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">Platform Features</span>
            </div>
            <h2 className="font-heading text-4xl font-bold text-white mb-4">
              Everything Airport Operations Needs
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Purpose-built for airport operations teams — from frontline check-in agents to executive administrators.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`group rounded-2xl border ${feature.border} bg-slate-900/40 p-6 hover:bg-slate-900/70 transition-all duration-300 hover:-translate-y-1 cursor-default`}
                >
                  <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.bg}`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/60 via-slate-950 to-indigo-950/40" />
        </div>
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-heading text-4xl font-bold text-white mb-4">
            Ready to Modernize Your Baggage Operations?
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Join 180+ airports worldwide using LuggageTrack to eliminate lost baggage and deliver exceptional passenger experiences.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/40 cursor-pointer"
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/track"
              className="flex items-center gap-2 rounded-xl border border-slate-600 px-8 py-4 text-base font-medium text-slate-300 hover:border-blue-500 hover:text-blue-400 transition-all cursor-pointer"
            >
              <Search className="h-5 w-5" />
              Track a Bag
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Luggage className="h-4 w-4 text-blue-500" />
            <span className="font-heading text-sm font-bold text-white">
              LUGGAGE<span className="text-blue-500">TRACK</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            © 2026 LuggageTrack Baggage Logistics Cloud. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Staff Portal</Link>
            <Link to="/track" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Track Baggage</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
