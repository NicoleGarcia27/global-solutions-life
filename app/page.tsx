import { prisma } from "@/lib/prisma";
import { seedIfEmpty } from "@/lib/seed";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { vacacionesPorLey } from "@/lib/vacaciones";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Users, TrendingUp, Megaphone, Pin, Fingerprint, FileText, MessageSquareWarning, Palmtree, ArrowRight, CalendarDays, Video, Mail, ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as any;
  if (sessionUser && sessionUser.role !== "admin") {
    return <EmpleadoHome user={sessionUser} />;
  }

  await seedIfEmpty();

  const [puestos, totalResp, empleadosCount, comunicados] = await Promise.all([
    prisma.puesto.findMany({ include: { departamento: true, usuario: { select: { nombre: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.responsabilidad.count(),
    prisma.empleado.count(),
    prisma.comunicado.findMany({ orderBy: [{ fijado: "desc" }, { createdAt: "desc" }], take: 4 }),
  ]);

  const puestosEnviados = puestos.filter((p) => p.usuarioId !== null);
  const porRevisar = puestos.filter((p) => p.estado !== "activo");

  const stats = [
    { label: "Empleados", value: String(empleadosCount), sub: "en el sistema", icon: Users, chip: "#1a3a6b", chipBg: "#eaf0f8", href: "/empleados" },
    { label: "Puestos enviados", value: String(puestosEnviados.length), sub: "por empleados", icon: FileText, chip: "#00b4d8", chipBg: "#e6f8fc", href: "/puestos" },
    { label: "Por revisar", value: String(porRevisar.length), sub: "pendientes", icon: AlertTriangle, chip: "#d97706", chipBg: "#fffbeb", href: "/puestos" },
    { label: "Procesos mapeados", value: String(totalResp), sub: "tareas en FRP", icon: TrendingUp, chip: "#059669", chipBg: "#ecfdf5", href: "/frp" },
  ];

  const tools = [
    { label: "Calendario", desc: "Google Calendar", href: "https://calendar.google.com", icon: CalendarDays, color: "#2563eb", bg: "#eff6ff" },
    { label: "Meet", desc: "Videollamada", href: "https://meet.google.com", icon: Video, color: "#059669", bg: "#ecfdf5" },
    { label: "Zoom", desc: "Reunión", href: "https://zoom.us/join", icon: Video, color: "#1a3a6b", bg: "#eef2f8" },
    { label: "Correo", desc: "Gmail", href: "https://mail.google.com", icon: Mail, color: "#dc2626", bg: "#fef2f2" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Encabezado con banda institucional */}
      <div
        className="rounded-2xl p-6 flex items-center justify-between text-white relative overflow-hidden"
        style={{ background: "linear-gradient(120deg, #14305a 0%, #1a3a6b 60%, #1e4a86 100%)" }}
      >
        <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,180,216,0.18), transparent 70%)" }} />
        <div className="relative">
          <h1 className="text-2xl font-bold">Panel de control</h1>
          <p className="text-sm text-white/70 mt-0.5">
            Global Solutions Life · {new Date().toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
          </p>
        </div>
        <Link
          href="/puestos"
          className="relative flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors"
          style={{ backgroundColor: "#00b4d8", color: "#fff" }}
        >
          Ver puestos →
        </Link>
      </div>

      {/* Comunicados — visibles para todos */}
      {comunicados.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2" style={{ backgroundColor: "#eef2f8" }}>
            <Megaphone size={16} style={{ color: "#1a3a6b" }} />
            <h2 className="text-sm font-semibold" style={{ color: "#1a3a6b" }}>Comunicados</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {comunicados.map((c) => (
              <div key={c.id} className="px-5 py-3">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  {c.fijado && <Pin size={13} style={{ color: "#d97706" }} />}{c.titulo}
                </p>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap leading-relaxed">{c.mensaje}</p>
                <p className="text-xs text-gray-400 mt-1.5">{c.autor} · {new Date(c.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "long" })}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accesos rápidos a herramientas */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Accesos rápidos</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tools.map((t) => (
            <a key={t.label} href={t.href} target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: t.bg }}>
                <t.icon size={20} style={{ color: t.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{t.label}</p>
                <p className="text-[11px] text-gray-400">{t.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((c, i) => (
          <Link key={i} href={c.href} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: c.chipBg }}>
                <c.icon size={20} style={{ color: c.chip }} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-900 leading-none">{c.value}</p>
                <p className="text-xs text-gray-500 mt-1">{c.label}</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">{c.sub}</p>
          </Link>
        ))}
      </div>

      {/* Pendientes por revisar */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><ClipboardList size={16} style={{ color: "#d97706" }} /> Puestos por revisar</h2>
          <Link href="/puestos" className="text-xs hover:underline" style={{ color: "#00b4d8" }}>Ver todos →</Link>
        </div>
        {porRevisar.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-emerald-600 px-5 py-4">
            <CheckCircle2 size={16} /> Todo al día, no hay puestos pendientes de revisar
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {porRevisar.slice(0, 6).map((p) => (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{p.nombre}</p>
                    <p className="text-xs text-gray-400">{p.usuario?.nombre ?? p.titular ?? "—"} · {p.departamento?.nombre ?? "Sin área"}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.estado === "en_proceso" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.estado === "en_proceso" ? "En revisión" : "Pendiente"}
                    </span>
                    <Link href={`/puestos/${p.id}`} className="text-xs hover:underline" style={{ color: "#00b4d8" }}>Revisar →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}

async function EmpleadoHome({ user }: { user: any }) {
  const comunicados = await prisma.comunicado.findMany({ orderBy: [{ fijado: "desc" }, { createdAt: "desc" }], take: 4 });
  const empleado = await prisma.empleado.findUnique({
    where: { usuarioId: Number(user.id) },
    include: { vacaciones: true, asistencias: true },
  });
  const misPuestos = await prisma.puesto.count({ where: { usuarioId: Number(user.id) } });

  const anio = new Date().getFullYear();
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  let vacDisp: number | null = null;
  let puntualidad: number | null = null;
  if (empleado) {
    const tomados = empleado.vacaciones.filter((v) => new Date(v.fechaInicio).getFullYear() === anio).reduce((s, v) => s + v.dias, 0);
    vacDisp = vacacionesPorLey(empleado.fechaIngreso).dias + (empleado.diasExtra || 0) - tomados;
    const mes = empleado.asistencias.filter((a) => new Date(a.fecha) >= inicioMes);
    const aTiempo = mes.filter((a) => a.estado === "a_tiempo").length;
    puntualidad = mes.length ? Math.round((aTiempo / mes.length) * 100) : null;
  }

  const acciones = [
    { href: "/checador", label: "Marcar asistencia", desc: "Registra tu entrada y salida", icon: Fingerprint, color: "#059669", bg: "#ecfdf5" },
    { href: "/puestos", label: "Mi puesto", desc: misPuestos > 0 ? "Ver mi información" : "Llenar mi formulario", icon: FileText, color: "#1a3a6b", bg: "#eef2f8" },
    { href: "/buzon", label: "Buzón anónimo", desc: "Quejas y sugerencias", icon: MessageSquareWarning, color: "#0a7d99", bg: "#e6f8fc" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: "linear-gradient(120deg, #14305a 0%, #1a3a6b 60%, #1e4a86 100%)" }}>
        <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,180,216,0.18), transparent 70%)" }} />
        <div className="relative">
          <p className="text-sm text-white/70 capitalize">{ahora.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="text-2xl font-bold mt-0.5">¡Hola, {user.name?.split(" ")[0] ?? user.name}! 👋</h1>
          <p className="text-sm text-white/70 mt-0.5">Bienvenida a tu portal de Global Solutions Life</p>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid sm:grid-cols-3 gap-4">
        {acciones.map((a) => (
          <Link key={a.href} href={a.href} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition group">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: a.bg }}>
              <a.icon size={22} style={{ color: a.color }} />
            </div>
            <p className="font-semibold text-gray-900 flex items-center gap-1">{a.label}<ArrowRight size={14} className="text-gray-300 group-hover:translate-x-0.5 transition-transform" /></p>
            <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
          </Link>
        ))}
      </div>

      {/* Stats personales */}
      {empleado && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#e6f8fc" }}><Palmtree size={22} style={{ color: "#00b4d8" }} /></div>
            <div><p className="text-2xl font-bold text-gray-900">{vacDisp ?? "—"}</p><p className="text-xs text-gray-500">días de vacaciones disponibles</p></div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#ecfdf5" }}><CheckCircle2 size={22} style={{ color: "#059669" }} /></div>
            <div><p className="text-2xl font-bold text-gray-900">{puntualidad !== null ? `${puntualidad}%` : "—"}</p><p className="text-xs text-gray-500">puntualidad este mes</p></div>
          </div>
        </div>
      )}

      {/* Comunicados */}
      {comunicados.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2" style={{ backgroundColor: "#eef2f8" }}>
            <Megaphone size={16} style={{ color: "#1a3a6b" }} />
            <h2 className="text-sm font-semibold" style={{ color: "#1a3a6b" }}>Comunicados</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {comunicados.map((c) => (
              <div key={c.id} className="px-5 py-3">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">{c.fijado && <Pin size={13} style={{ color: "#d97706" }} />}{c.titulo}</p>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap leading-relaxed">{c.mensaje}</p>
                <p className="text-xs text-gray-400 mt-1.5">{c.autor} · {new Date(c.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "long" })}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
