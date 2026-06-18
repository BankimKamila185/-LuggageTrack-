import React, { useState } from "react";
import {
  Armchair,
  Luggage,
  ShieldCheck,
  Info,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Baby,
  Accessibility,
  Plane,
  Weight,
  CreditCard,
  Star,
  Package,
  ArrowRight,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const CABIN_CLASSES = [
  {
    id: "economy",
    name: "Economy Class",
    color: "from-slate-700/40 to-slate-800/20",
    border: "border-slate-700",
    badge: "bg-slate-700/40 text-slate-300 border-slate-600",
    icon: "🪑",
    carryOn: { count: 1, maxWeight: "7 kg", dimensions: "55 × 40 × 20 cm" },
    checked: { count: 1, maxWeight: "23 kg", overweightFee: "$75/bag" },
    extraBag: "$60 per additional bag",
    seat: {
      pitch: "30–32 in",
      width: "17–18 in",
      recline: "3–4 in",
    },
  },
  {
    id: "premium",
    name: "Premium Economy",
    color: "from-blue-700/20 to-blue-800/10",
    border: "border-blue-700/40",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    icon: "💺",
    carryOn: { count: 1, maxWeight: "10 kg", dimensions: "55 × 40 × 20 cm" },
    checked: { count: 2, maxWeight: "23 kg each", overweightFee: "$50/bag" },
    extraBag: "$45 per additional bag",
    seat: {
      pitch: "35–38 in",
      width: "18–19 in",
      recline: "5–6 in",
    },
  },
  {
    id: "business",
    name: "Business Class",
    color: "from-violet-700/20 to-violet-800/10",
    border: "border-violet-700/40",
    badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    icon: "🛋️",
    carryOn: { count: 2, maxWeight: "12 kg", dimensions: "55 × 40 × 20 cm" },
    checked: { count: 2, maxWeight: "32 kg each", overweightFee: "$0 (waived)" },
    extraBag: "$30 per additional bag",
    seat: {
      pitch: "60–78 in",
      width: "21–22 in",
      recline: "Full flat-bed",
    },
  },
  {
    id: "first",
    name: "First Class",
    color: "from-amber-700/20 to-amber-800/10",
    border: "border-amber-700/40",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    icon: "👑",
    carryOn: { count: 2, maxWeight: "14 kg", dimensions: "55 × 40 × 20 cm" },
    checked: { count: 3, maxWeight: "32 kg each", overweightFee: "$0 (waived)" },
    extraBag: "Complimentary (up to 5 total)",
    seat: {
      pitch: "78–86 in",
      width: "26–30 in",
      recline: "Private suite / flat-bed",
    },
  },
];

const SEAT_SELECTION_RULES = [
  {
    category: "Standard Seats",
    icon: Armchair,
    color: "text-slate-400",
    bgColor: "bg-slate-800/40",
    borderColor: "border-slate-700",
    rules: [
      "Available to all passengers at no additional charge during online check-in (24h before departure).",
      "Middle seats are always assigned last by the system unless specifically requested.",
      "Seat changes are free at the gate if seats remain available.",
      "Seats 1–5 rows behind emergency exits require adult occupants only.",
    ],
  },
  {
    category: "Exit Row Seats",
    icon: ShieldCheck,
    color: "text-amber-400",
    bgColor: "bg-amber-500/5",
    borderColor: "border-amber-500/20",
    rules: [
      "Passengers must be at least 15 years old and physically able to operate emergency exits.",
      "Passengers must be willing to assist the crew in an emergency.",
      "Not available to pregnant passengers, passengers traveling with infants, or passengers with reduced mobility.",
      "Exit row seats carry a premium fee in Economy and Premium Economy classes.",
      "Crew reserves the right to reassign exit row seats at any time for safety.",
    ],
  },
  {
    category: "Bulkhead / Front Row Seats",
    icon: Plane,
    color: "text-blue-400",
    bgColor: "bg-blue-500/5",
    borderColor: "border-blue-500/20",
    rules: [
      "Ideal for passengers with infants (bassinet attachment available upon request).",
      "No underseat storage — all carry-on must be placed in overhead bins during take-off and landing.",
      "Passengers with reduced mobility are given priority for bulkhead aisle seats.",
      "May be subject to a seat selection fee depending on class and route.",
    ],
  },
  {
    category: "Passengers with Reduced Mobility",
    icon: Accessibility,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/5",
    borderColor: "border-emerald-500/20",
    rules: [
      "Priority boarding is granted regardless of class.",
      "Aisle seats are reserved upon request — contact the airline at least 48h before departure.",
      "One mobility aid (wheelchair, crutches) is carried free of charge.",
      "Service animals are permitted in the cabin under IATA guidelines.",
      "Aisle wheelchairs are available on wide-body aircraft upon request.",
    ],
  },
  {
    category: "Infants & Children",
    icon: Baby,
    color: "text-pink-400",
    bgColor: "bg-pink-500/5",
    borderColor: "border-pink-500/20",
    rules: [
      "Infants under 2 years may travel on a parent's lap — one infant per adult, no additional seat required.",
      "A collapsible stroller may be checked free of charge at the gate.",
      "Children aged 5–11 traveling alone must be booked under the Unaccompanied Minor (UM) program.",
      "UM passengers are seated closest to the galley for crew visibility.",
      "Car seats / child safety seats must be FAA-approved and fit within seat dimensions.",
    ],
  },
];

const PROHIBITED_ITEMS = [
  { item: "Lithium batteries > 160 Wh", where: "Checked Baggage", allowed: false },
  { item: "Lithium batteries < 100 Wh (spare)", where: "Carry-On Only", allowed: true },
  { item: "E-cigarettes / vapes", where: "Carry-On Only (not used)", allowed: true },
  { item: "Aerosols > 100 ml", where: "Neither", allowed: false },
  { item: "Aerosols (toiletries) ≤ 100 ml", where: "Carry-On (1L bag)", allowed: true },
  { item: "Sharp objects (scissors ≤ 6 cm)", where: "Carry-On", allowed: true },
  { item: "Knives / blades", where: "Checked Baggage Only", allowed: true },
  { item: "Flammable liquids / gases", where: "Neither", allowed: false },
  { item: "Firearms (declared, unloaded)", where: "Checked Baggage Only", allowed: true },
  { item: "Medications (prescribed)", where: "Carry-On (with documents)", allowed: true },
  { item: "Alcohol > 70% ABV", where: "Neither", allowed: false },
  { item: "Alcohol 24–70% ABV", where: "Checked (max 5L)", allowed: true },
];

const UPGRADE_RULES = [
  {
    icon: Star,
    title: "Loyalty Points Upgrade",
    desc: "Members of Silver, Gold, or Platinum tier may use accrued miles to bid for a class upgrade up to 72h before departure through the app or website.",
  },
  {
    icon: CreditCard,
    title: "Paid Upgrade at Check-In",
    desc: "Upgrades to the next available class are offered at the check-in counter subject to availability. Prices vary by route and class.",
  },
  {
    icon: Plane,
    title: "Operational Upgrade",
    desc: "The airline may upgrade passengers involuntarily due to operational necessity (overbooking, medical needs). Compensatory miles are awarded.",
  },
  {
    icon: ArrowRight,
    title: "Upgrade Request Procedure",
    desc: "Submit upgrade requests online ≥ 24h before departure. Counter requests must be made ≥ 2h before departure. Upgrades are non-refundable once confirmed.",
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

const SectionAccordion = ({ rule }) => {
  const [open, setOpen] = useState(false);
  const Icon = rule.icon;

  return (
    <div className={`rounded-xl border ${rule.borderColor} overflow-hidden`}>
      <button
        className={`w-full flex items-center justify-between px-5 py-4 ${rule.bgColor} cursor-pointer hover:brightness-110 transition-all`}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-4.5 w-4.5 ${rule.color}`} style={{ width: 18, height: 18 }} />
          <span className="font-heading text-sm font-semibold text-white">{rule.category}</span>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-slate-400" />
          : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {open && (
        <ul className="px-5 py-4 space-y-2.5 border-t border-slate-800/60 bg-slate-900/20">
          {rule.rules.map((r, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const SeatRules = () => {
  const [activeClass, setActiveClass] = useState("economy");
  const cabin = CABIN_CLASSES.find((c) => c.id === activeClass);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-white m-0">
          Passenger Seating &amp; Baggage Rules
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Official policies for baggage allowances, seat selection, and passenger-specific guidelines.
        </p>
      </div>

      {/* ── Cabin Class Selector ── */}
      <section>
        <h2 className="font-heading text-base font-bold text-white mb-4 flex items-center gap-2">
          <Luggage className="h-4.5 w-4.5 text-blue-400" style={{ width: 18, height: 18 }} />
          Baggage Allowance by Cabin Class
        </h2>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {CABIN_CLASSES.map((c) => (
            <button
              key={c.id}
              id={`tab-${c.id}`}
              onClick={() => setActiveClass(c.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                activeClass === c.id
                  ? `${c.badge} shadow-md`
                  : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <span>{c.icon}</span>
              {c.name}
            </button>
          ))}
        </div>

        {/* Cabin Details Card */}
        <div className={`rounded-xl border ${cabin.border} bg-gradient-to-br ${cabin.color} p-6 grid grid-cols-1 md:grid-cols-3 gap-6`}>
          {/* Carry-On */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-slate-700/60 pb-2">
              <Package className="h-4 w-4 text-blue-400" />
              Carry-On Baggage
            </div>
            <AllowanceRow label="Pieces" value={`${cabin.carryOn.count} bag`} />
            <AllowanceRow label="Max Weight" value={cabin.carryOn.maxWeight} />
            <AllowanceRow label="Dimensions" value={cabin.carryOn.dimensions} />
          </div>

          {/* Checked */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-slate-700/60 pb-2">
              <Luggage className="h-4 w-4 text-violet-400" />
              Checked Baggage
            </div>
            <AllowanceRow label="Pieces" value={`${cabin.checked.count} bag(s)`} />
            <AllowanceRow label="Max Weight" value={cabin.checked.maxWeight} />
            <AllowanceRow label="Overweight Fee" value={cabin.checked.overweightFee} />
            <AllowanceRow label="Extra Bag" value={cabin.extraBag} />
          </div>

          {/* Seat */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-slate-700/60 pb-2">
              <Armchair className="h-4 w-4 text-amber-400" />
              Seat Specifications
            </div>
            <AllowanceRow label="Pitch" value={cabin.seat.pitch} />
            <AllowanceRow label="Width" value={cabin.seat.width} />
            <AllowanceRow label="Recline" value={cabin.seat.recline} />
          </div>
        </div>

        {/* General Notes */}
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-blue-500/10 bg-blue-500/5 px-4 py-3">
          <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300">
            Allowances apply per passenger per journey. Children aged 2–11 receive the same allowance as adults. Infants under 2 on lap receive one 10 kg checked bag. Allowances may vary by route — always verify at time of booking.
          </p>
        </div>
      </section>

      {/* ── Seat Selection Rules ── */}
      <section>
        <h2 className="font-heading text-base font-bold text-white mb-4 flex items-center gap-2">
          <Armchair className="h-4.5 w-4.5 text-violet-400" style={{ width: 18, height: 18 }} />
          Seat Selection Rules &amp; Special Categories
        </h2>
        <div className="space-y-3">
          {SEAT_SELECTION_RULES.map((rule) => (
            <SectionAccordion key={rule.category} rule={rule} />
          ))}
        </div>
      </section>

      {/* ── Upgrade Rules ── */}
      <section>
        <h2 className="font-heading text-base font-bold text-white mb-4 flex items-center gap-2">
          <Star className="h-4.5 w-4.5 text-amber-400" style={{ width: 18, height: 18 }} />
          Class Upgrade Policy
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {UPGRADE_RULES.map((u) => {
            const Icon = u.icon;
            return (
              <div key={u.title} className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
                  <Icon className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{u.title}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{u.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Prohibited Items Table ── */}
      <section>
        <h2 className="font-heading text-base font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4.5 w-4.5 text-rose-400" style={{ width: 18, height: 18 }} />
          Prohibited &amp; Restricted Items
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/20">
          <table className="w-full border-collapse text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Item</th>
                <th className="px-5 py-3">Where Permitted</th>
                <th className="px-5 py-3 text-center">Allowed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {PROHIBITED_ITEMS.map((item) => (
                <tr key={item.item} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-200">{item.item}</td>
                  <td className="px-5 py-3 text-slate-400">{item.where}</td>
                  <td className="px-5 py-3 text-center">
                    {item.allowed
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                      : <XCircle className="h-4 w-4 text-rose-400 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-rose-500/10 bg-rose-500/5 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-300">
            Passengers found carrying prohibited items may be denied boarding. All baggage is subject to X-ray and physical inspection. Violations may result in fines and legal action as per applicable aviation law.
          </p>
        </div>
      </section>

      {/* ── Weight Overage Fee Scale ── */}
      <section>
        <h2 className="font-heading text-base font-bold text-white mb-4 flex items-center gap-2">
          <Weight className="h-4.5 w-4.5 text-cyan-400" style={{ width: 18, height: 18 }} />
          Overweight Baggage Fee Schedule
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { range: "23 – 32 kg", fee: "$75 per bag", note: "Economy / Premium Economy" },
            { range: "32 – 45 kg", fee: "$150 per bag", note: "All classes (max limit)" },
            { range: "> 45 kg", fee: "Not Accepted", note: "Freight shipment required" },
          ].map((tier) => (
            <div key={tier.range} className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-center">
              <p className="font-mono text-lg font-bold text-white">{tier.range}</p>
              <p className={`text-sm font-semibold mt-1 ${tier.fee === "Not Accepted" ? "text-rose-400" : "text-amber-400"}`}>{tier.fee}</p>
              <p className="text-[11px] text-slate-500 mt-1">{tier.note}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// Helper
const AllowanceRow = ({ label, value }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-slate-400">{label}</span>
    <span className="font-semibold text-white">{value}</span>
  </div>
);

export default SeatRules;
