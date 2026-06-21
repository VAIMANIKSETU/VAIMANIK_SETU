import type { ReactNode } from "react";

interface MetricPillProps {
  label: string;
  value: ReactNode;
  tone?: "normal" | "warning" | "critical" | "neutral";
}

const toneClass = {
  normal: "border-limepulse/35 text-limepulse",
  warning: "border-amberwarn/45 text-amberwarn",
  critical: "border-danger/50 text-danger",
  neutral: "border-cyanline/35 text-cyan-100"
};

export function MetricPill({ label, value, tone = "neutral" }: MetricPillProps) {
  return (
    <div className={`rounded-md border bg-white/[0.03] px-3 py-2 ${toneClass[tone]}`}>
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold">{value}</div>
    </div>
  );
}
