import { Link } from "react-router-dom";
import ClinicalApp from "@/clinical/ClinicalApp";

/**
 * Full-screen wrapper for the Clinical Documentation & Transport Suite.
 * Kept isolated so the KB app styles don’t clash with the Tailwind-based suite.
 */
export function ClinicalSuitePage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ position: "fixed", top: 10, left: 10, zIndex: 50 }}>
        <Link
          to="/"
          style={{
            background: "rgba(255,255,255,0.95)",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 12,
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 700,
            textDecoration: "none",
            color: "#0f172a",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          }}
        >
          ← Back to KB
        </Link>
      </div>
      <ClinicalApp />
    </div>
  );
}
