import { Activity, Bell, Cpu, Gauge, Map, Radar, ShieldCheck } from "lucide-react";

const navItems = [
  { label: "Operations", icon: Radar },
  { label: "Mission Map", icon: Map },
  { label: "Trust Engine", icon: Gauge },
  { label: "Threats", icon: ShieldCheck },
  { label: "Alerts", icon: Bell },
  { label: "Deployment", icon: Cpu }
];

export function Sidebar() {
  return (
    <aside className="hidden border-r border-white/10 bg-black/20 backdrop-blur-xl lg:flex lg:w-20 xl:w-64 xl:flex-col">
      <div className="flex h-full w-full flex-col px-3 py-5">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center rounded-md border border-cyanline/40 bg-cyanline/10 text-cyanline">
            <Radar size={22} />
          </div>
          <div className="hidden xl:block">
            <div className="text-sm font-bold tracking-[0.22em] text-white">AEROSENTINEL</div>
            <div className="text-xs text-slate-400">Navigation Trust OS</div>
          </div>
        </div>
        <nav className="space-y-2">
          {navItems.map(({ label, icon: Icon }, index) => (
            <a
              href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
              key={label}
              className={`group flex items-center gap-3 rounded-md px-3 py-3 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white ${
                index === 0 ? "bg-cyanline/10 text-cyan-100" : ""
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="hidden xl:inline">{label}</span>
            </a>
          ))}
        </nav>
        <div className="mt-auto hidden rounded-md border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-400 xl:block">
          Edge profile: Pi 5 / Jetson Nano optimized for low refresh overhead and API polling.
        </div>
      </div>
    </aside>
  );
}
