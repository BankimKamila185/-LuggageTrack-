import React from "react";
import { CheckCircle2, Clock, Plane, Package, MapPin, Hand } from "lucide-react";

const JOURNEY_STEPS = [
  {
    key: "Checked In",
    label: "Checked In",
    icon: Package,
    description: "Baggage received and tagged at check-in counter"
  },
  {
    key: "Security Cleared",
    label: "Security Cleared",
    icon: CheckCircle2,
    description: "Passed through security screening and approved"
  },
  {
    key: "Loaded Into Aircraft",
    label: "Loaded Into Aircraft",
    icon: Plane,
    description: "Loaded into the aircraft cargo hold"
  },
  {
    key: "In Transit",
    label: "In Transit",
    icon: Plane,
    description: "Aircraft in flight to the destination airport"
  },
  {
    key: "Arrived At Destination",
    label: "Arrived At Destination",
    icon: MapPin,
    description: "Baggage unloaded and at the destination carousel"
  },
  {
    key: "Handed Over",
    label: "Handed Over",
    icon: Hand,
    description: "Successfully delivered to the passenger"
  }
];

const SPECIAL_STATUSES = ["Lost", "Delayed"];

const getStepIndex = (status) => {
  return JOURNEY_STEPS.findIndex(s => s.key === status);
};

const StatusTimeline = ({ status }) => {
  const currentIndex = getStepIndex(status);
  const isSpecial = SPECIAL_STATUSES.includes(status);

  return (
    <div className="w-full">
      {/* Special Status Banner */}
      {isSpecial && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-xl border p-4 ${
            status === "Lost"
              ? "border-red-500/30 bg-red-500/10 text-red-300"
              : "border-amber-500/30 bg-amber-500/10 text-amber-300"
          }`}
        >
          <Clock className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">
              {status === "Lost" ? "⚠ Baggage Reported Lost" : "⚠ Baggage Delayed"}
            </p>
            <p className="text-xs mt-0.5 opacity-80">
              {status === "Lost"
                ? "Our team is actively investigating. You will be contacted within 24 hours."
                : "Your baggage has been delayed due to flight scheduling. It will arrive on the next available flight."}
            </p>
          </div>
        </div>
      )}

      {/* Timeline Steps */}
      <div className="relative">
        {JOURNEY_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isDone = !isSpecial && currentIndex > index;
          const isActive = !isSpecial && currentIndex === index;
          const isPending = isSpecial || currentIndex < index;

          return (
            <div key={step.key} className="flex gap-4">
              {/* Step Indicator Column */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isDone
                      ? "timeline-step-done"
                      : isActive
                      ? "timeline-step-active"
                      : "timeline-step-pending"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  ) : (
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-white" : "text-slate-500"
                      }`}
                    />
                  )}
                  {isActive && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-blue-500 opacity-30" />
                  )}
                </div>

                {/* Connector Line */}
                {index < JOURNEY_STEPS.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 my-1 min-h-[28px] rounded-full transition-all duration-500 ${
                      isDone ? "bg-emerald-600" : "bg-slate-800"
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className={`pb-6 pt-1.5 ${index === JOURNEY_STEPS.length - 1 ? "pb-0" : ""}`}>
                <p
                  className={`text-sm font-semibold leading-tight ${
                    isDone
                      ? "text-emerald-400"
                      : isActive
                      ? "text-white"
                      : "text-slate-500"
                  }`}
                >
                  {step.label}
                  {isActive && (
                    <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                      Current
                    </span>
                  )}
                  {isDone && (
                    <span className="ml-2 rounded-full bg-emerald-600/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                      Completed
                    </span>
                  )}
                </p>
                <p className={`mt-0.5 text-xs ${isDone || isActive ? "text-slate-400" : "text-slate-600"}`}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
