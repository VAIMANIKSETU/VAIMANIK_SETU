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
      title="Alert Center"
      action={
        <select
          className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-200 outline-none"
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
      <label className="mb-3 flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 py-2">
        <Search size={16} className="text-slate-500" />
        <input
          className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
          placeholder="Search alerts"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">No matching alerts.</div>
        ) : (
          filteredAlerts.map((alert) => (
            <article key={alert.id} className={`rounded-md border bg-white/[0.03] p-3 ${severityClass[alert.severity]}`}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-100">{alert.title}</h3>
                <span className="text-[10px] uppercase tracking-[0.12em]">{alert.severity}</span>
              </div>
              <p className="mt-1 text-xs text-slate-300">{alert.message}</p>
              <div className="mt-2 text-[11px] text-slate-500">{new Date(alert.timestamp).toLocaleString()}</div>
            </article>
          ))
        )}
      </div>
    </Panel>
  );
}
