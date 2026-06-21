import { Clock, Cpu, Database, Plane, Satellite, Shield, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import type { HealthState, Telemetry } from "../../types/aerosentinel";
import { MetricPill } from "../common/MetricPill";

interface TopStatusBarProps {
  health: HealthState;
  telemetry: Telemetry;
  backendOnline: boolean;
}

export function TopStatusBar({ health, telemetry, backendOnline }: TopStatusBarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const systemTone = health.system === "Online" ? "normal" : health.system === "Degraded" ? "warning" : "critical";

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-obsidian/78 px-4 py-3 backdrop-blur-xl">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold text-white">
              <Shield className="text-cyanline" size={20} />
              AeroSentinel Command
            </div>
            <div className="text-xs text-slate-400">
              {backendOnline ? "Backend linked" : "Demo telemetry active"} · UAV trust monitoring
            </div>
          </div>
          <div className="lg:hidden">
            <Plane className="text-cyanline" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
          <MetricPill label="System" value={health.system} tone={systemTone} />
          <MetricPill label="GPS" value={health.gps} tone={health.gps === "Locked" ? "normal" : "warning"} />
          <MetricPill label="IMU" value={health.imu} tone={health.imu === "Nominal" ? "normal" : "warning"} />
          <MetricPill label="Sensors" value={`${health.sensors}%`} tone={health.sensors > 72 ? "normal" : "warning"} />
          <MetricPill label="CPU" value={`${Math.round(telemetry.cpuUsage)}%`} />
          <MetricPill label="Memory" value={`${Math.round(telemetry.memoryUsage)}%`} />
          <MetricPill label="UAV" value={health.uavConnected ? "Linked" : "Lost"} tone={health.uavConnected ? "normal" : "critical"} />
          <MetricPill label="Time" value={time.toLocaleTimeString()} />
        </div>
      </div>
      <div className="mt-2 hidden items-center gap-5 text-[11px] uppercase tracking-[0.18em] text-slate-500 md:flex">
        <span className="inline-flex items-center gap-2"><Wifi size={13} /> Telemetry</span>
        <span className="inline-flex items-center gap-2"><Satellite size={13} /> GNSS</span>
        <span className="inline-flex items-center gap-2"><Cpu size={13} /> Edge Compute</span>
        <span className="inline-flex items-center gap-2"><Database size={13} /> Container {health.container}</span>
        <span className="ml-auto inline-flex items-center gap-2"><Clock size={13} /> {new Date(telemetry.timestamp).toLocaleString()}</span>
      </div>
    </header>
  );
}
