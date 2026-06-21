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

const chartColor = "#19d3ff";

function chartData(history: Telemetry[]) {
  return history.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
    trustProxy: Math.round(100 - point.gpsDriftMeters * 0.25 - (100 - point.signalQuality) * 0.18),
    signal: Math.round(point.signalQuality),
    velocity: Number(point.velocity.toFixed(1)),
    altitude: Number(point.altitude.toFixed(1)),
    heading: Math.round(point.heading),
    confidence: Math.round(point.sensorConfidence)
  }));
}

function MiniLine({ data, dataKey, color = chartColor }: { data: ReturnType<typeof chartData>; dataKey: string; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="time" hide />
        <YAxis hide domain={["auto", "auto"]} />
        <Tooltip contentStyle={{ background: "#07101f", border: "1px solid rgba(255,255,255,.12)", borderRadius: 6 }} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.4} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RealtimeCharts({ history }: RealtimeChartsProps) {
  const data = chartData(history);
  const cards = [
    ["Trust Score vs Time", "trustProxy", "#82f27e"],
    ["GPS Signal Quality", "signal", "#19d3ff"],
    ["Velocity", "velocity", "#f4c542"],
    ["Altitude", "altitude", "#9dd7ff"],
    ["Heading", "heading", "#ff9f6e"],
    ["Sensor Confidence", "confidence", "#c5f56e"]
  ] as const;

  return (
    <Panel title="Real-Time Charts">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, key, color]) => (
          <div key={label} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
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
                  <Tooltip contentStyle={{ background: "#07101f", border: "1px solid rgba(255,255,255,.12)", borderRadius: 6 }} />
                  <Area type="monotone" dataKey={key} stroke={color} fill="url(#signalFill)" strokeWidth={2.2} isAnimationActive={false} />
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
