import { motion } from "framer-motion";
import { BrainCircuit, CheckCircle2, Crosshair, Radar, ShieldAlert, Workflow } from "lucide-react";
import type { SimulationMode, Telemetry, Threat, TrustState } from "../../types/aerosentinel";
import { Panel } from "../common/Panel";

interface AICommandCenterProps {
  telemetry: Telemetry;
  trust: TrustState;
  threats: Threat[];
  mode: SimulationMode;
}

function classifyThreat(mode: SimulationMode) {
  const labels: Record<SimulationMode, string> = {
    normal: "No active threat",
    spoofing: "GPS Spoofing",
    jamming: "GPS Jamming",
    sensorFailure: "Sensor Failure",
    mixed: "Mixed Multi-Vector Attack",
    coordinateJump: "Coordinate Jump Attack",
    gradualDrift: "Gradual Drift Attack",
    replay: "Replay Attack",
    delay: "Delay Attack",
    velocitySpoof: "Velocity Spoof Attack",
    altitudeSpoof: "Altitude Spoof Attack",
    headingManipulation: "Heading Manipulation Attack",
    adaptiveSpoof: "Adaptive Intelligent Spoofing"
  };

  return labels[mode];
}

function riskLabel(score: number) {
  if (score >= 80) return "Low";
  if (score >= 55) return "Elevated";
  if (score >= 30) return "High";
  return "Critical";
}

function sensorScores(telemetry: Telemetry, trust: TrustState) {
  const gps = Math.round(Math.max(5, Math.min(100, trust.score)));
  const imu = Math.round(Math.max(35, Math.min(99, telemetry.sensorConfidence + (100 - gps) * 0.32)));
  const barometer = Math.round(Math.max(40, Math.min(99, 96 - telemetry.positionErrorMeters * 0.85)));
  const integrity = Math.round((gps * 0.4 + imu * 0.38 + barometer * 0.22));
  return { gps, imu, barometer, integrity };
}

export function AICommandCenter({ telemetry, trust, threats, mode }: AICommandCenterProps) {
  const activeThreats = threats.filter((threat) => threat.active);
  const scores = sensorScores(telemetry, trust);
  const attackProbability = Math.round(Math.max(0, Math.min(99, 100 - trust.score + telemetry.gpsDriftMeters * 0.12)));
  const threatClass = classifyThreat(mode);
  const recommendations =
    trust.score >= 80
      ? ["Continue GPS-primary navigation", "Maintain sensor cross-checking", "Keep EKF covariance nominal"]
      : trust.score >= 45
        ? ["Reduce GPS weighting", "Increase IMU and barometer confidence", "Monitor heading and velocity mismatch"]
        : ["Reject GPS fixes", "Activate fallback navigation", "Generate incident report"];
  const reasoning = [
    telemetry.gpsDriftMeters > 55
      ? `GPS position diverged ${telemetry.gpsDriftMeters.toFixed(1)} m from fused navigation.`
      : "GPS remains spatially aligned with fused navigation.",
    telemetry.velocity > 35
      ? `Velocity jump detected at ${telemetry.velocity.toFixed(1)} m/s.`
      : "Velocity remains inside expected UAV envelope.",
    telemetry.signalQuality < 55
      ? `Signal quality degraded to ${Math.round(telemetry.signalQuality)}%.`
      : `Signal quality stable at ${Math.round(telemetry.signalQuality)}%.`
  ];
  const timeline = [
    "GPS Stable",
    telemetry.gpsDriftMeters > 30 ? "Sensor Mismatch Detected" : "Trust Score Rising",
    trust.score < 75 ? "Threat Suspected" : "Navigation Nominal",
    trust.score < 55 ? "AI Mitigation Activated" : "Fusion Monitoring",
    trust.score < 35 ? "Fallback Navigation Enabled" : "Corrected Route Maintained"
  ];

  return (
    <Panel title="AI Command Center" className="ai-command-panel">
      <div className="grid gap-4 2xl:grid-cols-[0.9fr_1.1fr_1fr]">
        <div className="rounded-lg border border-cyanline/20 bg-cyanline/[0.055] p-5">
          <div className="mb-4 flex items-center gap-3">
            <BrainCircuit className="text-cyanline" size={26} />
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">AI Co-Pilot</div>
              <div className="text-lg font-semibold text-white">Autonomous Response Online</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Navigation Trust" value={`${Math.round(trust.score)}%`} />
            <Metric label="AI Confidence" value={`${Math.round(trust.confidence)}%`} />
            <Metric label="Attack Probability" value={`${attackProbability}%`} danger={attackProbability > 45} />
            <Metric label="System Health" value={`${scores.integrity}%`} />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <StatusCard icon={ShieldAlert} label="Threat Assessment" value={activeThreats.length ? "Threat Detected" : "Clear"} tone={activeThreats.length ? "danger" : "safe"} />
          <StatusCard icon={Crosshair} label="Threat Classification" value={threatClass} tone={activeThreats.length ? "warning" : "trusted"} />
          <StatusCard icon={Radar} label="Risk Prediction" value={`${riskLabel(trust.score)} Risk`} tone={trust.score < 45 ? "danger" : trust.score < 80 ? "warning" : "safe"} />
          <StatusCard icon={Workflow} label="Response Status" value={trust.score < 60 ? "Mitigation Active" : "Monitoring"} tone={trust.score < 60 ? "trusted" : "safe"} />
        </div>
        <div className="space-y-3">
          {[
            ["GPS Trust", scores.gps, "bg-cyanline"],
            ["IMU Trust", scores.imu, "bg-limepulse"],
            ["Barometer Trust", scores.barometer, "bg-amberwarn"]
          ].map(([label, value, color]) => (
            <div key={label as string}>
              <div className="mb-1 flex justify-between text-xs text-slate-400"><span>{label}</span><span>{value}%</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div animate={{ width: `${value}%` }} className={`h-full rounded-full ${color}`} transition={{ duration: 0.55 }} />
              </div>
            </div>
          ))}
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-slate-300">
            {reasoning.map((line) => <div key={line}>- {line}</div>)}
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 text-xs uppercase tracking-[0.16em] text-slate-500">Recommended Actions</div>
          <div className="space-y-2">
            {recommendations.map((action) => (
              <div key={action} className="flex items-center gap-2 text-sm text-slate-200"><CheckCircle2 size={16} className="text-limepulse" /> {action}</div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 text-xs uppercase tracking-[0.16em] text-slate-500">Decision Timeline</div>
          <div className="grid gap-2 sm:grid-cols-5">
            {timeline.map((event, index) => (
              <div key={`${event}-${index}`} className="rounded-md border border-white/10 bg-black/20 p-2 text-xs text-slate-300">
                <span className="mb-1 block text-cyanline">0{index + 1}</span>
                {event}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function Metric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${danger ? "text-danger" : "text-white"}`}>{value}</div>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  label,
  value,
  tone
}: {
  icon: typeof ShieldAlert;
  label: string;
  value: string;
  tone: "safe" | "warning" | "danger" | "trusted";
}) {
  const toneClass = {
    safe: "text-limepulse border-limepulse/25 bg-limepulse/8",
    warning: "text-amberwarn border-amberwarn/30 bg-amberwarn/8",
    danger: "text-danger border-danger/35 bg-danger/10",
    trusted: "text-cyanline border-cyanline/30 bg-cyanline/8"
  };

  return (
    <div className={`rounded-md border p-4 ${toneClass[tone]}`}>
      <Icon size={18} />
      <div className="mt-3 text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-100">{value}</div>
    </div>
  );
}
