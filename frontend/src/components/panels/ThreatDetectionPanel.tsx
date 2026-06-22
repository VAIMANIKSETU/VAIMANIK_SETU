import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Threat } from "../../types/aerosentinel";
import { Panel } from "../common/Panel";

interface ThreatDetectionPanelProps {
  threats: Threat[];
}

const severityClass = {
  normal: "border-limepulse/25 text-limepulse bg-limepulse/5",
  warning: "border-amberwarn/35 text-amberwarn bg-amberwarn/10",
  critical: "border-danger/45 text-danger bg-danger/10"
};

export function ThreatDetectionPanel({ threats }: ThreatDetectionPanelProps) {
  const activeThreats = threats.filter((threat) => threat.active).length;

  return (
    <Panel
      title="Threat Analysis"
      action={<span className={`rounded-full px-3 py-1 text-xs font-semibold ${activeThreats ? "bg-danger/10 text-danger" : "bg-limepulse/10 text-limepulse"}`}>{activeThreats ? `${activeThreats} active` : "Clear"}</span>}
    >
      <div className="grid gap-3">
        {threats.map((threat) => (
          <article
            key={threat.id}
            className={`rounded-xl border p-4 transition duration-300 hover:-translate-y-0.5 ${
              threat.active ? "shadow-alert" : "opacity-76"
            } ${severityClass[threat.severity]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {threat.active ? <AlertTriangle size={17} /> : <CheckCircle2 size={17} />}
                <h3 className="text-sm font-semibold text-slate-100">{threat.type}</h3>
              </div>
              <span className="rounded-full bg-black/20 px-2 py-1 text-[10px] uppercase tracking-[0.12em]">{threat.severity}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <span>Detection: {new Date(threat.detectedAt).toLocaleTimeString()}</span>
              <span>Response: {threat.active ? "Monitoring" : "Resolved"}</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-300">{threat.recommendation}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}
