import { motion } from "framer-motion";
import type { TrustState } from "../../types/aerosentinel";
import type { Threat } from "../../types/aerosentinel";
import { Panel } from "../common/Panel";

interface TrustEnginePanelProps {
  trust: TrustState;
  threats: Threat[];
}

const severityStyles = {
  normal: "text-limepulse border-limepulse/40 bg-limepulse/10",
  warning: "text-amberwarn border-amberwarn/40 bg-amberwarn/10",
  critical: "text-danger border-danger/40 bg-danger/10"
} as const;

function gaugeColor(score: number) {
  if (score >= 90) return "#82f27e";
  if (score >= 60) return "#f4c542";
  if (score >= 30) return "#ff9f43";
  return "#ff4d6d";
}

export function TrustEnginePanel({ trust, threats }: TrustEnginePanelProps) {
  const score = Math.round(trust.score);
  const circumference = 2 * Math.PI * 48;
  const offset = circumference - (score / 100) * circumference;
  const attackActive = threats.some((threat) => threat.active);
  const gpsTrusted = score >= 60 && !threats.some((threat) => threat.type === "GPS Spoofing" && threat.active);

  return (
    <Panel title="Trust Engine">
      <div className="grid place-items-center">
        <div className="relative h-36 w-36">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="48" stroke="rgba(255,255,255,0.09)" strokeWidth="10" fill="none" />
            <motion.circle
              cx="60"
              cy="60"
              r="48"
              stroke={gaugeColor(score)}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: offset }}
              initial={false}
              transition={{ duration: 0.65, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <motion.div
                key={score}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="text-4xl font-bold text-white"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.28 }}
              >
                {score}
              </motion.div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Trust</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className={`rounded-md border px-3 py-2 text-center text-sm font-semibold capitalize ${severityStyles[trust.severity]}`}>
          Severity: {trust.severity}
        </div>
        <div className="rounded-md border border-cyanline/25 bg-cyanline/8 px-3 py-2 text-center text-sm text-cyan-100">
          {Math.round(trust.confidence)}% confidence
        </div>
        <div className={`rounded-md border px-3 py-2 text-center text-sm font-semibold ${gpsTrusted ? severityStyles.normal : severityStyles.critical}`}>
          GPS {gpsTrusted ? "Trusted" : "Rejected"}
        </div>
        <div className={`rounded-md border px-3 py-2 text-center text-sm font-semibold ${attackActive ? severityStyles.critical : severityStyles.normal}`}>
          Attack {attackActive ? "Active" : "Clear"}
        </div>
      </div>
    </Panel>
  );
}
