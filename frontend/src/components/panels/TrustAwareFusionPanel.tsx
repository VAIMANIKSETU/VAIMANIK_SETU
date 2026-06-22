import { motion } from "framer-motion";
import type { TrustState } from "../../types/aerosentinel";
import { Panel } from "../common/Panel";

interface TrustAwareFusionPanelProps {
  trust: TrustState;
}

export function TrustAwareFusionPanel({ trust }: TrustAwareFusionPanelProps) {
  const gpsWeight = Math.round(Math.max(0, Math.min(100, trust.score)));
  const imuWeight = 100 - gpsWeight;

  return (
    <Panel title="Trust-Aware Fusion">
      <div className="space-y-4">
        {[
          ["GPS Weight", gpsWeight, "bg-cyanline"],
          ["IMU Weight", imuWeight, "bg-limepulse"]
        ].map(([label, value, color]) => (
          <div key={label as string}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-300">{label}</span>
              <span className="font-semibold text-white">{value}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <motion.div
                animate={{ width: `${value}%` }}
                className={`h-full rounded-full ${color}`}
                initial={false}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-slate-700/60 bg-obsidian/35 p-3 text-xs leading-5 text-slate-400">
        Fusion weights follow trust continuously, allowing graceful degradation instead of abrupt GPS cutoff.
      </div>
    </Panel>
  );
}
