import { BrainCircuit } from "lucide-react";
import { Panel } from "../common/Panel";

interface AiInsightsPanelProps {
  insights: string[];
}

export function AiInsightsPanel({ insights }: AiInsightsPanelProps) {
  return (
    <Panel title="AI Insights">
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={`${insight}-${index}`} className="flex gap-3 rounded-md bg-cyanline/[0.055] p-3">
            <BrainCircuit size={18} className="mt-0.5 shrink-0 text-cyanline" />
            <p className="text-sm leading-6 text-slate-200">{insight}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
