import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Plus,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  Tag,
  Plane,
  User,
  MessageSquare,
  Calendar,
  MapPin,
  Luggage,
  RefreshCw
} from "lucide-react";
import { apiService } from "../services/api";

const STATUS_CONFIG = {
  "Under Investigation": {
    icon: Clock,
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
  "Located": {
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  "Closed - Not Found": {
    icon: XCircle,
    className: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    dot: "bg-rose-400",
  },
  "Pending Review": {
    icon: FileText,
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dot: "bg-blue-400",
  },
};

const EMPTY_FORM = {
  passengerName: "",
  contactEmail: "",
  contactPhone: "",
  bagId: "",
  flight: "",
  route: "",
  lastSeenLocation: "",
  description: "",
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Pending Review"];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${cfg.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};

const ReportCard = ({ report, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const currentUser = apiService.getCurrentUser();
  const isStaff = currentUser && currentUser.role !== "Passenger";

  const formatted = new Date(report.reportedAt).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/30 backdrop-blur-sm overflow-hidden transition-all hover:border-slate-700">
      {/* Card Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20 shrink-0">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-rose-400">{report.id}</span>
              <span className="text-slate-600 text-xs">·</span>
              <span className="font-mono text-[11px] text-blue-400">{report.bagId || "UNKNOWN"}</span>
            </div>
            <p className="text-sm font-semibold text-white truncate mt-0.5">{report.passengerName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{report.flight} &nbsp;|&nbsp; {report.route || "No Route"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <StatusBadge status={report.status} />
          {expanded
            ? <ChevronUp className="h-4 w-4 text-slate-500" />
            : <ChevronDown className="h-4 w-4 text-slate-500" />}
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-slate-800 px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <InfoRow icon={Calendar} label="Reported At" value={formatted} />
          <InfoRow icon={MapPin} label="Last Seen" value={report.lastSeenLocation || "Not specified"} />
          
          {isStaff ? (
            <div className="flex items-start gap-2">
              <User className="h-3.5 w-3.5 text-slate-500 mt-1 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Assigned To</p>
                <input
                  type="text"
                  className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                  value={report.assignedTo || ""}
                  onChange={(e) => onUpdate(report.id, { assignedTo: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          ) : (
            <InfoRow icon={User} label="Assigned To" value={report.assignedTo || "Unassigned"} />
          )}

          <InfoRow icon={Tag} label="Contact Email" value={report.contactEmail} />
          <InfoRow icon={Tag} label="Contact Phone" value={report.contactPhone || "Not specified"} />

          {isStaff ? (
            <div className="flex items-start gap-2 col-span-1 md:col-span-2">
              <AlertTriangle className="h-3.5 w-3.5 text-slate-500 mt-1 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Status Update</p>
                <select
                  className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
                  value={report.status}
                  onChange={(e) => onUpdate(report.id, { status: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                >
                  {Object.keys(STATUS_CONFIG).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}

          <div className="md:col-span-2">
            <InfoRow icon={MessageSquare} label="Description" value={report.description} multiline />
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value, multiline }) => (
  <div className="flex items-start gap-2">
    <Icon className="h-3.5 w-3.5 text-slate-500 mt-0.5 shrink-0" />
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
      <p className={`text-slate-200 font-medium mt-0.5 ${multiline ? "whitespace-pre-wrap" : ""}`}>{value}</p>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const LostReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await apiService.getLostReports();
      setReports(res.data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReport = async (id, updatedFields) => {
    try {
      const res = await apiService.updateLostReport(id, updatedFields);
      // Update in local state
      setReports(prev => prev.map(r => r.id === id ? { ...r, ...res.data } : r));
    } catch (err) {
      console.error("Failed to update report:", err);
    }
  };

  // Filtered
  const filtered = reports.filter((r) => {
    const matchSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      (r.bagId && r.bagId.toLowerCase().includes(search.toLowerCase())) ||
      r.passengerName.toLowerCase().includes(search.toLowerCase()) ||
      r.flight.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const validate = () => {
    const errs = {};
    if (!form.passengerName.trim()) errs.passengerName = "Required";
    if (!form.contactEmail.trim()) errs.contactEmail = "Required";
    if (!form.flight.trim()) errs.flight = "Required";
    if (!form.description.trim()) errs.description = "Required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const newReport = {
      bagId: form.bagId || null,
      passengerName: form.passengerName,
      flight: form.flight,
      route: form.route || null,
      lastSeenLocation: form.lastSeenLocation || null,
      description: form.description,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone || null,
    };

    try {
      const res = await apiService.addLostReport(newReport);
      setReports([res.data, ...reports]);
      setForm(EMPTY_FORM);
      setErrors({});
      setShowForm(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      console.error("Failed to create lost report:", err);
    }
  };

  const fieldCls = (field) =>
    `w-full rounded-lg border bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-1 transition-colors ${
      errors[field] ? "border-rose-500 focus:border-rose-400 focus:ring-rose-500/20" : "border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"
    }`;

  const statCounts = {
    total: reports.length,
    investigating: reports.filter((r) => r.status === "Under Investigation").length,
    located: reports.filter((r) => r.status === "Located").length,
    closed: reports.filter((r) => r.status === "Closed - Not Found").length,
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white m-0">Lost Baggage Reports</h1>
          <p className="text-sm text-slate-400 mt-1">
            File a new lost item report or track the status of an existing investigation.
          </p>
        </div>
        <button
          id="btn-file-lost-report"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-rose-500 transition-all cursor-pointer self-start"
        >
          <Plus className="h-4 w-4" />
          File New Report
        </button>
      </div>

      {/* ── Success Banner ── */}
      {submitted && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Lost baggage report filed successfully. Our team will investigate and contact you within 24–48 hours.
        </div>
      )}

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Reports", value: statCounts.total, color: "text-white", border: "border-slate-700" },
          { label: "Under Investigation", value: statCounts.investigating, color: "text-amber-400", border: "border-amber-500/20" },
          { label: "Located", value: statCounts.located, color: "text-emerald-400", border: "border-emerald-500/20" },
          { label: "Closed – Not Found", value: statCounts.closed, color: "text-rose-400", border: "border-rose-500/20" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.border} bg-slate-900/30 p-4`}>
            <p className="text-xs text-slate-400 font-medium">{s.label}</p>
            <p className={`text-3xl font-bold font-heading mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Report Filing Form ── */}
      {showForm && (
        <div className="rounded-xl border border-blue-500/20 bg-slate-900/40 backdrop-blur-sm p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20">
              <FileText className="h-4 w-4 text-rose-400" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-white">New Lost Baggage Report</h2>
              <p className="text-xs text-slate-400">Fill in the details below to begin the investigation process.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Passenger Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Passenger Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="lr-passenger-name"
                  type="text"
                  placeholder="e.g. John Smith"
                  className={fieldCls("passengerName")}
                  value={form.passengerName}
                  onChange={(e) => { setForm({ ...form, passengerName: e.target.value }); setErrors({ ...errors, passengerName: "" }); }}
                />
                {errors.passengerName && <p className="text-[10px] text-rose-400 mt-1">{errors.passengerName}</p>}
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Contact Email <span className="text-rose-400">*</span>
                </label>
                <input
                  id="lr-contact-email"
                  type="email"
                  placeholder="e.g. john@email.com"
                  className={fieldCls("contactEmail")}
                  value={form.contactEmail}
                  onChange={(e) => { setForm({ ...form, contactEmail: e.target.value }); setErrors({ ...errors, contactEmail: "" }); }}
                />
                {errors.contactEmail && <p className="text-[10px] text-rose-400 mt-1">{errors.contactEmail}</p>}
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Contact Phone</label>
                <input
                  id="lr-contact-phone"
                  type="tel"
                  placeholder="e.g. +1-555-0100"
                  className={fieldCls("contactPhone")}
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                />
              </div>

              {/* Bag ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Baggage Tag / Bag ID</label>
                <input
                  id="lr-bag-id"
                  type="text"
                  placeholder="e.g. LT-11823-SYD"
                  className={fieldCls("bagId")}
                  value={form.bagId}
                  onChange={(e) => setForm({ ...form, bagId: e.target.value })}
                />
              </div>

              {/* Flight Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Flight Number <span className="text-rose-400">*</span>
                </label>
                <input
                  id="lr-flight-number"
                  type="text"
                  placeholder="e.g. AA-0451"
                  className={fieldCls("flight")}
                  value={form.flight}
                  onChange={(e) => { setForm({ ...form, flight: e.target.value }); setErrors({ ...errors, flight: "" }); }}
                />
                {errors.flight && <p className="text-[10px] text-rose-400 mt-1">{errors.flight}</p>}
              </div>

              {/* Route */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Route (Origin → Destination)</label>
                <input
                  id="lr-route"
                  type="text"
                  placeholder="e.g. LAX → SYD"
                  className={fieldCls("route")}
                  value={form.route}
                  onChange={(e) => setForm({ ...form, route: e.target.value })}
                />
              </div>

              {/* Last Seen Location */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Last Known Location of Baggage</label>
                <input
                  id="lr-last-seen"
                  type="text"
                  placeholder="e.g. Sorting Hub B, Terminal 4 or Gate 22"
                  className={fieldCls("lastSeenLocation")}
                  value={form.lastSeenLocation}
                  onChange={(e) => setForm({ ...form, lastSeenLocation: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Baggage Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="lr-description"
                  rows={3}
                  placeholder="Describe the bag: color, brand, distinguishing features, contents..."
                  className={`${fieldCls("description")} resize-none`}
                  value={form.description}
                  onChange={(e) => { setForm({ ...form, description: e.target.value }); setErrors({ ...errors, description: "" }); }}
                />
                {errors.description && <p className="text-[10px] text-rose-400 mt-1">{errors.description}</p>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setErrors({}); }}
                className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-submit-lost-report"
                type="submit"
                className="px-5 py-2 rounded-lg bg-rose-600 text-xs font-semibold text-white hover:bg-rose-500 transition-all cursor-pointer shadow-md shadow-rose-900/30"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Report ID, Bag ID, passenger, or flight..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">Status:</span>
          <select
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {Object.keys(STATUS_CONFIG).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Reports List ── */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/20 py-16 text-center">
            <Luggage className="h-8 w-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No reports match your search criteria.</p>
          </div>
        ) : (
          filtered.map((r) => <ReportCard key={r.id} report={r} onUpdate={handleUpdateReport} />)
        )}
      </div>

      {/* ── Help Notice ── */}
      <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-4 flex gap-3">
        <AlertTriangle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-300 space-y-1">
          <p className="font-semibold">Need immediate assistance?</p>
          <p>Contact the Lost &amp; Found desk at your arrival airport or call our 24/7 Baggage Support Hotline: <span className="font-mono font-bold">+1 800-555-BAGS</span></p>
        </div>
      </div>
    </div>
  );
};

export default LostReport;
