import L from "leaflet";
import { AlertTriangle } from "lucide-react";
import { useEffect, useRef } from "react";
import { Circle, CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import type { AlertLog, Telemetry, Threat, TrustState } from "../../types/aerosentinel";
import { Panel } from "../common/Panel";

interface MissionMapProps {
  telemetry: Telemetry;
  history: Telemetry[];
  trust: TrustState;
  threats: Threat[];
  alerts: AlertLog[];
}

const threatColor = {
  normal: "#82f27e",
  warning: "#f4c542",
  critical: "#ff4d6d"
};

function pointFor(telemetry: Telemetry, key: "gps" | "fused" | "truePosition"): [number, number] {
  const point = key === "truePosition" ? telemetry.truePosition ?? telemetry.fused : telemetry[key];
  return [point.lat, point.lon];
}

function aircraftIcon(heading: number) {
  return L.divIcon({
    className: "aircraft-marker",
    html: `<div class="aircraft-shell" style="transform: rotate(${heading}deg);"><span></span></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
}

function dotIcon(className: string) {
  return L.divIcon({
    className: `map-marker ${className}`,
    html: "<span></span>",
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
}

function CameraTracker({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    const point = map.latLngToContainerPoint(center);
    const size = map.getSize();
    const paddingX = size.x * 0.28;
    const paddingY = size.y * 0.28;
    const outsideSafeFrame = point.x < paddingX || point.x > size.x - paddingX || point.y < paddingY || point.y > size.y - paddingY;

    if (outsideSafeFrame) {
      map.panTo(center, { animate: true, duration: 0.75, easeLinearity: 0.25 });
    }
  }, [center, map]);

  return null;
}

function SmoothAircraftMarker({ position, heading }: { position: [number, number]; heading: number }) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const positionRef = useRef<[number, number]>(position);
  const frameRef = useRef<number>();

  useEffect(() => {
    const marker = L.marker(position, { icon: aircraftIcon(heading) }).addTo(map);
    marker.bindPopup(`Aircraft fused position - heading ${heading.toFixed(0)} deg`);
    markerRef.current = marker;

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      marker.remove();
    };
  }, [map]);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const activeMarker = marker;
    const start = positionRef.current;
    const end = position;
    const startedAt = performance.now();
    const duration = 1050;
    activeMarker.setIcon(aircraftIcon(heading));

    function animate(now: number) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const lat = start[0] + (end[0] - start[0]) * eased;
      const lon = start[1] + (end[1] - start[1]) * eased;
      activeMarker.setLatLng([lat, lon]);

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(animate);
      } else {
        positionRef.current = end;
      }
    }

    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(animate);
  }, [heading, position]);

  return null;
}

export function MissionMap({ telemetry, history, trust, threats, alerts }: MissionMapProps) {
  const truePath = history.map((point) => pointFor(point, "truePosition"));
  const gpsPath = history.map((point) => pointFor(point, "gps"));
  const fusedPath = history.map((point) => pointFor(point, "fused"));
  const activeThreats = threats.filter((threat) => threat.active);
  const center = pointFor(telemetry, "fused");
  const spoofingActive = activeThreats.some((threat) => threat.type === "GPS Spoofing");
  const attackOrigin = gpsPath[Math.max(0, gpsPath.length - 12)] ?? pointFor(telemetry, "gps");
  const headingRadians = (telemetry.heading * Math.PI) / 180;
  const predictedFuturePath: [number, number][] = Array.from({ length: 5 }, (_, index) => {
    const distance = (index + 1) * 0.00022;
    return [center[0] + Math.cos(headingRadians) * distance, center[1] + Math.sin(headingRadians) * distance];
  });

  return (
    <Panel
      title="Mission Map"
      className={`min-h-[560px] ${spoofingActive ? "spoofing-panel" : ""}`}
      action={
        <div className="hidden items-center gap-3 text-xs text-slate-300 md:flex">
          <span className="inline-flex items-center gap-1"><i className="legend-dot bg-limepulse" /> True</span>
          <span className="inline-flex items-center gap-1"><i className="legend-dot bg-danger" /> GPS</span>
          <span className="inline-flex items-center gap-1"><i className="legend-dot bg-cyanline" /> Fused</span>
        </div>
      }
    >
      {spoofingActive && (
        <div className="mb-3 flex animate-breathe items-center gap-3 rounded-md border border-danger/40 bg-danger/12 px-4 py-3 text-danger shadow-alert">
          <AlertTriangle size={19} />
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.18em]">GPS Spoofing Detected</div>
            <div className="text-xs text-red-100/80">GPS path rejected. Fused navigation remains on safe route.</div>
          </div>
        </div>
      )}
      <div className="h-[500px] overflow-hidden rounded-md border border-white/10 shadow-2xl shadow-black/30">
        <MapContainer center={center} zoom={15} scrollWheelZoom className="h-full w-full" zoomControl={false}>
          <CameraTracker center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Circle center={center} radius={260} pathOptions={{ color: "#82f27e", fillOpacity: 0.05, weight: 1 }} />
          <Circle center={[center[0] + 0.0014, center[1] - 0.0013]} radius={180} pathOptions={{ color: "#f4c542", fillOpacity: 0.08, weight: 1.2, dashArray: "6 8" }} />
          <Circle
            center={center}
            radius={trust.severity === "critical" ? 620 : trust.severity === "warning" ? 430 : 320}
            pathOptions={{ color: threatColor[trust.severity], fillOpacity: 0.08, weight: 1.5 }}
          />
          <Polyline positions={truePath} pathOptions={{ className: "path-glow path-true", color: "#82f27e", weight: 4, opacity: 0.9 }} />
          <Polyline positions={gpsPath} pathOptions={{ className: "path-glow path-gps", color: "#ff4d6d", weight: 4, opacity: 0.88 }} />
          <Polyline positions={fusedPath} pathOptions={{ className: "path-glow path-fused", color: "#19d3ff", weight: 5, opacity: 0.92 }} />
          <Polyline positions={[center, ...predictedFuturePath]} pathOptions={{ color: "#9dd7ff", weight: 3, opacity: 0.75, dashArray: "4 10" }} />
          {spoofingActive && (
            <CircleMarker center={attackOrigin} radius={12} pathOptions={{ color: "#ff4d6d", fillOpacity: 0.35, weight: 2 }}>
              <Popup>Estimated attack origin point</Popup>
            </CircleMarker>
          )}
          <Marker position={pointFor(telemetry, "gps")} icon={dotIcon("gps-marker")}>
            <Popup>GPS fix - drift {telemetry.gpsDriftMeters.toFixed(1)} m</Popup>
          </Marker>
          <SmoothAircraftMarker position={center} heading={telemetry.heading} />
          <Marker position={pointFor(telemetry, "fused")} icon={dotIcon("fused-marker")}>
            <Popup>Fused position - error {telemetry.positionErrorMeters.toFixed(1)} m</Popup>
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
        <div className="rounded-md bg-white/[0.03] p-2">True path tracking: {history.length} samples</div>
        <div className="rounded-md bg-white/[0.03] p-2">GPS divergence: {telemetry.gpsDriftMeters.toFixed(1)} m</div>
        <div className="rounded-md bg-white/[0.03] p-2">Events: {activeThreats.length} threats / {alerts.length} alerts</div>
      </div>
    </Panel>
  );
}
