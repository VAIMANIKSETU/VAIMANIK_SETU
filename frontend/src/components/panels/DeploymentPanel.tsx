import { Box, Cpu, HardDrive, MonitorCheck, Server } from "lucide-react";
import type { HealthState, Telemetry } from "../../types/aerosentinel";
import { Panel } from "../common/Panel";

interface DeploymentPanelProps {
  telemetry: Telemetry;
  health: HealthState;
}

export function DeploymentPanel({ telemetry, health }: DeploymentPanelProps) {
  const cards = [
    { label: "Raspberry Pi 5", value: "Compatible", icon: Cpu, sub: "ARM64 static build ready" },
    { label: "Jetson Nano", value: "Compatible", icon: MonitorCheck, sub: "GPU available for AI backend" },
    { label: "CPU Estimate", value: `${Math.round(telemetry.cpuUsage)}%`, icon: Server, sub: "Dashboard + telemetry polling" },
    { label: "Memory Estimate", value: `${Math.round(telemetry.memoryUsage)}%`, icon: HardDrive, sub: "Browser runtime footprint" },
    { label: "FPS Metrics", value: `${Math.round(telemetry.fps)} FPS`, icon: MonitorCheck, sub: "Map and chart render target" },
    { label: "Container", value: health.container, icon: Box, sub: "API service status" }
  ];

  return (
    <Panel title="Deployment">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="rounded-md border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-cyanline/10 text-cyanline">
                <Icon size={19} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
                <div className="text-lg font-semibold text-white">{value}</div>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">{sub}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
