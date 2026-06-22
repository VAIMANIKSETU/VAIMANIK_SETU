import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { AlertLog, Severity } from "../../types/aerosentinel";
import { Panel } from "../common/Panel";

interface AlertCenterProps {
  alerts: AlertLog[];
}

const severityClass: Record<Severity, string> = {
  normal: "border-limepulse/35 text-limepulse",
  warning: "border-amberwarn/40 text-amberwarn",
  critical: "border-danger/45 text-danger"
};

export function AlertCenter({ alerts }: AlertCenterProps) {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<Severity | "all">("all");

  const filteredAlerts = useMemo(
    () =>
      alerts.filter((alert) => {
        const matchesSeverity = severity === "all" || alert.severity === severity;
        const searchable = `${alert.title} ${alert.message}`.toLowerCase();
        return matchesSeverity && searchable.includes(query.toLowerCase());
      }),
    [alerts, query, severity]
  );

  return (
    <Panel
      title="Attack Timeline"
      action={
        <select
          className="rounded-lg border border-slate-700/70 bg-panel px-2 py-1 text-xs text-slate-200 outline-none"
          value={severity}
          onChange={(event) => setSeverity(event.target.value as Severity | "all")}
        >
          <option value="all">All</option>
          <option value="normal">Normal</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      }
    >
      <label className="mb-4 flex items-center gap-2 rounded-lg border border-slate-700/70 bg-obsidian/40 px-3 py-2">
        <Search size={16} className="text-slate-500" />
        <input
          className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
          placeholder="Search alerts"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className="max-h-[420px] space-y-0 overflow-auto pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="rounded-lg border border-slate-700/60 bg-white/[0.03] p-4 text-sm text-slate-400">No matching alerts.</div>
        ) : (
          filteredAlerts.map((alert, index) => (
            <article key={alert.id} className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-3 pb-4">
              <div className="relative flex justify-center">
                <span className={`mt-2 h-3 w-3 rounded-full border ${severityClass[alert.severity]} bg-obsidian`} />
                {index < filteredAlerts.length - 1 && <span className="absolute top-6 h-full w-px bg-slate-700/70" />}
              </div>
              <div className={`rounded-xl border bg-white/[0.03] p-4 ${severityClass[alert.severity]}`}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-100">{alert.title}</h3>
                  <span className="rounded-full bg-black/20 px-2 py-1 text-[10px] uppercase tracking-[0.12em]">{alert.severity}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-300">{alert.message}</p>
                <div className="mt-3 text-[11px] uppercase tracking-[0.12em] text-slate-500">{new Date(alert.timestamp).toLocaleString()}</div>
              </div>
            </article>
          ))
        )}
      </div>
    </Panel>
  );
}
