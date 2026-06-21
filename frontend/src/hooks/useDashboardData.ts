import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { nextDemoSnapshot, resetDemoTelemetry } from "../mocks/telemetry";
import type { DashboardSnapshot, SimulationMode } from "../types/aerosentinel";

export function useDashboardData() {
  const [mode, setMode] = useState<SimulationMode>("normal");
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(() => nextDemoSnapshot("normal"));
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function refresh() {
      if (!api.demoPreferred && mode === "normal") {
        try {
          const [telemetry, trust, alerts, threats, health] = await Promise.all([
            api.telemetry(controller.signal),
            api.trust(controller.signal),
            api.alerts(controller.signal),
            api.threats(controller.signal),
            api.health(controller.signal)
          ]);

          if (mounted) {
            setBackendOnline(true);
            setSnapshot((previous) => ({
              telemetry,
              trust,
              alerts,
              threats,
              health,
              insights: previous.insights,
              history: [...previous.history, telemetry].slice(-80)
            }));
          }
          return;
        } catch {
          if (mounted) setBackendOnline(false);
        }
      }

      if (mounted) {
        setSnapshot(nextDemoSnapshot(mode));
      }
    }

    refresh();
    const timer = window.setInterval(refresh, 1300);
    return () => {
      mounted = false;
      controller.abort();
      window.clearInterval(timer);
    };
  }, [mode]);

  const controls = useMemo(
    () => ({
      setMode,
      reset: () => {
        resetDemoTelemetry();
        setMode("normal");
        setSnapshot(nextDemoSnapshot("normal"));
      }
    }),
    []
  );

  return { snapshot, mode, controls, backendOnline };
}
