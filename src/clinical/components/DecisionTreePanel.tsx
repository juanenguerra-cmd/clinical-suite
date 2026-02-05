import React, { useEffect } from "react";
import { loadKB } from "@/kb/loadKb";
import { DecisionWizardTab } from "@/features/wizard/DecisionWizardTab";
import { useAppStore } from "@/store/appStore";

const DecisionTreePanel: React.FC = () => {
  const kb = useAppStore((s) => s.kb);
  const actions = useAppStore((s) => s.actions);

  useEffect(() => {
    if (kb) return;
    loadKB().then(actions.loadKb).catch(console.error);
  }, [kb, actions]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Unified Decision Support
          </div>
          <div className="text-2xl font-bold text-slate-900">Change of Condition Decision Tree</div>
          <p className="text-sm text-slate-600">
            Follow the guided clinical decision pathway and capture the assessment summary directly inside the
            documentation suite.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {!kb ? (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-sm text-slate-500">
            Loading decision tree…
          </div>
        ) : (
          <DecisionWizardTab />
        )}
      </div>
    </div>
  );
};

export default DecisionTreePanel;
