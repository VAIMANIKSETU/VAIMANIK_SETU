import L from "leaflet";
import { Activity, AlertTriangle, BrainCircuit, Gauge, Navigation, RadioTower, Route, ShieldAlert } from "lucide-react";
import { useEffect, useRef } from "react";
import { Circle, CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
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
  normal: "#22C55E",
  warning: "#F59E0B",
  critical: "#EF4444"
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function telemetryChartData(history: Telemetry[]) {
  return history.slice(-34).map((point) => {
    const trustScore = clamp(100 - point.gpsDriftMeters * 0.25 - (100 - point.signalQuality) * 0.18, 0, 100);

    return {
      time: new Date(point.timestamp).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
      trust: Math.round(trustScore),
      residual: Number(point.gpsDriftMeters.toFixed(1)),
      imu: Math.round(point.sensorConfidence),
      attack: point.gpsDriftMeters > 65 || point.signalQuality < 50
    };
  });
}

function statusColor(value: number) {
  if (value >= 75) return "text-limepulse";
  if (value >= 45) return "text-amberwarn";
  return "text-danger";
}

function MiniMissionChart({
  data,
  dataKey,
  color,
  domain = ["auto", "auto"]
}: {
  data: ReturnType<typeof telemetryChartData>;
  dataKey: "residual" | "imu";
  color: string;
  domain?: [number | "auto", number | "auto"];
}) {
  return (
    <ResponsiveContainer width="100%" height={68}>
      <LineChart data={data} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
        <XAxis dataKey="time" hide />
        <YAxis hide domain={domain} />
        <Tooltip contentStyle={{ background: "#0B1020", border: "1px solid rgba(148,163,184,.22)", borderRadius: 8 }} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.2} dot={false} animationDuration={550} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function MissionIntelligenceConsole({
  telemetry,
  history,
  trust,
  threats
}: {
  telemetry: Telemetry;
  history: Telemetry[];
  trust: TrustState;
  threats: Threat[];
}) {
  const data = telemetryChartData(history);
  const activeThreats = threats.filter((threat) => threat.active);
  const latestAttackMarkers = data.filter((point) => point.attack).slice(-3);
  const speedError = Math.max(0, Math.abs(telemetry.velocity - (telemetry.realStream?.velocity ?? 22)));
  const altitudeError = Math.max(0, Math.abs(telemetry.altitude - (telemetry.realStream?.altitude ?? telemetry.altitude - telemetry.positionErrorMeters * 0.42)));
  const headingError = Math.abs(Math.sin(telemetry.heading / 57.3) * 8);
  const gpsStatus = telemetry.signalQuality < 45 || telemetry.gpsDriftMeters > 85 ? "Rejected" : telemetry.signalQuality < 75 ? "Contested" : "Locked";
  const gpsConfidence = clamp(telemetry.signalQuality - telemetry.gpsDriftMeters * 0.18, 0, 100);
  const fusionConfidence = clamp((telemetry.sensorConfidence + trust.confidence) / 2, 0, 100);
  const baroConfidence = clamp(100 - altitudeError * 1.2, 0, 100);
  const explanation =
    trust.severity === "critical"
      ? "Trust score decreased due to GPS/IMU position divergence exceeding threshold."
      : trust.severity === "warning"
        ? "Trust score softened as GPS residuals moved above the nominal corridor."
        : "Trust score remains stable with GPS, IMU, and fused navigation in agreement.";
  const events = [
    { label: "GPS Locked", tone: "lime" },
    { label: "Sensor Fusion Started", tone: "cyan" },
    { label: "Spoofing Detected", tone: activeThreats.length ? "red" : "slate" },
    { label: "GPS Rejected", tone: gpsStatus === "Rejected" ? "red" : "slate" },
    { label: "IMU Navigation Activated", tone: activeThreats.length ? "amber" : "slate" },
    { label: "Mission Continued", tone: "lime" }
  ];
  const telemetryItems = [
    ["Latitude", telemetry.fused.lat.toFixed(6), "deg"],
    ["Longitude", telemetry.fused.lon.toFixed(6), "deg"],
    ["Altitude", telemetry.altitude.toFixed(1), "m"],
    ["Speed", telemetry.velocity.toFixed(1), "m/s"],
    ["Heading", telemetry.heading.toFixed(0), "deg"],
    ["GPS Status", gpsStatus, ""]
  ];
  const explainItems = [
    ["Distance error", `${telemetry.positionErrorMeters.toFixed(1)} m`],
    ["Speed error", `${speedError.toFixed(1)} m/s`],
    ["Altitude error", `${altitudeError.toFixed(1)} m`],
    ["GPS residual", `${telemetry.gpsDriftMeters.toFixed(1)} m`]
  ];
  const confidenceItems = [
    ["GPS", gpsConfidence],
    ["IMU", telemetry.sensorConfidence],
    ["Fusion", fusionConfidence],
    ["Baro", baroConfidence]
  ];

  return (
    <div className="mt-3 space-y-3">
      <div className="grid gap-3 xl:grid-cols-[minmax(210px,0.78fr)_minmax(0,1.38fr)_minmax(250px,0.92fr)]">
        <div className="rounded-lg border border-slate-700/60 bg-obsidian/45 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
              <Navigation size={14} className="text-cyanline" />
              Live Flight Telemetry
            </div>
            <span className="rounded-full border border-limepulse/30 bg-limepulse/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-limepulse">
              1s
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {telemetryItems.map(([label, value, unit]) => (
              <div key={label} className="rounded-md border border-slate-700/50 bg-panel/55 px-2.5 py-2">
                <div className="text-[9px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
                <div className={`mt-1 text-sm font-semibold ${label === "GPS Status" ? statusColor(gpsConfidence) : "text-slate-100"}`}>
                  {value} {unit && <span className="text-[10px] font-medium text-slate-500">{unit}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-700/60 bg-obsidian/45 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
              <Activity size={14} className="text-limepulse" />
              Trust Engine Timeline
            </div>
            <div className={`text-xs font-bold ${statusColor(trust.score)}`}>{Math.round(trust.score)}%</div>
          </div>
          <div className="h-[104px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="trustTimelineStroke" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="54%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#EF4444" />
                  </linearGradient>
                  <linearGradient id="trustTimelineFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "#0B1020", border: "1px solid rgba(148,163,184,.22)", borderRadius: 8 }} />
                <ReferenceLine y={75} stroke="#22C55E" strokeDasharray="4 6" strokeOpacity={0.34} />
                <ReferenceLine y={45} stroke="#F59E0B" strokeDasharray="4 6" strokeOpacity={0.34} />
                {latestAttackMarkers.map((point) => (
                  <ReferenceLine key={point.time} x={point.time} stroke="#EF4444" strokeDasharray="2 5" strokeOpacity={0.62} />
                ))}
                <Area type="monotone" dataKey="trust" stroke="url(#trustTimelineStroke)" fill="url(#trustTimelineFill)" strokeWidth={2.6} dot={false} animationDuration={550} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-md border border-slate-700/50 bg-panel/55 px-2 py-1.5">
              <div className="text-[9px] uppercase tracking-[0.16em] text-slate-500">GPS Residual Trend</div>
              <MiniMissionChart data={data} dataKey="residual" color="#EF4444" />
            </div>
            <div className="rounded-md border border-slate-700/50 bg-panel/55 px-2 py-1.5">
              <div className="text-[9px] uppercase tracking-[0.16em] text-slate-500">IMU Consistency</div>
              <MiniMissionChart data={data} dataKey="imu" color="#3B82F6" domain={[0, 100]} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-700/60 bg-obsidian/45 p-3">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
            <BrainCircuit size={14} className="text-amberwarn" />
            Explainability Panel
          </div>
          <div className="rounded-md border border-amberwarn/20 bg-amberwarn/10 p-2.5 text-xs leading-relaxed text-amber-50/90">{explanation}</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {explainItems.map(([label, value]) => (
              <div key={label} className="rounded-md border border-slate-700/50 bg-panel/55 px-2.5 py-2">
                <div className="text-[9px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
                <div className="mt-1 text-sm font-semibold text-slate-100">{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {confidenceItems.map(([label, value]) => (
              <div key={label} className="text-center">
                <div className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-slate-700/70 bg-panel/70 text-[11px] font-bold text-slate-100">
                  {Math.round(value as number)}
                </div>
                <div className="mt-1 text-[9px] uppercase tracking-[0.12em] text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-700/60 bg-obsidian/45 px-3 py-2.5">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
          <Route size={14} className="text-cyanline" />
          Event Timeline
        </div>
        <div className="grid gap-2 md:grid-cols-6">
          {events.map((event, index) => {
            const toneClass =
              event.tone === "red"
                ? "border-danger/40 bg-danger/10 text-danger"
                : event.tone === "amber"
                  ? "border-amberwarn/40 bg-amberwarn/10 text-amberwarn"
                  : event.tone === "lime"
                    ? "border-limepulse/40 bg-limepulse/10 text-limepulse"
                    : event.tone === "cyan"
                      ? "border-cyanline/40 bg-cyanline/10 text-cyanline"
                      : "border-slate-700/50 bg-panel/55 text-slate-500";

            return (
              <div key={event.label} className={`relative rounded-md border px-2.5 py-2 ${toneClass}`}>
                <div className="flex items-center gap-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-current/10 text-[10px] font-bold">{index + 1}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">{event.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 text-xs text-slate-300 sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-panel/50 p-2">
          <RadioTower size={14} className={statusColor(gpsConfidence)} />
          GPS channel {gpsStatus.toLowerCase()}
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-panel/50 p-2">
          <ShieldAlert size={14} className={activeThreats.length ? "text-danger" : "text-limepulse"} />
          {activeThreats.length || 0} active defense triggers
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-panel/50 p-2">
          <Gauge size={14} className="text-cyanline" />
          Fusion confidence {Math.round(fusionConfidence)}%
        </div>
      </div>
    </div>
  );
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
      className={`min-h-[680px] ${spoofingActive ? "spoofing-panel" : ""}`}
      action={
        <div className="hidden items-center gap-3 text-xs text-slate-300 md:flex">
          <span className="inline-flex items-center gap-1"><i className="legend-dot bg-limepulse" /> True</span>
          <span className="inline-flex items-center gap-1"><i className="legend-dot bg-danger" /> GPS</span>
          <span className="inline-flex items-center gap-1"><i className="legend-dot bg-cyanline" /> Fused</span>
        </div>
      }
    >
      {spoofingActive && (
        <div className="mb-3 flex animate-breathe items-center gap-3 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-danger shadow-alert">
          <AlertTriangle size={19} />
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.18em]">GPS Spoofing Detected</div>
            <div className="text-xs text-red-100/80">GPS path rejected. Fused navigation remains on safe route.</div>
          </div>
        </div>
      )}
      <div className="mb-3 grid gap-3 text-xs text-slate-300 md:grid-cols-3">
        <div className="rounded-lg border border-slate-700/60 bg-panel/60 p-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Protected Route</div>
          <div className="mt-1 text-sm font-semibold text-limepulse">{history.length} samples tracked</div>
        </div>
        <div className="rounded-lg border border-slate-700/60 bg-panel/60 p-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">GPS Divergence</div>
          <div className="mt-1 text-sm font-semibold text-white">{telemetry.gpsDriftMeters.toFixed(1)} m</div>
        </div>
        <div className="rounded-lg border border-slate-700/60 bg-panel/60 p-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Mission Events</div>
          <div className="mt-1 text-sm font-semibold text-white">{activeThreats.length} threats / {alerts.length} alerts</div>
        </div>
      </div>
      <div className="h-[360px] overflow-hidden rounded-xl border border-slate-700/60 shadow-2xl shadow-black/30 xl:h-[400px]">
        <MapContainer center={center} zoom={15} scrollWheelZoom className="h-full w-full" zoomControl={false}>
          <CameraTracker center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Circle center={center} radius={260} pathOptions={{ color: "#22C55E", fillOpacity: 0.05, weight: 1 }} />
          <Circle center={[center[0] + 0.0014, center[1] - 0.0013]} radius={180} pathOptions={{ color: "#F59E0B", fillOpacity: 0.08, weight: 1.2, dashArray: "6 8" }} />
          <Circle
            center={center}
            radius={trust.severity === "critical" ? 620 : trust.severity === "warning" ? 430 : 320}
            pathOptions={{ color: threatColor[trust.severity], fillOpacity: 0.08, weight: 1.5 }}
          />
          <Polyline positions={truePath} pathOptions={{ className: "path-glow path-true", color: "#22C55E", weight: 4, opacity: 0.9 }} />
          <Polyline positions={gpsPath} pathOptions={{ className: "path-glow path-gps", color: "#EF4444", weight: 4, opacity: 0.86 }} />
          <Polyline positions={fusedPath} pathOptions={{ className: "path-glow path-fused", color: "#3B82F6", weight: 5, opacity: 0.92 }} />
          <Polyline positions={[center, ...predictedFuturePath]} pathOptions={{ color: "#93C5FD", weight: 3, opacity: 0.75, dashArray: "4 10" }} />
          {spoofingActive && (
            <CircleMarker center={attackOrigin} radius={12} pathOptions={{ color: "#EF4444", fillOpacity: 0.35, weight: 2 }}>
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
      <MissionIntelligenceConsole telemetry={telemetry} history={history} trust={trust} threats={threats} />
    </Panel>
  );
}
