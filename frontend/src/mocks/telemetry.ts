import type {
  AlertLog,
  DashboardSnapshot,
  HealthState,
  Severity,
  SimulationMode,
  SimulationSettings,
  Telemetry,
  Threat,
  TrustState
} from "../types/aerosentinel";

const origin = { lat: 12.97171, lon: 77.59442 };
const historyLimit = 80;

let tick = 0;
let history: Telemetry[] = [];
let alerts: AlertLog[] = [];

const threatRecommendations: Record<Threat["type"], string> = {
  "GPS Spoofing": "Cross-check fused state, reject GPS fixes, hold mission corridor.",
  "GPS Jamming": "Switch to inertial dead reckoning and reduce speed envelope.",
  "Sensor Failure": "Recalibrate IMU and isolate degraded sensor stream.",
  "Signal Anomalies": "Increase receiver sampling and compare constellation geometry.",
  "Navigation Drift": "Command hover or loiter until trust score recovers."
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function severityFromScore(score: number): Severity {
  if (score >= 75) return "normal";
  if (score >= 45) return "warning";
  return "critical";
}

function modeProfile(mode: SimulationMode) {
  switch (mode) {
    case "coordinateJump":
      return { trustPenalty: 42, drift: 150, signal: 76, confidence: 62, velocityJump: 5 };
    case "gradualDrift":
      return { trustPenalty: 36, drift: 115, signal: 82, confidence: 68, velocityJump: 3 };
    case "replay":
      return { trustPenalty: 31, drift: 72, signal: 88, confidence: 61, velocityJump: 0 };
    case "delay":
      return { trustPenalty: 29, drift: 68, signal: 84, confidence: 63, velocityJump: 2 };
    case "velocitySpoof":
      return { trustPenalty: 33, drift: 44, signal: 85, confidence: 59, velocityJump: 16 };
    case "altitudeSpoof":
      return { trustPenalty: 30, drift: 35, signal: 86, confidence: 60, velocityJump: 1 };
    case "headingManipulation":
      return { trustPenalty: 37, drift: 84, signal: 81, confidence: 58, velocityJump: 4 };
    case "adaptiveSpoof":
      return { trustPenalty: 48, drift: 128, signal: 90, confidence: 52, velocityJump: 6 };
    case "spoofing":
      return { trustPenalty: 34, drift: 95, signal: 72, confidence: 65, velocityJump: 8 };
    case "jamming":
      return { trustPenalty: 28, drift: 38, signal: 30, confidence: 58, velocityJump: 2 };
    case "sensorFailure":
      return { trustPenalty: 24, drift: 24, signal: 82, confidence: 43, velocityJump: 4 };
    case "mixed":
      return { trustPenalty: 52, drift: 145, signal: 28, confidence: 37, velocityJump: 11 };
    default:
      return { trustPenalty: 0, drift: 8, signal: 93, confidence: 92, velocityJump: 0 };
  }
}

function makeThreats(mode: SimulationMode, now: string, severity: Severity): Threat[] {
  const base: Threat[] = [
    "GPS Spoofing",
    "GPS Jamming",
    "Sensor Failure",
    "Signal Anomalies",
    "Navigation Drift"
  ].map((type) => ({
    id: type.toLowerCase().replace(/\s+/g, "-"),
    type: type as Threat["type"],
    detectedAt: now,
    severity: "normal" as Severity,
    active: false,
    recommendation: "Continue monitoring baseline telemetry."
  }));

  const activeTypes: Threat["type"][] =
    mode === "spoofing"
      ? ["GPS Spoofing", "Navigation Drift", "Signal Anomalies"]
      : ["coordinateJump", "gradualDrift", "replay", "delay", "velocitySpoof", "altitudeSpoof", "headingManipulation", "adaptiveSpoof"].includes(mode)
        ? ["GPS Spoofing", "Signal Anomalies", "Navigation Drift"]
      : mode === "jamming"
        ? ["GPS Jamming", "Signal Anomalies"]
        : mode === "sensorFailure"
          ? ["Sensor Failure", "Navigation Drift"]
          : mode === "mixed"
            ? ["GPS Spoofing", "GPS Jamming", "Sensor Failure", "Navigation Drift"]
            : [];

  return base.map((threat) =>
    activeTypes.includes(threat.type)
      ? {
          ...threat,
          active: true,
          severity,
          recommendation: threatRecommendations[threat.type]
        }
      : threat
  );
}

function createAlerts(mode: SimulationMode, trust: TrustState, telemetry: Telemetry) {
  if (mode === "normal" && tick % 9 !== 0) return;
  if (tick % 4 !== 0) return;

  const title =
    mode === "normal"
      ? "Navigation trust stable"
      : mode === "spoofing"
        ? "Possible spoofing vector"
        : mode === "jamming"
          ? "Signal degradation detected"
          : mode === "sensorFailure"
            ? "Sensor confidence loss"
            : "Compound navigation attack";

  alerts = [
    {
      id: `${Date.now()}-${tick}`,
      timestamp: telemetry.timestamp,
      severity: trust.severity,
      title,
      message: `Trust ${Math.round(trust.score)}%, drift ${telemetry.gpsDriftMeters.toFixed(1)} m, signal ${Math.round(
        telemetry.signalQuality
      )}%.`
    },
    ...alerts
  ].slice(0, 40);
}

function createInsights(mode: SimulationMode, trust: TrustState, telemetry: Telemetry): string[] {
  const insights = [
    `Trust engine confidence is ${Math.round(trust.confidence)}% with ${telemetry.positionErrorMeters.toFixed(
      1
    )} m fused error.`,
    `Heading variance remains at ${Math.abs(Math.sin(tick / 6) * 4).toFixed(1)} degrees over the current window.`
  ];

  if (mode === "spoofing" || mode === "mixed") {
    insights.unshift("Possible spoofing attempt detected from GPS and fused-state divergence.");
  }
  if (mode === "jamming" || mode === "mixed") {
    insights.unshift("Signal quality collapse indicates possible wideband GPS interference.");
  }
  if (mode === "sensorFailure") {
    insights.unshift("Trust dropped due to reduced inertial sensor confidence.");
  }
  if (telemetry.velocity > 34) {
    insights.unshift("Trust dropped due to abnormal velocity jump.");
  }

  return insights.slice(0, 4);
}

export function resetDemoTelemetry() {
  tick = 0;
  history = [];
  alerts = [];
}

function createStream(lat: number, lon: number, velocity: number, heading: number, altitude: number, seed: number) {
  return {
    gps: { lat, lon },
    velocity,
    heading,
    altitude,
    imu: {
      accelX: Number((Math.sin(seed / 4) * 0.18).toFixed(3)),
      accelY: Number((Math.cos(seed / 5) * 0.16).toFixed(3)),
      accelZ: Number((9.78 + Math.sin(seed / 9) * 0.05).toFixed(3)),
      gyroX: Number((Math.sin(seed / 7) * 0.012).toFixed(4)),
      gyroY: Number((Math.cos(seed / 6) * 0.014).toFixed(4)),
      gyroZ: Number((heading / 3600 + Math.sin(seed / 8) * 0.01).toFixed(4))
    },
    temperature: Number((34 + Math.sin(seed / 14) * 2.8).toFixed(1)),
    barometer: Number((1013.25 - altitude * 0.12 + Math.cos(seed / 11) * 1.4).toFixed(1))
  };
}

function attackLabel(mode: SimulationMode) {
  return mode
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (value) => value.toUpperCase())
    .replace("Gps", "GPS");
}

export function nextDemoSnapshot(mode: SimulationMode, settings?: SimulationSettings): DashboardSnapshot {
  tick += 1;
  const now = new Date().toISOString();
  const profile = modeProfile(mode);
  const severityMultiplier = settings?.active ? clamp(settings.severity / 50, 0.4, 2) : 1;
  const wave = Math.sin(tick / 8);
  const driftMeters = clamp((profile.drift + Math.abs(Math.sin(tick / 5) * profile.drift * 0.35)) * severityMultiplier, 4, 260);
  const routeLat = origin.lat + tick * 0.00009;
  const routeLon = origin.lon + Math.sin(tick / 18) * 0.00115;
  const gpsOffset = driftMeters / 111_320;
  const trueVelocity = clamp(21 + Math.sin(tick / 7) * 4, 4, 42);
  const trueAltitude = clamp(128 + Math.sin(tick / 10) * 18, 80, 210);
  const trueHeading = (86 + tick * 3.2 + Math.sin(tick / 5) * 7) % 360;
  const spoofedVelocity = clamp(trueVelocity + profile.velocityJump * severityMultiplier, 4, 58);
  const spoofedAltitude = clamp(trueAltitude + (mode === "altitudeSpoof" || mode === "mixed" ? 44 * severityMultiplier : 0), 55, 280);
  const spoofedHeading = (trueHeading + (mode === "headingManipulation" || mode === "mixed" ? 42 * severityMultiplier : 0)) % 360;

  const telemetry: Telemetry = {
    timestamp: now,
    truePosition: {
      lat: routeLat,
      lon: routeLon
    },
    realStream: createStream(routeLat, routeLon, trueVelocity, trueHeading, trueAltitude, tick),
    spoofedStream: createStream(
      routeLat + (mode === "normal" ? gpsOffset * 0.05 : gpsOffset),
      routeLon + (mode === "jamming" ? -gpsOffset * 0.3 : gpsOffset * 0.55),
      spoofedVelocity,
      spoofedHeading,
      spoofedAltitude,
      tick + 19
    ),
    gps: {
      lat: routeLat + (mode === "normal" ? gpsOffset * 0.05 : gpsOffset),
      lon: routeLon + (mode === "jamming" ? -gpsOffset * 0.3 : gpsOffset * 0.55)
    },
    fused: {
      lat: routeLat + Math.sin(tick / 12) * 0.00003,
      lon: routeLon + Math.cos(tick / 14) * 0.00003
    },
    altitude: spoofedAltitude,
    velocity: spoofedVelocity,
    heading: spoofedHeading,
    gpsDriftMeters: driftMeters,
    positionErrorMeters: clamp(driftMeters * 0.18 + (mode === "sensorFailure" ? 13 : 3), 2, 45),
    signalQuality: clamp(profile.signal + wave * 5 - (mode === "jamming" ? Math.abs(Math.sin(tick / 3) * 12) : 0), 8, 99),
    sensorConfidence: clamp(profile.confidence + Math.cos(tick / 9) * 4, 20, 99),
    cpuUsage: clamp(31 + Math.abs(Math.sin(tick / 6) * 18) + (mode === "mixed" ? 9 : 0), 18, 83),
    memoryUsage: clamp(46 + Math.abs(Math.cos(tick / 11) * 12), 34, 76),
    fps: clamp(57 - (mode === "mixed" ? 8 : 0) - Math.abs(Math.sin(tick / 4) * 4), 34, 60)
  };

  const score = clamp(96 - profile.trustPenalty - telemetry.gpsDriftMeters * 0.08 - (100 - telemetry.signalQuality) * 0.12, 12, 99);
  const trust: TrustState = {
    score,
    severity: severityFromScore(score),
    confidence: clamp((telemetry.sensorConfidence + telemetry.signalQuality) / 2 - profile.trustPenalty * 0.18, 18, 99)
  };

  history = [...history, telemetry].slice(-historyLimit);
  createAlerts(mode, trust, telemetry);
  if (mode !== "normal" && tick % 6 === 0) {
    alerts = [
      {
        id: `${Date.now()}-ai-${tick}`,
        timestamp: telemetry.timestamp,
        severity: trust.severity,
        title: "AI mitigation active",
        message: `${attackLabel(mode)} detected. GPS trust reduced, inertial fallback weighting increased.`
      },
      ...alerts
    ].slice(0, 40);
  }

  const health: HealthState = {
    system: trust.severity === "critical" ? "Degraded" : "Online",
    gps: mode === "jamming" || mode === "mixed" ? "Unstable" : "Locked",
    imu: mode === "sensorFailure" || mode === "mixed" ? "Drift" : "Nominal",
    sensors: Math.round(telemetry.sensorConfidence),
    uavConnected: true,
    container: "Running"
  };

  return {
    telemetry,
    trust,
    threats: makeThreats(mode, now, trust.severity),
    alerts,
    health,
    insights: createInsights(mode, trust, telemetry),
    history
  };
}
