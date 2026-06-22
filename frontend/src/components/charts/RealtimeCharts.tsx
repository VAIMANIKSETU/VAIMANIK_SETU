import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { Telemetry } from "../../types/aerosentinel";
import { Panel } from "../common/Panel";

interface RealtimeChartsProps {
  history: Telemetry[];
}

const chartColor = "#3B82F6";

function chartData(history: Telemetry[]) {
  return history.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
    trustProxy: Math.max(0, Math.round(100 - point.gpsDriftMeters * 0.25 - (100 - point.signalQuality) * 0.18)),
    signal: Math.round(point.signalQuality),
    velocity: Number(point.velocity.toFixed(1)),
    altitude: Number(point.altitude.toFixed(1)),
    heading: Math.round(point.heading),
    confidence: Math.round(point.sensorConfidence),
    distanceError: Number(point.gpsDriftMeters.toFixed(1)),
    speedError: Number(Math.max(0, Math.abs(point.velocity - 22)).toFixed(1)),
    altitudeError: Number(Math.max(0, point.positionErrorMeters * 0.42).toFixed(1)),
    headingError: Number(Math.max(0, Math.abs(Math.sin(point.heading / 57.3) * 8)).toFixed(1)),
    attack: point.gpsDriftMeters > 65 || point.signalQuality < 45 ? 1 : 0,
    eventLoad: Math.round((100 - point.signalQuality) * 0.45 + point.gpsDriftMeters * 0.08)
  }));
}

function MiniLine({ data, dataKey, color = chartColor }: { data: ReturnType<typeof chartData>; dataKey: string; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="time" hide />
        <YAxis hide domain={["auto", "auto"]} />
        <Tooltip contentStyle={{ background: "#0B1020", border: "1px solid rgba(148,163,184,.22)", borderRadius: 8 }} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.4} dot={false} animationDuration={650} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RealtimeCharts({ history }: RealtimeChartsProps) {
  const data = chartData(history);
  const cards = [
    ["Trust Timeline", "trustProxy", "#22C55E"],
    ["GPS Signal Quality", "signal", "#3B82F6"],
    ["Distance Error", "distanceError", "#EF4444"],
    ["Speed Error", "speedError", "#F59E0B"],
    ["Altitude Error", "altitudeError", "#93C5FD"],
    ["Heading Error", "headingError", "#F97316"],
    ["Attack Timeline", "attack", "#EF4444"],
    ["System Events", "eventLoad", "#22C55E"]
  ] as const;

  return (
    <Panel title="Trust Metrics">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, key, color]) => (
          <div key={label} className="rounded-xl border border-slate-700/60 bg-obsidian/35 p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
            {key === "signal" ? (
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="signalFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.45} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: "#0B1020", border: "1px solid rgba(148,163,184,.22)", borderRadius: 8 }} />
                  <Area type="monotone" dataKey={key} stroke={color} fill="url(#signalFill)" strokeWidth={2.2} animationDuration={650} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <MiniLine data={data} dataKey={key} color={color} />
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}
