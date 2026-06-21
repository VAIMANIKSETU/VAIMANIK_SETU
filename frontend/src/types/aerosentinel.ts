export type Severity = "normal" | "warning" | "critical";
export type SimulationMode = "normal" | "spoofing" | "jamming" | "sensorFailure" | "mixed";

export interface Coordinate {
  lat: number;
  lon: number;
}

export interface Telemetry {
  timestamp: string;
  truePosition?: Coordinate;
  gps: Coordinate;
  fused: Coordinate;
  altitude: number;
  velocity: number;
  heading: number;
  gpsDriftMeters: number;
  positionErrorMeters: number;
  signalQuality: number;
  sensorConfidence: number;
  cpuUsage: number;
  memoryUsage: number;
  fps: number;
}

export interface TrustState {
  score: number;
  severity: Severity;
  confidence: number;
}

export interface Threat {
  id: string;
  type: "GPS Spoofing" | "GPS Jamming" | "Sensor Failure" | "Signal Anomalies" | "Navigation Drift";
  detectedAt: string;
  severity: Severity;
  active: boolean;
  recommendation: string;
}

export interface AlertLog {
  id: string;
  timestamp: string;
  severity: Severity;
  title: string;
  message: string;
}

export interface HealthState {
  system: "Online" | "Degraded" | "Offline";
  gps: "Locked" | "Unstable" | "Lost";
  imu: "Nominal" | "Drift" | "Fault";
  sensors: number;
  uavConnected: boolean;
  container: "Running" | "Restarting" | "Stopped";
}

export interface DashboardSnapshot {
  telemetry: Telemetry;
  trust: TrustState;
  threats: Threat[];
  alerts: AlertLog[];
  health: HealthState;
  insights: string[];
  history: Telemetry[];
}
