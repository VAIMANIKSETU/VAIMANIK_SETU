import { Compass, MapPin, Navigation } from "lucide-react";
import type { Telemetry } from "../../types/aerosentinel";
import { Panel } from "../common/Panel";

interface SensorFusionPanelProps {
  telemetry: Telemetry;
}

function formatCoord(value: number) {
  return value.toFixed(6);
}

export function SensorFusionPanel({ telemetry }: SensorFusionPanelProps) {
  const rows = [
    ["GPS coordinates", `${formatCoord(telemetry.gps.lat)}, ${formatCoord(telemetry.gps.lon)}`],
    ["Fused coordinates", `${formatCoord(telemetry.fused.lat)}, ${formatCoord(telemetry.fused.lon)}`],
    ["Altitude", `${telemetry.altitude.toFixed(1)} m`],
    ["Velocity", `${telemetry.velocity.toFixed(1)} m/s`],
    ["Heading", `${telemetry.heading.toFixed(0)} deg`],
    ["GPS drift", `${telemetry.gpsDriftMeters.toFixed(1)} m`],
    ["Position error", `${telemetry.positionErrorMeters.toFixed(1)} m`]
  ];

  return (
    <Panel title="Sensor Fusion">
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-md bg-white/[0.03] p-3 text-center">
          <MapPin className="mx-auto mb-2 text-cyanline" size={18} />
          <div className="text-lg font-semibold text-white">{telemetry.gpsDriftMeters.toFixed(0)} m</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Drift</div>
        </div>
        <div className="rounded-md bg-white/[0.03] p-3 text-center">
          <Navigation className="mx-auto mb-2 text-limepulse" size={18} />
          <div className="text-lg font-semibold text-white">{telemetry.velocity.toFixed(1)}</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">m/s</div>
        </div>
        <div className="rounded-md bg-white/[0.03] p-3 text-center">
          <Compass className="mx-auto mb-2 text-amberwarn" size={18} />
          <div className="text-lg font-semibold text-white">{telemetry.heading.toFixed(0)}</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">deg</div>
        </div>
      </div>
      <div className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 rounded-md bg-white/[0.025] px-3 py-2 text-sm">
            <span className="text-slate-400">{label}</span>
            <span className="truncate font-medium text-slate-100">{value}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
