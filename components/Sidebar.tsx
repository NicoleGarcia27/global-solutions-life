"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, ListChecks, BarChart3, FileText, Network, LogOut,
  Shield, TrendingUp, Copy, Mail, Inbox, Wrench, MessageSquareWarning,
  ChevronDown, ChevronRight, UserCog, Palmtree, CalendarCheck,
} from "lucide-react";

type Item = { href: string; label: string; icon: any };
type Grupo =
  | { tipo: "single"; href: string; label: string; icon: any }
  | { tipo: "folder"; id: string; label: string; adminOnly?: boolean; items: Item[] };

const GRUPOS: Grupo[] = [
  { tipo: "single", href: "/", label: "Inicio", icon: LayoutDashboard },
  {
    tipo: "folder", id: "perfiles", label: "Puestos y perfiles",
    items: [
      { href: "/puestos", label: "Puestos", icon: Users },
      { href: "/frp", label: "FRP — Procesos", icon: ListChecks },
      { href: "/kpis", label: "KPIs", icon: BarChart3 },
      { href: "/perfil", label: "Perfil de puesto", icon: FileText },
      { href: "/organigrama", label: "Organigrama", icon: Network },
    ],
  },
  {
    tipo: "folder", id: "personal", label: "Personal", adminOnly: true,
    items: [
      { href: "/empleados", label: "Empleados", icon: UserCog },
      { href: "/vacaciones", label: "Vacaciones", icon: Palmtree },
      { href: "/asistencia", label: "Asistencia", icon: CalendarCheck },
    ],
  },
  {
    tipo: "folder", id: "admin", label: "Administración", adminOnly: true,
    items: [
      { href: "/admin/usuarios", label: "Usuarios", icon: Shield },
      { href: "/admin/avance", label: "Panel de avance", icon: TrendingUp },
      { href: "/admin/banco", label: "Banco de tareas", icon: Inbox },
      { href: "/admin/mejoras", label: "Problemas / Mejoras", icon: Wrench },
      { href: "/admin/buzon", label: "Buzón anónimo", icon: MessageSquareWarning },
      { href: "/admin/comparar", label: "Tareas repetidas", icon: Copy },
      { href: "/admin/invitar", label: "Invitar empleados", icon: Mail },
    ],
  },
];

export default function Sidebar() {
  const path = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;
  const isAdmin = user?.role === "admin";

  const isActive = (href: string) => path === href || (href !== "/" && path.startsWith(href));

  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    for (const g of GRUPOS) {
      if (g.tipo === "folder") o[g.id] = g.id === "perfiles" || g.items.some((it) => isActive(it.href));
    }
    return o;
  });

  const linkStyle = (active: boolean) =>
    active ? { backgroundColor: "#00b4d8", color: "#fff", fontWeight: 600 } : { color: "rgba(255,255,255,0.75)" };

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col" style={{ backgroundColor: "#1a3a6b" }}>
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/api/logo" alt="GSL" width={36} height={36} className="flex-shrink-0 object-contain" />
          <div>
            <p className="text-xs font-bold text-white leading-tight">Global Solutions Life</p>
            <p className="text-[10px]" style={{ color: "#00b4d8" }}>Consultoría en Seguros</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {GRUPOS.map((g) => {
          if (g.tipo === "single") {
            const active = isActive(g.href);
            const Icon = g.icon;
            return (
              <Link key={g.href} href={g.href} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors" style={linkStyle(active)}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}>
                <Icon size={16} /> {g.label}
              </Link>
            );
          }
          if (g.adminOnly && !isAdmin) return null;
          const abierto = open[g.id];
          const tieneActivo = g.items.some((it) => isActive(it.href));
          return (
            <div key={g.id} className="pt-3">
              <button
                onClick={() => setOpen((o) => ({ ...o, [g.id]: !o[g.id] }))}
                className="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase tracking-widest font-semibold"
                style={{ color: tieneActivo ? "#00b4d8" : "rgba(255,255,255,0.45)" }}
              >
                {abierto ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                {g.label}
              </button>
              {abierto && (
                <div className="mt-0.5 space-y-0.5">
                  {g.items.map((it) => {
                    const active = isActive(it.href);
                    const Icon = it.icon;
                    return (
                      <Link key={it.href} href={it.href} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors" style={linkStyle(active)}
                        onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.08)"; }}
                        onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}>
                        <Icon size={16} /> {it.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10 space-y-3">
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: "#00b4d8", color: "#fff" }}>
              {user.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] truncate" style={{ color: "#00b4d8" }}>
                {user.role === "admin" ? "Administradora" : user.departamentoNombre ?? "Usuario"}
              </p>
            </div>
          </div>
        )}
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-2 text-xs transition-colors w-full" style={{ color: "rgba(255,255,255,0.5)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ff6b6b"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}>
          <LogOut size={13} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
