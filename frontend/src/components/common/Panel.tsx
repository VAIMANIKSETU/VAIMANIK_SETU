import type { ReactNode } from "react";

interface PanelProps {
  title?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Panel({ title, action, className = "", children }: PanelProps) {
  return (
    <section className={`glass-panel relative overflow-hidden rounded-lg p-4 transition duration-300 hover:border-slate-500/30 ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/30 to-transparent" />
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
