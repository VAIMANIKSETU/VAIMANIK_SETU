import { useEffect, useState } from "react";
import { RealtimeCharts } from "./components/charts/RealtimeCharts";
import { Sidebar } from "./components/layout/Sidebar";
import { TopStatusBar } from "./components/layout/TopStatusBar";
import { MissionMap } from "./components/map/MissionMap";
import { AiInsightsPanel } from "./components/panels/AiInsightsPanel";
import { AlertCenter } from "./components/panels/AlertCenter";
import { DeploymentPanel } from "./components/panels/DeploymentPanel";
import { MissionExplanationPanel } from "./components/panels/MissionExplanationPanel";
import { SensorFusionPanel } from "./components/panels/SensorFusionPanel";
import { SimulationControls } from "./components/panels/SimulationControls";
import { ThreatDetectionPanel } from "./components/panels/ThreatDetectionPanel";
import { TrustAwareFusionPanel } from "./components/panels/TrustAwareFusionPanel";
import { TrustEnginePanel } from "./components/panels/TrustEnginePanel";
import { useDashboardData } from "./hooks/useDashboardData";

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem("aerosentinel-sidebar") === "collapsed");
  const { snapshot, mode, controls, backendOnline } = useDashboardData();
  const { telemetry, trust, threats, alerts, health, insights, history } = snapshot;

  useEffect(() => {
    localStorage.setItem("aerosentinel-sidebar", sidebarCollapsed ? "collapsed" : "expanded");
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-screen bg-obsidian text-slate-100">
      <div className="fixed inset-0 bg-radar-grid opacity-70" />
      <div className="fixed inset-x-0 top-0 h-48 bg-gradient-to-b from-cyanline/12 to-transparent" />
      <div className="relative flex min-h-screen">
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          trustScore={trust.score}
          activeThreats={threats.filter((threat) => threat.active).length}
        />
        <main
          className={`min-w-0 flex-1 transition-[margin] duration-300 ease-in-out ${
            sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[320px]"
          }`}
        >
          <TopStatusBar health={health} telemetry={telemetry} backendOnline={backendOnline} />
          <div className="mx-auto max-w-[1800px] space-y-4 p-4">
            <section id="mission-overview" className="grid gap-4 2xl:grid-cols-[minmax(0,1.8fr)_minmax(360px,0.72fr)]">
              <MissionMap telemetry={telemetry} history={history} trust={trust} threats={threats} alerts={alerts} />
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
                <TrustEnginePanel trust={trust} threats={threats} />
                <TrustAwareFusionPanel trust={trust} />
                <MissionExplanationPanel trust={trust} />
              </div>
            </section>

            <section id="sensor-status" className="grid gap-4 xl:grid-cols-[minmax(340px,0.9fr)_minmax(0,1.4fr)]">
              <SensorFusionPanel telemetry={telemetry} />
              <div className="grid gap-4">
                <SimulationControls mode={mode} setMode={controls.setMode} reset={controls.reset} />
                <AiInsightsPanel insights={insights} />
              </div>
            </section>

            <section id="trust-engine">
              <RealtimeCharts history={history} />
            </section>

            <section id="alerts" className="grid gap-4 xl:grid-cols-[minmax(340px,0.9fr)_minmax(0,1.4fr)]">
              <ThreatDetectionPanel threats={threats} />
              <div className="grid gap-4">
                <AlertCenter alerts={alerts} />
              </div>
            </section>

            <section id="system-health">
              <DeploymentPanel telemetry={telemetry} health={health} />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
