"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from "lucide-react";

type Evento = { id: number; titulo: string; fecha: string; hora: string; tipo: string };

const TIPOS: Record<string, { label: string; color: string }> = {
  evento: { label: "Evento", color: "#2563eb" },
  recordatorio: { label: "Recordatorio", color: "#059669" },
  reunion: { label: "Reunión", color: "#7c3aed" },
  importante: { label: "Importante", color: "#d97706" },
};
const DIAS = ["L", "M", "M", "J", "V", "S", "D"];
const pad = (n: number) => String(n).padStart(2, "0");
const fmtFecha = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });

export default function CalendarioWidget({ eventos, soloLectura = false }: { eventos: Evento[]; soloLectura?: boolean }) {
  const router = useRouter();
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ titulo: "", fecha: "", hora: "", tipo: "evento" });

  const hoyKey = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
  const porDia: Record<string, Evento[]> = {};
  for (const e of eventos) { const k = e.fecha.slice(0, 10); (porDia[k] ||= []).push(e); }

  const blanks = (new Date(anio, mes, 1).getDay() + 6) % 7;
  const total = new Date(anio, mes + 1, 0).getDate();
  const celdas = [...Array(blanks).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  const nombreMes = new Date(anio, mes, 1).toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  const proximos = eventos
    .filter((e) => e.fecha.slice(0, 10) >= hoyKey)
    .sort((a, b) => (a.fecha.slice(0, 10) + a.hora).localeCompare(b.fecha.slice(0, 10) + b.hora))
    .slice(0, 4);

  function cambiarMes(d: number) { let m = mes + d, a = anio; if (m < 0) { m = 11; a--; } else if (m > 11) { m = 0; a++; } setMes(m); setAnio(a); }
  function abrirEn(day: number) { if (soloLectura) return; setForm({ titulo: "", fecha: `${anio}-${pad(mes + 1)}-${pad(day)}`, hora: "", tipo: "evento" }); setOpen(true); }
  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim() || !form.fecha) return;
    setBusy(true);
    await fetch("/api/eventos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setBusy(false); setOpen(false); router.refresh();
  }
  async function eliminar(id: number) { if (!confirm("¿Eliminar este evento?")) return; await fetch(`/api/eventos/${id}`, { method: "DELETE" }); router.refresh(); }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-md max-w-3xl mx-auto">
      <style>{`@keyframes gslFlota{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>

      {/* Mascota transparente, encima del calendario */}
      <div className="flex justify-center pt-3 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/api/mascota-cal" alt="Mascota GSL" className="w-36 relative z-10" style={{ marginBottom: -28, animation: "gslFlota 3s ease-in-out infinite" }} />
      </div>

      {/* Barra del mes (azul) — la mascota apoya las patitas aquí */}
      <div className="flex items-center justify-between px-4 pt-9 pb-2.5 text-white" style={{ backgroundColor: "#1a3a6b" }}>
        <button onClick={() => cambiarMes(-1)} className="p-1 rounded-lg hover:bg-white/10 relative z-20"><ChevronLeft size={18} /></button>
        <span className="text-sm font-semibold capitalize">{nombreMes}</span>
        <button onClick={() => cambiarMes(1)} className="p-1 rounded-lg hover:bg-white/10 relative z-20"><ChevronRight size={18} /></button>
      </div>

      <div className="grid md:grid-cols-5 gap-4 p-4">
        {/* Días */}
        <div className="md:col-span-3">
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {DIAS.map((d, i) => <div key={i} className="text-[10px] font-semibold text-gray-300 py-1">{d}</div>)}
            {celdas.map((day, i) => {
              if (day === null) return <div key={`b${i}`} />;
              const key = `${anio}-${pad(mes + 1)}-${pad(day)}`;
              const evs = porDia[key] ?? [];
              const esHoy = key === hoyKey;
              return (
                <button key={key} onClick={() => abrirEn(day)} disabled={soloLectura} className="h-9 rounded-lg flex flex-col items-center justify-center hover:bg-blue-50 transition disabled:hover:bg-transparent disabled:cursor-default" style={esHoy ? { backgroundColor: "#1a3a6b" } : {}}>
                  <span className={`text-xs leading-none ${esHoy ? "text-white font-bold" : "text-gray-600"}`}>{day}</span>
                  {evs.length > 0 && (
                    <span className="flex gap-0.5 mt-0.5">
                      {evs.slice(0, 3).map((e, j) => <span key={j} className="w-1 h-1 rounded-full" style={{ backgroundColor: esHoy ? "#fff" : (TIPOS[e.tipo] ?? TIPOS.evento).color }} />)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2.5 mt-3">
            {Object.values(TIPOS).map((t) => (
              <span key={t.label} className="flex items-center gap-1 text-[10px] text-gray-400"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />{t.label}</span>
            ))}
          </div>
        </div>

        {/* Próximos */}
        <div className="md:col-span-2 md:border-l md:border-gray-100 md:pl-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Próximos</p>
            {!soloLectura && (
              <button onClick={() => { setForm({ titulo: "", fecha: hoyKey, hora: "", tipo: "evento" }); setOpen(true); }} className="flex items-center gap-1 px-2 py-1 text-[11px] text-white rounded-lg" style={{ backgroundColor: "#1a3a6b" }}>
                <Plus size={12} /> Agregar
              </button>
            )}
          </div>
          {proximos.length === 0 ? (
            <p className="text-xs text-gray-400">Sin eventos próximos.</p>
          ) : (
            <div className="space-y-1.5">
              {proximos.map((e) => {
                const t = TIPOS[e.tipo] ?? TIPOS.evento;
                return (
                  <div key={e.id} className="border border-gray-100 rounded-lg p-2 flex items-start gap-2 group">
                    <span className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{e.titulo}</p>
                      <p className="text-[11px] text-gray-400 capitalize">{fmtFecha(e.fecha)}{e.hora && ` · ${e.hora}`}</p>
                    </div>
                    {!soloLectura && <button onClick={() => eliminar(e.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {open && !soloLectura && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Nuevo evento</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={guardar} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Título</label>
                <input type="text" required autoFocus className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="ej. Junta de equipo" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 font-medium">Fecha</label><input type="date" required className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></div>
                <div><label className="text-xs text-gray-500 font-medium">Hora (opcional)</label><input type="time" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} /></div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Tipo</label>
                <select className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  {Object.entries(TIPOS).map(([val, t]) => <option key={val} value={val}>{t.label}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={busy} className="flex-1 px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 font-medium" style={{ backgroundColor: "#1a3a6b" }}>{busy ? "Guardando..." : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
