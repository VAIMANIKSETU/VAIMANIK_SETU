import { PauseCircle, PlayCircle, RotateCcw, ShieldAlert, SignalHigh, SlidersHorizontal, Waves, Zap } from "lucide-react";
import type { SimulationMode, SimulationSettings } from "../../types/aerosentinel";
import { Panel } from "../common/Panel";

interface SimulationControlsProps {
  mode: SimulationMode;
  setMode: (mode: SimulationMode) => void;
  simulationSettings: SimulationSettings;
  setSimulationSettings: (settings: SimulationSettings) => void;
  startAttack: () => void;
  stopAttack: () => void;
  reset: () => void;
}

const modes: Array<{ mode: SimulationMode; label: string; icon: typeof SignalHigh }> = [
  { mode: "normal", label: "Normal Flight", icon: SignalHigh },
  { mode: "spoofing", label: "GPS Spoofing", icon: ShieldAlert },
  { mode: "jamming", label: "GPS Jamming", icon: Waves },
  { mode: "sensorFailure", label: "Sensor Failure", icon: SlidersHorizontal },
  { mode: "mixed", label: "Mixed Attack", icon: Zap },
  { mode: "coordinateJump", label: "Coordinate Jump", icon: ShieldAlert },
  { mode: "gradualDrift", label: "Gradual Drift", icon: ShieldAlert },
  { mode: "replay", label: "Replay Attack", icon: Waves },
  { mode: "delay", label: "Delay Attack", icon: Waves },
  { mode: "velocitySpoof", label: "Velocity Spoof", icon: Zap },
  { mode: "altitudeSpoof", label: "Altitude Spoof", icon: Zap },
  { mode: "headingManipulation", label: "Heading Manipulation", icon: SlidersHorizontal },
  { mode: "adaptiveSpoof", label: "Adaptive Spoofing", icon: ShieldAlert }
];

export function SimulationControls({
  mode,
  setMode,
  simulationSettings,
  setSimulationSettings,
  startAttack,
  stopAttack,
  reset
}: SimulationControlsProps) {
  return (
    <Panel title="Simulation Controls">
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <label className="rounded-lg border border-slate-700/60 bg-obsidian/35 p-3 text-sm text-slate-300">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-slate-500">Attack Type</span>
          <select
            className="w-full rounded-lg border border-slate-700/70 bg-obsidian px-3 py-2 text-slate-100 outline-none"
            value={simulationSettings.attackType}
            onChange={(event) =>
              setSimulationSettings({ ...simulationSettings, attackType: event.target.value as SimulationMode })
            }
          >
            {modes.filter((item) => item.mode !== "normal").map((item) => (
              <option key={item.mode} value={item.mode}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="rounded-lg border border-slate-700/60 bg-obsidian/35 p-3 text-sm text-slate-300">
          <span className="mb-2 flex justify-between text-xs uppercase tracking-[0.14em] text-slate-500">
            Severity <b className="text-danger">{simulationSettings.severity}%</b>
          </span>
          <input
            type="range"
            min={20}
            max={100}
            value={simulationSettings.severity}
            onChange={(event) => setSimulationSettings({ ...simulationSettings, severity: Number(event.target.value) })}
            className="w-full accent-cyanline"
          />
        </label>
        <label className="rounded-lg border border-slate-700/60 bg-obsidian/35 p-3 text-sm text-slate-300">
          <span className="mb-2 flex justify-between text-xs uppercase tracking-[0.14em] text-slate-500">
            Duration <b className="text-cyanline">{simulationSettings.durationSeconds}s</b>
          </span>
          <input
            type="range"
            min={15}
            max={180}
            step={15}
            value={simulationSettings.durationSeconds}
            onChange={(event) => setSimulationSettings({ ...simulationSettings, durationSeconds: Number(event.target.value) })}
            className="w-full accent-cyanline"
          />
        </label>
      </div>
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={startAttack}
          className="flex items-center justify-center gap-2 rounded-lg border border-danger/35 bg-danger/10 px-3 py-3 text-sm font-semibold text-red-100 transition hover:border-danger"
        >
          <PlayCircle size={16} />
          Start Attack
        </button>
        <button
          type="button"
          onClick={stopAttack}
          className="flex items-center justify-center gap-2 rounded-lg border border-limepulse/35 bg-limepulse/10 px-3 py-3 text-sm font-semibold text-limepulse transition hover:border-limepulse"
        >
          <PauseCircle size={16} />
          Stop Attack
        </button>
        <button
          type="button"
          onClick={reset}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-700/70 bg-black/20 px-3 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/30 hover:text-white"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {modes.map(({ mode: nextMode, label, icon: Icon }) => (
          <button
            key={nextMode}
            type="button"
            onClick={() => {
              setMode(nextMode);
              if (nextMode !== "normal") {
                setSimulationSettings({ ...simulationSettings, attackType: nextMode, active: true });
              } else {
                setSimulationSettings({ ...simulationSettings, active: false });
              }
            }}
            className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold transition ${
              mode === nextMode
                ? "border-cyanline/55 bg-cyanline/10 text-white shadow-lg shadow-black/20"
                : "border-slate-700/70 bg-white/[0.03] text-slate-300 hover:border-cyanline/35 hover:text-white"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
    </Panel>
  );
}
