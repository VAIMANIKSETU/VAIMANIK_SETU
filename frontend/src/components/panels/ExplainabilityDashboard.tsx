import { motion } from "framer-motion";
import type { Telemetry, TrustState } from "../../types/aerosentinel";
import { Panel } from "../common/Panel";

interface ExplainabilityDashboardProps {
  telemetry: Telemetry;
  trust: TrustState;
}

export function ExplainabilityDashboard({ telemetry, trust }: ExplainabilityDashboardProps) {
  const featureImportance = [
    ["Velocity Mismatch", Math.min(100, Math.abs(telemetry.velocity - (telemetry.realStream?.velocity ?? 22)) * 6 + 12)],
    ["Heading Error", Math.min(100, Math.abs(telemetry.heading - (telemetry.realStream?.heading ?? telemetry.heading)) * 1.4 + 8)],
    ["Altitude Conflict", Math.min(100, Math.abs(telemetry.altitude - (telemetry.realStream?.altitude ?? telemetry.altitude)) * 1.8 + 10)],
    ["Sensor Drift", Math.min(100, telemetry.gpsDriftMeters * 0.55)]
  ] as const;
  const rootCause = telemetry.gpsDriftMeters > 80 ? "Route divergence from spoofed GPS stream" : trust.score < 65 ? "Multi-sensor disagreement" : "No major anomaly";
  const attribution = trust.score < 45 ? "Likely malicious spoofing" : trust.score < 75 ? "Suspicious navigation drift" : "Trusted GPS navigation";

  return (
    <Panel title="Explainable AI">
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          <Explain label="Root Cause Analysis" value={rootCause} />
          <Explain label="Attack Attribution" value={attribution} />
          <Explain label="Detection Confidence" value={`${Math.round(trust.confidence)}%`} />
          <Explain label="Sensor Disagreement" value={`${telemetry.gpsDriftMeters.toFixed(1)} m GPS/fused divergence`} />
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-4 text-xs uppercase tracking-[0.16em] text-slate-500">Feature Importance</div>
          <div className="space-y-4">
            {featureImportance.map(([label, value]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-sm text-slate-300"><span>{label}</span><span>+{Math.round(value)}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    animate={{ width: `${Math.round(value)}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-cyanline to-danger"
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function Explain({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-semibold text-slate-100">{value}</div>
    </div>
  );
}
