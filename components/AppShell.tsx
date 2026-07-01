"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

const AUTH_PAGES = ["/login", "/registro", "/buzon"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isBarePage = pathname.endsWith("/imprimir");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cerrar el menú al cambiar de página (en celular)
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (isAuthPage || isBarePage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Fondo oscuro detrás del menú en celular */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} aria-hidden />
      )}

      {/* Menú: cajón deslizable en celular, fijo en computadora */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Barra superior solo en celular */}
        <header className="md:hidden flex items-center gap-3 px-4 h-14 flex-shrink-0 border-b border-gray-200 bg-white">
          <button onClick={() => setMobileOpen(true)} className="text-gray-600 -ml-1 p-1" aria-label="Abrir menú">
            <Menu size={22} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/api/logo" alt="GSL" width={26} height={26} className="object-contain" />
          <span className="text-sm font-bold" style={{ color: "#1a3a6b" }}>Global Solutions Life</span>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
