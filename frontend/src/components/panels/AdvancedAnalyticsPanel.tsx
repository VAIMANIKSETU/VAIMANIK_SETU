import { Activity, BarChart3, Gauge, Target } from "lucide-react";
import type { Telemetry, Threat } from "../../types/aerosentinel";
import { Panel } from "../common/Panel";

interface AdvancedAnalyticsPanelProps {
  history: Telemetry[];
  threats: Threat[];
}

export function AdvancedAnalyticsPanel({ history, threats }: AdvancedAnalyticsPanelProps) {
  const activeThreats = threats.filter((threat) => threat.active).length;
  const avgTrustProxy = history.length
    ? Math.round(history.reduce((sum, point) => sum + Math.max(0, 100 - point.gpsDriftMeters * 0.25), 0) / history.length)
    : 100;
  const falsePositiveRate = activeThreats ? 3.8 : 1.2;
  const detectionAccuracy = activeThreats ? 96.4 : 98.1;
  const heat = history.slice(-16).map((point) => Math.min(100, point.gpsDriftMeters));

  return (
    <Panel title="Advanced Analytics">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard icon={Target} label="Threat Statistics" value={`${activeThreats} active`} />
        <AnalyticsCard icon={Gauge} label="Detection Accuracy" value={`${detectionAccuracy}%`} />
        <AnalyticsCard icon={Activity} label="False Positive Rate" value={`${falsePositiveRate}%`} />
        <AnalyticsCard icon={BarChart3} label="Avg Trust History" value={`${avgTrustProxy}%`} />
      </div>
      <div className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-3 text-xs uppercase tracking-[0.16em] text-slate-500">Threat Heatmap</div>
        <div className="grid grid-cols-8 gap-2 sm:grid-cols-[repeat(16,minmax(0,1fr))]">
          {heat.map((value, index) => (
            <div
              key={`${value}-${index}`}
              className="h-9 rounded-md border border-white/10"
              style={{
                background: `rgba(${Math.round(80 + value * 1.5)}, ${Math.round(220 - value)}, ${Math.round(255 - value * 1.4)}, ${0.18 + value / 150})`
              }}
              title={`Threat heat ${Math.round(value)}%`}
            />
          ))}
        </div>
      </div>
    </Panel>
  );
}

function AnalyticsCard({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
      <Icon className="text-cyanline" size={18} />
      <div className="mt-3 text-[10px] uppercase tracking-[0.15em] text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}
