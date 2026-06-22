import { motion } from "framer-motion";
import { Navigation, ShieldAlert } from "lucide-react";
import type { TrustState } from "../../types/aerosentinel";
import { Panel } from "../common/Panel";

interface MissionExplanationPanelProps {
  trust: TrustState;
}

function explanationFor(score: number) {
  if (score >= 80) {
    return {
      title: "GPS trusted.",
      body: "Using GPS as the primary navigation source while IMU confirms the route.",
      tone: "text-limepulse"
    };
  }
  if (score >= 45) {
    return {
      title: "Trust degrading.",
      body: "Reducing GPS influence and increasing onboard inertial weighting.",
      tone: "text-amberwarn"
    };
  }
  return {
    title: "GPS rejected.",
    body: "Dead reckoning active. Navigating using onboard sensors while fused state remains stable.",
    tone: "text-danger"
  };
}

export function MissionExplanationPanel({ trust }: MissionExplanationPanelProps) {
  const explanation = explanationFor(trust.score);

  return (
    <Panel title="Mission Explanation">
      <motion.div
        key={explanation.title}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 rounded-xl border border-slate-700/60 bg-obsidian/35 p-4"
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.32 }}
      >
        <div className={`mt-1 ${explanation.tone}`}>
          {trust.score >= 45 ? <Navigation size={20} /> : <ShieldAlert size={20} />}
        </div>
        <div>
          <h3 className={`text-base font-semibold ${explanation.tone}`}>{explanation.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{explanation.body}</p>
        </div>
      </motion.div>
    </Panel>
  );
}
