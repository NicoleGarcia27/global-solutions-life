"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Pin, PinOff, Trash2, Plus, Check, X } from "lucide-react";

type Com = { id: number; titulo: string; mensaje: string; fijado: boolean; autor: string; createdAt: string };

const fmt = (iso: string) => new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

export default function ComunicadosClient({ comunicados }: { comunicados: Com[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ titulo: "", mensaje: "", fijado: false });

  async function publicar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim() || !form.mensaje.trim()) return;
    setBusy(true);
    await fetch("/api/comunicados", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setBusy(false); setOpen(false); setForm({ titulo: "", mensaje: "", fijado: false }); router.refresh();
  }
  async function toggleFijado(c: Com) {
    await fetch(`/api/comunicados/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fijado: !c.fijado }) });
    router.refresh();
  }
  async function eliminar(id: number) {
    if (!confirm("¿Eliminar este comunicado?")) return;
    await fetch(`/api/comunicados/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2"><Megaphone size={19} style={{ color: "#1a3a6b" }} /> Comunicados</h1>
          <p className="text-sm text-gray-400 mt-0.5">Lo que publiques aquí aparece en el Inicio de todos los empleados.</p>
        </div>
        {!open && <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg" style={{ backgroundColor: "#1a3a6b" }}><Plus size={15} /> Nuevo comunicado</button>}
      </div>

      {open && (
        <form onSubmit={publicar} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">Título</label>
            <input type="text" required autoFocus className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00b4d8]" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="ej. Junta general el viernes" />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Mensaje</label>
            <textarea required rows={3} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00b4d8] resize-none" value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} placeholder="Escribe el aviso para todo el equipo..." />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={form.fijado} onChange={(e) => setForm({ ...form, fijado: e.target.checked })} className="w-4 h-4" /> Fijar arriba (importante)</label>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="flex items-center gap-1.5 px-4 py-2 text-xs text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: "#1a3a6b" }}><Check size={13} /> Publicar</button>
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg">Cancelar</button>
          </div>
        </form>
      )}

      {comunicados.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">Aún no hay comunicados. Publica el primero.</div>
      ) : (
        <div className="space-y-3">
          {comunicados.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    {c.fijado && <Pin size={13} style={{ color: "#d97706" }} />}{c.titulo}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{c.mensaje}</p>
                  <p className="text-xs text-gray-400 mt-2">{c.autor} · {fmt(c.createdAt)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => toggleFijado(c)} title={c.fijado ? "Quitar fijado" : "Fijar arriba"} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg">
                    {c.fijado ? <PinOff size={14} /> : <Pin size={14} />}
                  </button>
                  <button onClick={() => eliminar(c.id)} title="Eliminar" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
