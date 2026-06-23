"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ListChecks,
  BarChart3,
  FileText,
  Network,
  Building2,
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

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900 leading-tight">Global Solutions Life</p>
            <p className="text-[10px] text-gray-500">Talento &amp; Operaciones</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {nav.map((item, i) => {
          if ("divider" in item) {
            return (
              <p key={i} className="text-[10px] uppercase tracking-widest text-gray-400 px-2 pt-4 pb-1">
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
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-emerald-50 text-emerald-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-gray-200">
        <p className="text-[10px] text-gray-400">Sistema v1.0 · 2026</p>
      </div>
    </aside>
  );
}
