import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import SessionWrapper from "@/components/SessionWrapper";
import AppShell from "@/components/AppShell";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Global Solutions Life",
  description: "Sistema de institucionalización de puestos y KPIs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className={`h-full bg-gray-50 text-gray-900 antialiased ${poppins.className}`}>
        <SessionWrapper>
          <AppShell>{children}</AppShell>
        </SessionWrapper>
      </body>
    </html>
  );
}
