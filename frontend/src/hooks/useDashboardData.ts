import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { nextDemoSnapshot, resetDemoTelemetry } from "../mocks/telemetry";
import type { DashboardSnapshot, SimulationMode, SimulationSettings } from "../types/aerosentinel";

export function useDashboardData() {
  const [mode, setMode] = useState<SimulationMode>("normal");
  const [simulationSettings, setSimulationSettings] = useState<SimulationSettings>({
    active: false,
    attackType: "spoofing",
    severity: 70,
    durationSeconds: 60
  });
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(() => nextDemoSnapshot("normal"));
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function refresh() {
      const activeMode = simulationSettings.active ? simulationSettings.attackType : mode;

      if (!api.demoPreferred && activeMode === "normal") {
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
        setSnapshot(nextDemoSnapshot(activeMode, simulationSettings));
      }
    }

    refresh();
    const timer = window.setInterval(refresh, 1300);
    return () => {
      mounted = false;
      controller.abort();
      window.clearInterval(timer);
    };
  }, [mode, simulationSettings]);

  const controls = useMemo(
    () => ({
      setMode,
      simulationSettings,
      setSimulationSettings,
      startAttack: () => {
        setSimulationSettings((previous) => ({ ...previous, active: true }));
        setMode(simulationSettings.attackType);
      },
      stopAttack: () => {
        setSimulationSettings((previous) => ({ ...previous, active: false }));
        setMode("normal");
      },
      reset: () => {
        resetDemoTelemetry();
        setMode("normal");
        setSimulationSettings((previous) => ({ ...previous, active: false }));
        setSnapshot(nextDemoSnapshot("normal"));
      }
    }),
    [simulationSettings]
  );

  return { snapshot, mode: simulationSettings.active ? simulationSettings.attackType : mode, controls, backendOnline };
}
