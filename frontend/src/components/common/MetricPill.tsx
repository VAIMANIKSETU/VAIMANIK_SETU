import type { ReactNode } from "react";

interface MetricPillProps {
  label: string;
  value: ReactNode;
  tone?: "normal" | "warning" | "critical" | "neutral";
}

const toneClass = {
  normal: "border-limepulse/30 text-limepulse",
  warning: "border-amberwarn/35 text-amberwarn",
  critical: "border-danger/40 text-danger",
  neutral: "border-slate-600/50 text-slate-100"
};

export function MetricPill({ label, value, tone = "neutral" }: MetricPillProps) {
  return (
    <div className={`rounded-lg border bg-panel/60 px-3 py-2 shadow-sm shadow-black/10 ${toneClass[tone]}`}>
      <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold">{value}</div>
    </div>
  );
}
