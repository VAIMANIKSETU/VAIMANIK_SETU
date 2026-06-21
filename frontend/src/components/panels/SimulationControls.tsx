import { RotateCcw, ShieldAlert, SignalHigh, SlidersHorizontal, Waves, Zap } from "lucide-react";
import type { SimulationMode } from "../../types/aerosentinel";
import { Panel } from "../common/Panel";

interface SimulationControlsProps {
  mode: SimulationMode;
  setMode: (mode: SimulationMode) => void;
  reset: () => void;
}

const modes: Array<{ mode: SimulationMode; label: string; icon: typeof SignalHigh }> = [
  { mode: "normal", label: "Normal Flight", icon: SignalHigh },
  { mode: "spoofing", label: "GPS Spoofing", icon: ShieldAlert },
  { mode: "jamming", label: "GPS Jamming", icon: Waves },
  { mode: "sensorFailure", label: "Sensor Failure", icon: SlidersHorizontal },
  { mode: "mixed", label: "Mixed Attack", icon: Zap }
];

export function SimulationControls({ mode, setMode, reset }: SimulationControlsProps) {
  return (
    <Panel title="Simulation Controls">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {modes.map(({ mode: nextMode, label, icon: Icon }) => (
          <button
            key={nextMode}
            type="button"
            onClick={() => setMode(nextMode)}
            className={`flex items-center justify-center gap-2 rounded-md border px-3 py-3 text-sm font-semibold transition ${
              mode === nextMode
                ? "border-cyanline/55 bg-cyanline/14 text-white shadow-glow"
                : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyanline/35 hover:text-white"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={reset}
          className="flex items-center justify-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/30 hover:text-white"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </Panel>
  );
}
