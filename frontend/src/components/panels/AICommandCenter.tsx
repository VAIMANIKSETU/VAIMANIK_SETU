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
    <Panel title="AI Copilot" className="ai-command-panel">
      <div className="grid gap-5 2xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-cyanline/20 bg-cyanline/[0.055] p-5">
          <div className="mb-4 flex items-center gap-3">
            <BrainCircuit className="text-cyanline" size={26} />
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Current Assessment</div>
              <div className="text-2xl font-semibold text-white">{activeThreats.length ? "Threat Under Analysis" : "Navigation Secure"}</div>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-[0.72fr_1fr]">
            <div className="rounded-xl border border-slate-700/60 bg-obsidian/35 p-4">
              <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Confidence</div>
              <div className="mt-2 text-5xl font-semibold text-white">{Math.round(trust.confidence)}%</div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div animate={{ width: `${Math.round(trust.confidence)}%` }} className="h-full rounded-full bg-cyanline" transition={{ duration: 0.55 }} />
              </div>
              <div className={`mt-4 rounded-lg border px-3 py-2 text-sm font-semibold ${trust.score < 45 ? "border-danger/35 bg-danger/10 text-danger" : trust.score < 80 ? "border-amberwarn/35 bg-amberwarn/10 text-amberwarn" : "border-limepulse/30 bg-limepulse/10 text-limepulse"}`}>
                {riskLabel(trust.score)} Risk
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Reasoning</div>
              {reasoning.map((line) => (
                <div key={line} className="flex items-start gap-3 rounded-lg border border-slate-700/60 bg-obsidian/35 p-3 text-sm leading-6 text-slate-200">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-limepulse" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatusCard icon={ShieldAlert} label="Threat Status" value={activeThreats.length ? "Threat Detected" : "Clear"} tone={activeThreats.length ? "danger" : "safe"} />
            <StatusCard icon={Crosshair} label="Classification" value={threatClass} tone={activeThreats.length ? "warning" : "trusted"} />
            <StatusCard icon={Radar} label="Attack Probability" value={`${attackProbability}%`} tone={attackProbability > 45 ? "danger" : attackProbability > 20 ? "warning" : "safe"} />
            <StatusCard icon={Workflow} label="Response Status" value={trust.score < 60 ? "Mitigation Active" : "Monitoring"} tone={trust.score < 60 ? "trusted" : "safe"} />
          </div>
          <div className="rounded-xl border border-slate-700/60 bg-obsidian/35 p-4">
            <div className="mb-3 text-xs uppercase tracking-[0.16em] text-slate-500">Sensor Trust Feed</div>
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
              <div className="rounded-lg border border-slate-700/60 bg-white/[0.03] p-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">System Integrity</div>
                <div className="mt-1 text-2xl font-semibold text-white">{scores.integrity}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-xl border border-slate-700/60 bg-obsidian/35 p-4">
          <div className="mb-3 text-xs uppercase tracking-[0.16em] text-slate-500">Recommended Actions</div>
          <div className="space-y-2">
            {recommendations.map((action) => (
              <div key={action} className="flex items-center gap-2 text-sm text-slate-200"><CheckCircle2 size={16} className="text-limepulse" /> {action}</div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-700/60 bg-obsidian/35 p-4">
          <div className="mb-4 text-xs uppercase tracking-[0.16em] text-slate-500">Mission Decision Timeline</div>
          <div className="grid gap-3 sm:grid-cols-5">
            {timeline.map((event, index) => (
              <div key={`${event}-${index}`} className="relative rounded-lg border border-slate-700/60 bg-black/20 p-3 text-xs leading-5 text-slate-300">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-cyanline">T+0{index + 1}</span>
                {event}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
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
    safe: "text-limepulse border-limepulse/25 bg-limepulse/10",
    warning: "text-amberwarn border-amberwarn/30 bg-amberwarn/10",
    danger: "text-danger border-danger/35 bg-danger/10",
    trusted: "text-cyanline border-cyanline/30 bg-cyanline/10"
  };

  return (
    <div className={`rounded-xl border p-4 transition duration-300 hover:-translate-y-0.5 ${toneClass[tone]}`}>
      <Icon size={18} />
      <div className="mt-3 text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-100">{value}</div>
    </div>
  );
}
