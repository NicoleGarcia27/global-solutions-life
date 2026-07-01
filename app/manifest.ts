import type { MetadataRoute } from "next";

// Manifest de la app instalable (PWA). Se sirve en /manifest.webmanifest.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Global Solutions Life",
    short_name: "GSL",
    description: "Sistema institucional de Global Solutions Life",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1a3a6b",
    theme_color: "#1a3a6b",
    icons: [
      { src: "/api/icono/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/api/icono/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/api/icono/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
