import { AnimatePresence, motion } from "framer-motion";
import { Bell, BrainCircuit, ChevronLeft, ChevronRight, Cpu, Gauge, HeartPulse, Radar, Route, ShieldCheck } from "lucide-react";

const navItems = [
  { label: "AI Command", icon: BrainCircuit, href: "#ai-command" },
  { label: "Mission Overview", icon: Radar, href: "#mission-overview" },
  { label: "Trust Engine", icon: Gauge, href: "#trust-engine" },
  { label: "Sensor Status", icon: Route, href: "#sensor-status" },
  { label: "Explainability", icon: ShieldCheck, href: "#explainability" },
  { label: "Alerts", icon: Bell },
  { label: "System Health", icon: Cpu, href: "#system-health" }
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  trustScore: number;
  activeThreats: number;
}

export function Sidebar({ collapsed, setCollapsed, trustScore, activeThreats }: SidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 320 }}
      className="fixed inset-y-0 left-0 z-40 hidden border-r border-white/10 bg-[#050816]/92 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:flex"
      initial={false}
      transition={{ duration: 0.26, ease: "easeInOut" }}
    >
      <div className="flex h-full w-full flex-col overflow-hidden px-3 py-4">
        <div className={`mb-6 flex gap-3 ${collapsed ? "flex-col items-center" : "items-center justify-between"}`}>
          <a href="#mission-overview" className={`flex min-w-0 items-center gap-3 rounded-md px-1 py-2 ${collapsed ? "justify-center" : "flex-1"}`}>
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-cyanline/35 bg-cyanline/10 text-cyanline shadow-glow">
              <ShieldCheck size={22} />
            </div>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="min-w-0 max-w-[210px]"
                  exit={{ opacity: 0, x: -8 }}
                  initial={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="truncate text-sm font-bold tracking-[0.22em] text-white">AEROSENTINEL</div>
                  <div className="truncate text-xs text-slate-400">Trust-Aware Mission Control</div>
                </motion.div>
              )}
            </AnimatePresence>
          </a>
          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-cyanline/40 hover:text-white"
            type="button"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
        </div>
        <nav className="space-y-1">
          {navItems.map(({ label, icon: Icon, href = `#${label.toLowerCase().replace(/\s+/g, "-")}` }, index) => (
            <a
              href={href}
              key={label}
              title={collapsed ? label : undefined}
              className={`group flex h-12 items-center gap-3 rounded-md px-3 text-sm text-slate-300 transition hover:bg-white/[0.07] hover:text-white ${
                index === 0 ? "bg-cyanline/10 text-cyan-100" : ""
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    animate={{ opacity: 1, x: 0 }}
                    className="truncate"
                    exit={{ opacity: 0, x: -8 }}
                    initial={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.16 }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </a>
          ))}
        </nav>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-auto space-y-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 text-xs text-slate-400"
              exit={{ opacity: 0, y: 8 }}
              initial={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-slate-300"><HeartPulse size={14} /> Mission State</span>
                <span className="text-cyanline">{Math.round(trustScore)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  animate={{ width: `${Math.max(6, trustScore)}%` }}
                  className="h-full rounded-full bg-cyanline"
                  transition={{ duration: 0.45 }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Active threats</span>
                <span className={activeThreats > 0 ? "text-danger" : "text-limepulse"}>{activeThreats}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
