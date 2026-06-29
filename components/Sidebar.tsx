"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  ListChecks,
  BarChart3,
  FileText,
  Network,
  LogOut,
  Shield,
  TrendingUp,
  GitCompare,
  Mail,
} from "lucide-react";

const nav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Puestos", href: "/puestos", icon: Users },
  { divider: "Herramientas" },
  { label: "FRP — Procesos", href: "/frp", icon: ListChecks },
  { label: "KPIs", href: "/kpis", icon: BarChart3 },
  { label: "Perfil de puesto", href: "/perfil", icon: FileText },
  { divider: "Empresa" },
  { label: "Organigrama", href: "/organigrama", icon: Network },
];

export default function Sidebar() {
  const path = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col" style={{ backgroundColor: "#1a3a6b" }}>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/api/logo" alt="GSL" width={36} height={36} className="flex-shrink-0 object-contain" />
          <div>
            <p className="text-xs font-bold text-white leading-tight">Global Solutions Life</p>
            <p className="text-[10px]" style={{ color: "#00b4d8" }}>Consultoría en Seguros</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {nav.map((item, i) => {
          if ("divider" in item) {
            return (
              <p key={i} className="text-[10px] uppercase tracking-widest px-2 pt-4 pb-1 font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
                {item.divider}
              </p>
            );
          }
          const Icon = item.icon!;
          const active = path === item.href || (item.href !== "/" && path.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href!}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors"
              style={active
                ? { backgroundColor: "#00b4d8", color: "#fff", fontWeight: 600 }
                : { color: "rgba(255,255,255,0.75)" }
              }
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}

        {user?.role === "admin" && (
          <>
            <p className="text-[10px] uppercase tracking-widest px-2 pt-4 pb-1 font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>Admin</p>
            {[
              { href: "/admin/usuarios", label: "Usuarios", icon: Shield },
              { href: "/admin/avance", label: "Panel de avance", icon: TrendingUp },
              { href: "/admin/comparar", label: "Comparar puestos", icon: GitCompare },
              { href: "/admin/invitar", label: "Invitar empleados", icon: Mail },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors"
                style={path.startsWith(href)
                  ? { backgroundColor: "#00b4d8", color: "#fff", fontWeight: 600 }
                  : { color: "rgba(255,255,255,0.75)" }
                }
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User info */}
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
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-xs transition-colors w-full"
          style={{ color: "rgba(255,255,255,0.5)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ff6b6b"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
        >
          <LogOut size={13} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
