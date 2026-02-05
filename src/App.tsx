import * as React from "react";
import { loadKB } from "@/kb/loadKb";
import { useAppStore } from "@/store/appStore";
import { ReleaseNotesButton } from "@/components/ReleaseNotesButton"; // ✅ ADD THIS
import ClinicalApp from "@/clinical/ClinicalApp";
import { APP_VERSION } from "@/config/appVersion";

export default function App() {
  const kb = useAppStore((s) => s.kb);
  const actions = useAppStore((s) => s.actions);
  React.useEffect(() => {
    loadKB().then(actions.loadKb).catch(console.error);
  }, [actions]);

  return (
    <div className="kbApp">
      <div className="kbHeader">
        <div className="kbHeaderInner">
          <div className="kbTitle">LTC/SNF Knowledge Base</div>

          <div className="kbRight">
            {kb ? (
              <span>
                KB v{kb.manifest.kb_version} • {kb.manifest.approval.status}
              </span>
            ) : (
              <span>Loading KB…</span>
            )}
            <span>App v{APP_VERSION}</span>
          </div>
        </div>
      </div>

      <div className="kbMain">
        <div className="panel panelPad" style={{ minWidth: 0, height: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>
              Clinical Documentation Suite
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ClinicalApp />
            </div>
          </div>
        </div>
      </div>

      {/* ✅ ADD THIS (bottom-left fixed button + modal) */}
      <ReleaseNotesButton />
    </div>
  );
}
