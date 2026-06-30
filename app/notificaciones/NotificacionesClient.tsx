"use client";
import Link from "next/link";
import { Bell, FileText, MessageSquareWarning, Palmtree, Info } from "lucide-react";

type Noti = { id: number; tipo: string; titulo: string; mensaje: string; link: string; leida: boolean; createdAt: string };

const ICONO: Record<string, { icon: any; color: string; bg: string }> = {
  puesto: { icon: FileText, color: "#1a3a6b", bg: "#eef2f8" },
  buzon: { icon: MessageSquareWarning, color: "#0a7d99", bg: "#e6f8fc" },
  vacaciones: { icon: Palmtree, color: "#059669", bg: "#ecfdf5" },
  info: { icon: Info, color: "#64748b", bg: "#f1f5f9" },
};

function hace(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export default function NotificacionesClient({ items }: { items: Noti[] }) {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2"><Bell size={19} style={{ color: "#1a3a6b" }} /> Notificaciones</h1>
        <p className="text-sm text-gray-400 mt-0.5">Avisos de lo que pasa en el sistema.</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
          No tienes notificaciones por ahora.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50 overflow-hidden">
          {items.map((n) => {
            const info = ICONO[n.tipo] ?? ICONO.info;
            const Icon = info.icon;
            const contenido = (
              <div className={`flex items-start gap-3 px-5 py-3.5 ${!n.leida ? "bg-blue-50/40" : ""} hover:bg-gray-50`}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: info.bg }}>
                  <Icon size={18} style={{ color: info.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    {n.titulo}{!n.leida && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#00b4d8" }} />}
                  </p>
                  {n.mensaje && <p className="text-xs text-gray-500 mt-0.5 truncate">{n.mensaje}</p>}
                  <p className="text-[11px] text-gray-400 mt-1">{hace(n.createdAt)}</p>
                </div>
              </div>
            );
            return n.link ? <Link key={n.id} href={n.link}>{contenido}</Link> : <div key={n.id}>{contenido}</div>;
          })}
        </div>
      )}
    </div>
  );
}
