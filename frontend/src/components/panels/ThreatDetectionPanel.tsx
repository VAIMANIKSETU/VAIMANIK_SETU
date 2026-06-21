import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Threat } from "../../types/aerosentinel";
import { Panel } from "../common/Panel";

interface ThreatDetectionPanelProps {
  threats: Threat[];
}

const severityClass = {
  normal: "border-limepulse/25 text-limepulse",
  warning: "border-amberwarn/35 text-amberwarn",
  critical: "border-danger/45 text-danger"
};

export function ThreatDetectionPanel({ threats }: ThreatDetectionPanelProps) {
  return (
    <Panel title="Threat Detection">
      <div className="grid gap-3">
        {threats.map((threat) => (
          <article
            key={threat.id}
            className={`rounded-md border bg-white/[0.03] p-3 transition ${severityClass[threat.severity]} ${
              threat.active ? "shadow-alert" : "opacity-76"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {threat.active ? <AlertTriangle size={17} /> : <CheckCircle2 size={17} />}
                <h3 className="text-sm font-semibold text-slate-100">{threat.type}</h3>
              </div>
              <span className="rounded bg-black/20 px-2 py-1 text-[10px] uppercase tracking-[0.12em]">{threat.severity}</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">Detection time: {new Date(threat.detectedAt).toLocaleTimeString()}</div>
            <p className="mt-2 text-xs leading-5 text-slate-300">{threat.recommendation}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}
