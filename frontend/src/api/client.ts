import type { AlertLog, HealthState, Telemetry, Threat, TrustState } from "../types/aerosentinel";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== "false";

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    signal
  });

  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  demoPreferred: DEMO_MODE,
  telemetry: (signal?: AbortSignal) => fetchJson<Telemetry>("/telemetry", signal),
  trust: (signal?: AbortSignal) => fetchJson<TrustState>("/trust", signal),
  alerts: (signal?: AbortSignal) => fetchJson<AlertLog[]>("/alerts", signal),
  threats: (signal?: AbortSignal) => fetchJson<Threat[]>("/threats", signal),
  health: (signal?: AbortSignal) => fetchJson<HealthState>("/health", signal)
};
