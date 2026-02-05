import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import { PacketPrintPage } from "@/pages/PacketPrintPage";
import { ClinicalSuitePage } from "@/pages/ClinicalSuitePage";
import "./index.css";
import "@/styles/theme.css";
import "@/styles/print.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/packet" element={<PacketPrintPage />} />
        <Route path="/suite" element={<ClinicalSuitePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
