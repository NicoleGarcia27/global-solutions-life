import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import SessionWrapper from "@/components/SessionWrapper";
import AppShell from "@/components/AppShell";
import PWARegister from "@/components/PWARegister";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Global Solutions Life",
  description: "Sistema institucional de Global Solutions Life",
  applicationName: "Global Solutions Life",
  appleWebApp: { capable: true, title: "GSL", statusBarStyle: "default" },
  icons: {
    icon: "/api/icono/192",
    apple: "/api/icono/180",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a3a6b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className={`h-full bg-gray-50 text-gray-900 antialiased ${poppins.className}`}>
        <PWARegister />
        <SessionWrapper>
          <AppShell>{children}</AppShell>
        </SessionWrapper>
      </body>
    </html>
  );
}
