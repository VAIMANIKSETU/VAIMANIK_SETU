import type { TrustState } from "../../types/aerosentinel";
import { Panel } from "../common/Panel";

interface TrustEnginePanelProps {
  trust: TrustState;
}

const severityStyles = {
  normal: "text-limepulse border-limepulse/40 bg-limepulse/10",
  warning: "text-amberwarn border-amberwarn/40 bg-amberwarn/10",
  critical: "text-danger border-danger/40 bg-danger/10"
};

export function TrustEnginePanel({ trust }: TrustEnginePanelProps) {
  const score = Math.round(trust.score);
  const circumference = 2 * Math.PI * 48;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Panel title="Trust Engine">
      <div className="grid place-items-center">
        <div className="relative h-36 w-36">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="48" stroke="rgba(255,255,255,0.09)" strokeWidth="10" fill="none" />
            <circle
              cx="60"
              cy="60"
              r="48"
              stroke={trust.severity === "normal" ? "#82f27e" : trust.severity === "warning" ? "#f4c542" : "#ff4d6d"}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="text-4xl font-bold text-white">{score}</div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Trust</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className={`rounded-md border px-3 py-2 text-center text-sm font-semibold capitalize ${severityStyles[trust.severity]}`}>
          {trust.severity}
        </div>
        <div className="rounded-md border border-cyanline/25 bg-cyanline/8 px-3 py-2 text-center text-sm text-cyan-100">
          {Math.round(trust.confidence)}% confidence
        </div>
      </div>
    </Panel>
  );
}
