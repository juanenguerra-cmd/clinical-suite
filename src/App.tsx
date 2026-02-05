import * as React from "react";
import { loadKB } from "@/kb/loadKb";
import { useAppStore } from "@/store/appStore";
import { ReleaseNotesButton } from "@/components/ReleaseNotesButton"; // ✅ ADD THIS
import ClinicalApp from "@/clinical/ClinicalApp";

export default function App() {
  const actions = useAppStore((s) => s.actions);
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    loadKB().then(actions.loadKb).catch(console.error);
  }, [actions]);
  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const mediaQuery = window.matchMedia(
      "(max-width: 820px), (pointer: coarse)"
    );
    const updateMobile = () => setIsMobile(mediaQuery.matches);
    updateMobile();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateMobile);
      return () => mediaQuery.removeEventListener("change", updateMobile);
    }
    mediaQuery.addListener(updateMobile);
    return () => mediaQuery.removeListener(updateMobile);
  }, []);

  return (
    <div className={`kbApp ${isMobile ? "kbAppMobile" : ""}`}>
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
