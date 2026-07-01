"use client";
import { useEffect } from "react";

// Registra el service worker para que la app pueda instalarse en celular y compu.
export default function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/api/sw", { scope: "/" }).catch(() => {});
    }
  }, []);
  return null;
}
