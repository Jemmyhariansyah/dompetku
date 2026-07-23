import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FinanceApp from "./FinanceApp";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Elemen aplikasi tidak ditemukan.");
}

createRoot(root).render(
  <StrictMode>
    <FinanceApp />
  </StrictMode>,
);
