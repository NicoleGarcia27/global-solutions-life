"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, ListChecks, BarChart3, FileText, Network, LogOut,
  Shield, TrendingUp, Copy, Mail, Inbox, Wrench, MessageSquareWarning,
  ChevronDown, ChevronRight, UserCog, Palmtree, CalendarCheck, Megaphone, Fingerprint, Bell, Briefcase,
} from "lucide-react";

type Item = { href: string; label: string; icon: any };
type SubFolder = { id: string; label: string; items: Item[] };
type Grupo =
  | { tipo: "single"; href: string; label: string; icon: any; adminOnly?: boolean; soloEmpleado?: boolean }
  | { tipo: "folder"; id: string; label: string; adminOnly?: boolean; items: Item[] }
  | { tipo: "parent"; id: string; label: string; icon: any; adminOnly?: boolean; folders: SubFolder[] };

const GRUPOS: Grupo[] = [
  { tipo: "single", href: "/", label: "Inicio", icon: LayoutDashboard },
  { tipo: "single", href: "/checador", label: "Mi asistencia", icon: Fingerprint },
  { tipo: "single", href: "/mis-vacaciones", label: "Mis vacaciones", icon: Palmtree, soloEmpleado: true },
  { tipo: "single", href: "/puestos", label: "Mi puesto", icon: FileText, soloEmpleado: true },
  { tipo: "single", href: "/buzon", label: "Buzón", icon: MessageSquareWarning, soloEmpleado: true },
  {
    tipo: "parent", id: "rh", label: "Recursos Humanos", icon: Briefcase, adminOnly: true,
    folders: [
      {
        id: "perfiles", label: "Puestos y perfiles",
        items: [
          { href: "/puestos", label: "Puestos", icon: Users },
          { href: "/frp", label: "FRP — Procesos", icon: ListChecks },
          { href: "/kpis", label: "KPIs", icon: BarChart3 },
          { href: "/perfil", label: "Perfil de puesto", icon: FileText },
          { href: "/organigrama", label: "Organigrama", icon: Network },
        ],
      },
      {
        id: "personal", label: "Personal",
        items: [
          { href: "/empleados", label: "Empleados", icon: UserCog },
          { href: "/vacaciones", label: "Vacaciones", icon: Palmtree },
          { href: "/asistencia", label: "Asistencia", icon: CalendarCheck },
        ],
      },
      {
        id: "admin", label: "Administración",
        items: [
          { href: "/admin/usuarios", label: "Usuarios", icon: Shield },
          { href: "/admin/comunicados", label: "Comunicados", icon: Megaphone },
          { href: "/admin/avance", label: "Panel de avance", icon: TrendingUp },
          { href: "/admin/banco", label: "Banco de tareas", icon: Inbox },
          { href: "/admin/mejoras", label: "Problemas / Mejoras", icon: Wrench },
          { href: "/admin/buzon", label: "Buzón anónimo", icon: MessageSquareWarning },
          { href: "/admin/comparar", label: "Tareas repetidas", icon: Copy },
          { href: "/admin/invitar", label: "Invitar empleados", icon: Mail },
        ],
      },
    ],
  },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;
  const isAdmin = user?.role === "admin";

  const isActive = (href: string) => path === href || (href !== "/" && path.startsWith(href));

  const [noLeidas, setNoLeidas] = useState(0);
  useEffect(() => {
    if (!isAdmin) return;
    const cargar = () => fetch("/api/notificaciones").then((r) => r.json()).then((d) => setNoLeidas(d.noLeidas ?? 0)).catch(() => {});
    cargar();
    const id = setInterval(cargar, 60000);
    return () => clearInterval(id);
  }, [isAdmin, path]);

  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    for (const g of GRUPOS) {
      if (g.tipo === "folder") o[g.id] = g.items.some((it) => isActive(it.href));
      if (g.tipo === "parent") {
        o[g.id] = true; // Recursos Humanos abierto por defecto
        for (const sf of g.folders) o[sf.id] = sf.items.some((it) => isActive(it.href)) || sf.id === "personal";
      }
    }
    return o;
  });

  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  const linkStyle = (active: boolean) =>
    active ? { backgroundColor: "#00b4d8", color: "#fff", fontWeight: 600 } : { color: "rgba(255,255,255,0.75)" };

  const hoverOn = (e: React.MouseEvent, active: boolean) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.08)"; };
  const hoverOff = (e: React.MouseEvent, active: boolean) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; };

  const renderItem = (it: Item) => {
    const active = isActive(it.href);
    const Icon = it.icon;
    return (
      <Link key={it.href} href={it.href} onClick={onNavigate} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors" style={linkStyle(active)}
        onMouseEnter={(e) => hoverOn(e, active)} onMouseLeave={(e) => hoverOff(e, active)}>
        <Icon size={16} /> {it.label}
      </Link>
    );
  };

  const renderSubFolder = (sf: SubFolder) => {
    const abierto = open[sf.id];
    const tieneActivo = sf.items.some((it) => isActive(it.href));
    return (
      <div key={sf.id}>
        <button
          onClick={() => toggle(sf.id)}
          className="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: tieneActivo ? "#00b4d8" : "rgba(255,255,255,0.5)" }}
        >
          {abierto ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          {sf.label}
        </button>
        {abierto && <div className="mt-0.5 space-y-0.5">{sf.items.map(renderItem)}</div>}
      </div>
    );
  };

  return (
    <aside className="w-56 h-full flex-shrink-0 flex flex-col" style={{ backgroundColor: "#1a3a6b" }}>
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/api/logo" alt="GSL" width={36} height={36} className="flex-shrink-0 object-contain" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white leading-tight">Global Solutions Life</p>
          </div>
          {isAdmin && (
            <Link href="/notificaciones" onClick={onNavigate} className="relative flex-shrink-0 text-white/70 hover:text-white" title="Notificaciones">
              <Bell size={18} />
              {noLeidas > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ backgroundColor: "#ff5a5f", color: "#fff" }}>
                  {noLeidas > 9 ? "9+" : noLeidas}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {GRUPOS.map((g) => {
          if (g.tipo === "single") {
            if (g.adminOnly && !isAdmin) return null;
            if (g.soloEmpleado && isAdmin) return null;
            const active = isActive(g.href);
            const Icon = g.icon;
            return (
              <Link key={g.href} href={g.href} onClick={onNavigate} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors" style={linkStyle(active)}
                onMouseEnter={(e) => hoverOn(e, active)} onMouseLeave={(e) => hoverOff(e, active)}>
                <Icon size={16} /> {g.label}
              </Link>
            );
          }

          if (g.adminOnly && !isAdmin) return null;

          if (g.tipo === "folder") {
            const abierto = open[g.id];
            const tieneActivo = g.items.some((it) => isActive(it.href));
            return (
              <div key={g.id} className="pt-3">
                <button
                  onClick={() => toggle(g.id)}
                  className="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase tracking-widest font-semibold"
                  style={{ color: tieneActivo ? "#00b4d8" : "rgba(255,255,255,0.45)" }}
                >
                  {abierto ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  {g.label}
                </button>
                {abierto && <div className="mt-0.5 space-y-0.5">{g.items.map(renderItem)}</div>}
              </div>
            );
          }

          // tipo === "parent" (carpeta que contiene sub-carpetas)
          const abiertoP = open[g.id];
          const ParentIcon = g.icon;
          const algunActivo = g.folders.some((sf) => sf.items.some((it) => isActive(it.href)));
          return (
            <div key={g.id} className="pt-3">
              <button
                onClick={() => toggle(g.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
                style={{ color: algunActivo ? "#00b4d8" : "rgba(255,255,255,0.9)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
              >
                {abiertoP ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <ParentIcon size={15} />
                <span className="text-xs font-semibold uppercase tracking-wide">{g.label}</span>
              </button>
              {abiertoP && (
                <div className="mt-1 ml-3 pl-2 border-l border-white/10 space-y-1.5">
                  {g.folders.map(renderSubFolder)}
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
