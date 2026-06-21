import L from "leaflet";
import { Circle, CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import type { AlertLog, Telemetry, Threat, TrustState } from "../../types/aerosentinel";
import { Panel } from "../common/Panel";

interface MissionMapProps {
  telemetry: Telemetry;
  history: Telemetry[];
  trust: TrustState;
  threats: Threat[];
  alerts: AlertLog[];
}

const gpsIcon = L.divIcon({
  className: "map-marker gps-marker",
  html: "<span></span>",
  iconSize: [20, 20]
});

const fusedIcon = L.divIcon({
  className: "map-marker fused-marker",
  html: "<span></span>",
  iconSize: [24, 24]
});

const threatColor = {
  normal: "#82f27e",
  warning: "#f4c542",
  critical: "#ff4d6d"
};

export function MissionMap({ telemetry, history, trust, threats, alerts }: MissionMapProps) {
  const path = history.map((point) => [point.fused.lat, point.fused.lon] as [number, number]);
  const activeThreats = threats.filter((threat) => threat.active);
  const center: [number, number] = [telemetry.fused.lat, telemetry.fused.lon];

  return (
    <Panel title="Mission Map" className="min-h-[420px]">
      <div className="h-[390px] overflow-hidden rounded-md border border-white/10">
        <MapContainer center={center} zoom={15} scrollWheelZoom className="h-full w-full" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Circle center={center} radius={260} pathOptions={{ color: "#82f27e", fillOpacity: 0.05, weight: 1 }} />
          <Circle
            center={center}
            radius={trust.severity === "critical" ? 620 : trust.severity === "warning" ? 430 : 320}
            pathOptions={{ color: threatColor[trust.severity], fillOpacity: 0.08, weight: 1.5 }}
          />
          <Polyline positions={path} pathOptions={{ color: "#19d3ff", weight: 3, opacity: 0.82 }} />
          <Marker position={[telemetry.gps.lat, telemetry.gps.lon]} icon={gpsIcon}>
            <Popup>GPS fix · drift {telemetry.gpsDriftMeters.toFixed(1)} m</Popup>
          </Marker>
          <Marker position={center} icon={fusedIcon}>
            <Popup>Fused position · error {telemetry.positionErrorMeters.toFixed(1)} m</Popup>
          </Marker>
          {activeThreats.map((threat, index) => (
            <CircleMarker
              key={threat.id}
              center={[telemetry.gps.lat + index * 0.00012, telemetry.gps.lon - index * 0.00012]}
              radius={8}
              pathOptions={{ color: threatColor[threat.severity], fillOpacity: 0.9 }}
            >
              <Popup>{threat.type}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-3">
        <div className="rounded-md bg-white/[0.03] p-2">Trail points: {history.length}</div>
        <div className="rounded-md bg-white/[0.03] p-2">Threat markers: {activeThreats.length}</div>
        <div className="rounded-md bg-white/[0.03] p-2">Recent alerts: {alerts.length}</div>
      </div>
    </Panel>
  );
}
