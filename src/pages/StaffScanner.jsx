import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  CameraOff,
  CheckCircle2,
  Clock,
  Luggage,
  Loader2,
  MapPin,
  Plane,
  ScanLine,
  Search,
  ShieldCheck,
  User,
  X
} from "lucide-react";
import { apiService } from "../services/api";

const STAFF_ROLES = ["Admin", "Check-In Staff", "Loading Staff", "Handover Staff"];

const STATUS_COLORS = {
  "Checked In": "text-blue-300 bg-blue-500/15 border-blue-500/30",
  "Security Cleared": "text-cyan-300 bg-cyan-500/15 border-cyan-500/30",
  "Loaded Into Aircraft": "text-violet-300 bg-violet-500/15 border-violet-500/30",
  "In Transit": "text-indigo-300 bg-indigo-500/15 border-indigo-500/30",
  "Arrived At Destination": "text-amber-300 bg-amber-500/15 border-amber-500/30",
  "Handed Over": "text-emerald-300 bg-emerald-500/15 border-emerald-500/30",
  "Lost": "text-red-300 bg-red-500/15 border-red-500/30",
  "Delayed": "text-orange-300 bg-orange-500/15 border-orange-500/30"
};

const ROLE_ACTIONS = {
  Admin: [
    { label: "Security Cleared", status: "Security Cleared", icon: ShieldCheck },
    { label: "Loaded Into Aircraft", status: "Loaded Into Aircraft", icon: Plane },
    { label: "In Transit", status: "In Transit", icon: Plane },
    { label: "Arrived At Destination", status: "Arrived At Destination", icon: MapPin },
    { label: "Handed Over", status: "Handed Over", icon: CheckCircle2 }
  ],
  "Check-In Staff": [
    { label: "Security Cleared", status: "Security Cleared", icon: ShieldCheck }
  ],
  "Loading Staff": [
    { label: "Loaded Into Aircraft", status: "Loaded Into Aircraft", icon: Plane },
    { label: "In Transit", status: "In Transit", icon: Plane }
  ],
  "Handover Staff": [
    { label: "Arrived At Destination", status: "Arrived At Destination", icon: MapPin },
    { label: "Handed Over", status: "Handed Over", icon: CheckCircle2 }
  ]
};

const SAMPLE_IDS = ["LT-89302-JFK", "LT-55421-HND", "LT-11823-SYD", "LT-77381-CDG"];

const StaffScanner = () => {
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const scanFrameRef = useRef(null);
  const lastDetectedRef = useRef("");
  const currentUser = apiService.getCurrentUser() || { role: "Staff" };
  const [scanValue, setScanValue] = useState("");
  const [baggage, setBaggage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const isStaff = STAFF_ROLES.includes(currentUser.role);
  const actions = ROLE_ACTIONS[currentUser.role] || [];


  const stopCamera = () => {
    if (scanFrameRef.current) {
      cancelAnimationFrame(scanFrameRef.current);
      scanFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraStarting(false);
  };

  const handleDetectedCode = (rawValue) => {
    const detected = normalizeScanValue(rawValue);
    if (!detected || detected === lastDetectedRef.current) return;

    lastDetectedRef.current = detected;
    setScanValue(detected);
    stopCamera();
    scanBag(detected);
  };

  const scanCameraFrame = async () => {
    const video = videoRef.current;
    const detector = detectorRef.current;

    if (!video || !detector || video.readyState < 2) {
      scanFrameRef.current = requestAnimationFrame(scanCameraFrame);
      return;
    }

    try {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      const codes = await detector.detect(video);
      if (codes.length > 0) {
        handleDetectedCode(codes[0].rawValue);
        return;
      }
    } catch {
      setCameraError("Camera is active, but barcode detection is not available in this browser.");
    }

    scanFrameRef.current = requestAnimationFrame(scanCameraFrame);
  };

  const startCamera = async () => {
    if (!isStaff || cameraStarting || cameraActive) return;
    setCameraError("");
    setError("");
    setSuccess("");
    setCameraStarting(true);
    lastDetectedRef.current = "";

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is not supported by this browser.");
      }
      if (!window.BarcodeDetector) {
        throw new Error("Barcode scanning is not supported by this browser. Use manual or USB scanning instead.");
      }

      detectorRef.current = new window.BarcodeDetector({
        formats: ["qr_code", "code_128", "code_39", "ean_13", "ean_8", "upc_a", "upc_e", "pdf417", "aztec"]
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
      scanFrameRef.current = requestAnimationFrame(scanCameraFrame);
    } catch (err) {
      stopCamera();
      setCameraError(err.message || "Camera permission was denied or no camera was found.");
    } finally {
      setCameraStarting(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "Not synced";
    return new Date(iso).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  useEffect(() => {
    inputRef.current?.focus();
    return () => stopCamera();
  }, []);

  const normalizeScanValue = (value) => {
    const trimmed = value.trim().toUpperCase();
    // If it matches a bag ID format, extract it
    const bagIdMatch = trimmed.match(/LT-\d{5}-[A-Z]{3}/);
    if (bagIdMatch) return bagIdMatch[0];
    // Otherwise return the raw trimmed string (boarding pass, PNR, etc.)
    return trimmed;
  };

  const extractBoardingPassQuery = (raw) => {
    // If it's a boarding pass BCBP string with PNR, return the whole string for the API to parse
    const hasPNR = /PNR[:\s-]+[A-Z0-9]+/i.test(raw);
    const hasBCBP = /BCBP|SKYPASS|BOARDING/i.test(raw);
    const hasBagId = /LT-\d{5}-[A-Z]{3}/.test(raw.toUpperCase());

    if (hasBagId) {
      const m = raw.toUpperCase().match(/LT-\d{5}-[A-Z]{3}/);
      return m ? m[0] : raw;
    }
    if (hasPNR || hasBCBP) return raw; // pass full string for PNR/name lookup
    return raw.trim().toUpperCase();
  };

  const scanBag = async (value = scanValue) => {
    const query = extractBoardingPassQuery(value);
    if (!query) {
      setError("Enter or scan a Bag ID or boarding pass.");
      setBaggage(null);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setBaggage(null);

    try {
      const res = await apiService.trackBaggage(query);
      setBaggage(res.data);
      setScanValue(res.data.id);
      setSuccess(`${res.data.id} scanned successfully.`);
    } catch (err) {
      setError(err.message || "No baggage record matched this scan.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    scanBag();
  };

  const updateStatus = async (status) => {
    if (!baggage) return;
    setUpdating(status);
    setError("");
    setSuccess("");

    try {
      const res = await apiService.updateBaggageStatus(baggage.id, status);
      setBaggage(res.data);
      setSuccess(`${baggage.id} updated to "${status}".`);
    } catch (err) {
      setError(err.message || "Status update failed.");
    } finally {
      setUpdating("");
      inputRef.current?.focus();
    }
  };

  const clearScan = () => {
    setScanValue("");
    setBaggage(null);
    setError("");
    setSuccess("");
    inputRef.current?.focus();
  };

  const statusClass = baggage
    ? STATUS_COLORS[baggage.status] || "text-slate-300 bg-slate-500/15 border-slate-500/30"
    : "";

  const availableActions = actions.filter(action => action.status !== baggage?.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Staff Scanner</h1>
          <p className="mt-1 text-sm text-slate-400">
            Scan baggage tags, verify passenger details, and update movement status from one staff console.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs font-semibold text-slate-300">
          <ScanLine className="h-4 w-4 text-blue-400" />
          Scanner ready for {currentUser.role}
        </div>
      </div>

      {!isStaff && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <p className="text-sm font-medium text-amber-200">
            Scanner access is available for airport staff only.
          </p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-bold text-white">Scan Input</h2>
              <p className="mt-0.5 text-xs text-slate-500">Use camera, USB scanner, or manual Bag ID input.</p>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <ScanLine className="h-5 w-5" />
            </div>
          </div>

          <div className="mb-5 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
            <div className="relative aspect-video overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
              <video
                ref={videoRef}
                muted
                playsInline
                className={`h-full w-full object-cover ${cameraActive ? "block" : "hidden"}`}
              />
              <canvas ref={canvasRef} className="hidden" />
              {!cameraActive && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Camera className="mb-3 h-10 w-10 text-slate-700" />
                  <p className="text-sm font-semibold text-slate-400">Camera scanner idle</p>
                  <p className="mt-1 text-xs text-slate-600">Start camera access to scan tags visually.</p>
                </div>
              )}
              {cameraActive && (
                <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-blue-400/70 shadow-[0_0_0_999px_rgba(2,6,23,0.35)]" />
              )}
            </div>

            {cameraError && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <p className="text-xs font-medium text-amber-200">{cameraError}</p>
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={startCamera}
                disabled={!isStaff || cameraStarting || cameraActive}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-100 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cameraStarting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                {cameraStarting ? "Requesting Camera..." : "Start Camera"}
              </button>
              <button
                type="button"
                onClick={stopCamera}
                disabled={!cameraActive && !cameraStarting}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CameraOff className="h-4 w-4" />
                Stop
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                ref={inputRef}
                type="text"
                value={scanValue}
                onChange={(e) => setScanValue(e.target.value.toUpperCase())}
                placeholder="LT-XXXXX-XXX"
                disabled={!isStaff || loading}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-4 pl-12 pr-12 font-mono text-base font-bold uppercase tracking-wide text-white placeholder-slate-600 outline-none transition-colors focus:border-blue-500 disabled:opacity-60"
              />
              {scanValue && (
                <button
                  type="button"
                  onClick={clearScan}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!isStaff || loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
              {loading ? "Scanning..." : "Scan Bag"}
            </button>
          </form>

          <div className="mt-5 border-t border-slate-800 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Quick test IDs</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_IDS.map(id => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scanBag(id)}
                  disabled={!isStaff || loading}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs font-semibold text-blue-300 transition-colors hover:border-blue-500/60 hover:text-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-bold text-white">Scan Result</h2>
              <p className="mt-0.5 text-xs text-slate-500">Baggage details appear here after a successful scan.</p>
            </div>
            {baggage && (
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}>
                {baggage.status}
              </span>
            )}
          </div>

          {success && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <p className="text-sm font-medium text-emerald-300">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <p className="text-sm font-medium text-red-300">{error}</p>
            </div>
          )}

          {baggage ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Bag ID", value: baggage.id, icon: Luggage, mono: true },
                  { label: "Passenger", value: baggage.passengerName, icon: User },
                  { label: "Flight", value: baggage.flightNumber, icon: Plane, mono: true },
                  { label: "Route", value: `${baggage.origin} to ${baggage.destination}`, icon: MapPin, mono: true },
                  { label: "Weight", value: `${baggage.weight} kg`, icon: Luggage },
                  { label: "Last Updated", value: formatDate(baggage.lastUpdated), icon: Clock }
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <Icon className="h-4 w-4 text-slate-500" />
                        {item.label}
                      </div>
                      <p className={`text-sm font-semibold text-white ${item.mono ? "font-mono" : ""}`}>
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              {baggage.notes && baggage.notes !== "None" && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Handling Notes</p>
                  <p className="text-sm text-slate-300">{baggage.notes}</p>
                </div>
              )}

              <div className="border-t border-slate-800 pt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Quick status actions</p>
                <div className="flex flex-wrap gap-2">
                  {availableActions.map(action => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.status}
                        type="button"
                        onClick={() => updateStatus(action.status)}
                        disabled={!!updating}
                        className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-xs font-bold text-blue-200 transition-colors hover:border-blue-400 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updating === action.status ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                        Mark {action.label}
                      </button>
                    );
                  })}
                  {availableActions.length === 0 && (
                    <span className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-xs font-medium text-slate-500">
                      No status actions available for this role and bag status.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/30 text-center">
              <ScanLine className="mb-4 h-14 w-14 text-slate-700" />
              <p className="font-heading text-lg font-bold text-slate-400">Awaiting scan</p>
              <p className="mt-1 max-w-sm text-sm text-slate-600">
                Scan a baggage tag or enter a Bag ID to pull the active record into the staff console.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default StaffScanner;
