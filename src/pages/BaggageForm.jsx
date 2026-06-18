import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X, Info } from "lucide-react";
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

const BaggageForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: "",
    passengerName: "",
    flightNumber: "",
    origin: "",
    destination: "",
    weight: "",
    status: "Checked In",
    notes: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      const fetchBag = async () => {
        setLoading(true);
        try {
          const res = await apiService.getBaggageById(id);
          setFormData(res.data);
        } catch (err) {
          setError("Failed to load baggage record.");
        } finally {
          setLoading(false);
        }
      };
      fetchBag();
    } else {
      // Auto-generate a mock ID prefix for convenience
      const randNum = Math.floor(10000 + Math.random() * 90000);
      setFormData((prev) => ({ ...prev, id: `LT-${randNum}-JFK` }));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Form input validation
    if (!formData.id.trim()) {
      setError("Baggage ID is required.");
      setLoading(false);
      return;
    }
    if (!formData.passengerName.trim()) {
      setError("Passenger Name is required.");
      setLoading(false);
      return;
    }
    if (!formData.flightNumber.trim()) {
      setError("Flight Number is required.");
      setLoading(false);
      return;
    }
    if (!formData.origin.trim() || !formData.destination.trim()) {
      setError("Origin and Destination airports are required.");
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        await apiService.updateBaggage(id, formData);
      } else {
        await apiService.addBaggage(formData);
      }
      navigate("/baggage");
    } catch (err) {
      setError(err.message || "Failed to save baggage record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/baggage")}
          className="rounded-lg border border-slate-800 bg-slate-900/40 p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white m-0">
            {isEdit ? "Edit Baggage Record" : "Add Baggage Record"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isEdit ? `Modifying telemetry for item ${id}` : "Register a new baggage container in the logistics flow."}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm shadow-xl">
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-xs font-medium text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Two column fields */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Baggage ID
              </label>
              <input
                type="text"
                name="id"
                disabled={isEdit}
                required
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition-colors font-mono"
                value={formData.id}
                onChange={handleChange}
                placeholder="e.g. LT-12345-JFK"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Passenger Name
              </label>
              <input
                type="text"
                name="passengerName"
                required
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                value={formData.passengerName}
                onChange={handleChange}
                placeholder="First Last name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Flight Number
              </label>
              <input
                type="text"
                name="flightNumber"
                required
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-semibold"
                value={formData.flightNumber}
                onChange={handleChange}
                placeholder="e.g. AA-0120"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                name="weight"
                required
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 23.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Origin Airport
              </label>
              <input
                type="text"
                name="origin"
                required
                maxLength="3"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono uppercase"
                value={formData.origin}
                onChange={handleChange}
                placeholder="JFK"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Destination Airport
              </label>
              <input
                type="text"
                name="destination"
                required
                maxLength="3"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono uppercase"
                value={formData.destination}
                onChange={handleChange}
                placeholder="LAX"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Current Status
              </label>
              <select
                name="status"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
                value={formData.status}
                onChange={handleChange}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Handling Notes / Instructions
            </label>
            <textarea
              name="notes"
              rows="3"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Fragile contents, priority handling requested"
            />
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
            <Info className="h-4 w-4 text-blue-500 shrink-0" />
            <span>
              Saving will sync with local instances and trigger alert updates across active operation consoles.
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-800/60 pt-6">
            <button
              type="button"
              onClick={() => navigate("/baggage")}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BaggageForm;
