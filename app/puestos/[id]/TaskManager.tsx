"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Check, X, ArrowRightLeft, Inbox, CheckCircle2 } from "lucide-react";

type Tarea = {
  id: number;
  nombre: string;
  descripcion: string;
  recurrencia: string;
  tiempoHoras: number;
  estado: string;
};

type OtroPuesto = { id: number; nombre: string; titular: string; usuarioNombre: string | null };

const FRECUENCIAS = ["Diaria", "Semanal", "Quincenal", "Mensual", "Eventual"];

export default function TaskManager({
  puestoId,
  tareas,
  otrosPuestos,
  origenLabel,
}: {
  puestoId: number;
  tareas: Tarea[];
  otrosPuestos: OtroPuesto[];
  origenLabel: string;
}) {
  const router = useRouter();
  const [editId, setEditId] = useState<number | null>(null);
  const [reassignId, setReassignId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Tarea | null>(null);
  const [adding, setAdding] = useState(false);
  const [nueva, setNueva] = useState({ nombre: "", descripcion: "", recurrencia: "Diaria", tiempoHoras: 1 });

  async function patch(id: number, data: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/responsabilidades/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setBusy(false);
    router.refresh();
  }

  function startEdit(t: Tarea) {
    setEditId(t.id);
    setDraft({ ...t });
    setReassignId(null);
  }

  async function guardarEdit() {
    if (!draft) return;
    await patch(draft.id, {
      nombre: draft.nombre,
      descripcion: draft.descripcion,
      recurrencia: draft.recurrencia,
      tiempoHoras: draft.tiempoHoras,
    });
    setEditId(null);
    setDraft(null);
  }

  async function toggleConfirmar(t: Tarea) {
    await patch(t.id, { estado: t.estado === "confirmada" ? "pendiente" : "confirmada" });
  }

  async function eliminar(id: number) {
    if (!confirm("¿Eliminar esta tarea por completo? No se puede deshacer.")) return;
    setBusy(true);
    await fetch(`/api/responsabilidades/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  async function alBanco(id: number) {
    await patch(id, { puestoId: null, estado: "pendiente", origen: origenLabel });
  }

  async function reasignar(id: number, nuevoPuestoId: number) {
    await patch(id, { puestoId: nuevoPuestoId, origen: "" });
    setReassignId(null);
  }

  async function agregar() {
    if (!nueva.nombre.trim()) return;
    setBusy(true);
    await fetch(`/api/responsabilidades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...nueva, puestoId }),
    });
    setNueva({ nombre: "", descripcion: "", recurrencia: "Diaria", tiempoHoras: 1 });
    setAdding(false);
    setBusy(false);
    router.refresh();
  }

  const confirmadas = tareas.filter((t) => t.estado === "confirmada").length;

  const btn = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors";

  return (
    <div className="space-y-3">
      {tareas.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <CheckCircle2 size={14} className="text-emerald-500" />
          {confirmadas} de {tareas.length} tareas confirmadas como propias del puesto
        </div>
      )}

      {tareas.map((t, i) => {
        const confirmada = t.estado === "confirmada";
        return (
          <div key={t.id} className={`border rounded-lg p-4 ${confirmada ? "border-emerald-200 bg-emerald-50/40" : "border-gray-200 bg-white"}`}>
            {editId === t.id && draft ? (
              // EDICIÓN
              <div className="space-y-2">
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={draft.nombre}
                  onChange={(e) => setDraft({ ...draft, nombre: e.target.value })}
                  placeholder="Nombre de la tarea"
                />
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  rows={2}
                  value={draft.descripcion}
                  onChange={(e) => setDraft({ ...draft, descripcion: e.target.value })}
                  placeholder="¿Cómo se desarrolla?"
                />
                <div className="flex gap-2 flex-wrap">
                  <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm" value={draft.recurrencia} onChange={(e) => setDraft({ ...draft, recurrencia: e.target.value })}>
                    {FRECUENCIAS.map((f) => <option key={f}>{f}</option>)}
                  </select>
                  <input type="number" min={0.25} step={0.25} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-24" value={draft.tiempoHoras} onChange={(e) => setDraft({ ...draft, tiempoHoras: Number(e.target.value) })} />
                  <span className="text-xs text-gray-400 self-center">horas</span>
                  <div className="flex-1" />
                  <button onClick={guardarEdit} disabled={busy} className={`${btn} text-white border-transparent`} style={{ backgroundColor: "#1a3a6b" }}>
                    <Check size={13} /> Guardar
                  </button>
                  <button onClick={() => { setEditId(null); setDraft(null); }} className={`${btn} text-gray-500 border-gray-200`}>
                    <X size={13} /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              // LECTURA
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      <span className="text-gray-400 mr-2">T{i + 1}.</span>{t.nombre}
                    </p>
                    {t.descripcion && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t.descripcion}</p>}
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{t.recurrencia}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{t.tiempoHoras}h</span>
                    </div>
                  </div>
                  {confirmada && (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                      <Check size={12} /> Le corresponde
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => toggleConfirmar(t)}
                    className={`${btn} ${confirmada ? "border-gray-200 text-gray-500 hover:bg-gray-50" : "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"}`}
                  >
                    <Check size={13} /> {confirmada ? "Quitar palomita" : "Sí le corresponde"}
                  </button>
                  <button onClick={() => { setReassignId(reassignId === t.id ? null : t.id); setEditId(null); }} className={`${btn} border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100`}>
                    <ArrowRightLeft size={13} /> Reasignar
                  </button>
                  <button onClick={() => alBanco(t.id)} className={`${btn} border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100`}>
                    <Inbox size={13} /> No es de su área
                  </button>
                  <div className="flex-1" />
                  <button onClick={() => startEdit(t)} className={`${btn} border-gray-200 text-gray-500 hover:bg-gray-50`}>
                    <Pencil size={13} /> Editar
                  </button>
                  <button onClick={() => eliminar(t.id)} className={`${btn} border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200`}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </>
            )}

            {/* Reasignar */}
            {reassignId === t.id && (
              <div className="mt-3 pt-3 border-t border-gray-100 bg-amber-50 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
                <p className="text-xs font-medium text-amber-800 mb-2 flex items-center gap-1">
                  <ArrowRightLeft size={12} /> Mover esta tarea al puesto de:
                </p>
                {otrosPuestos.length === 0 ? (
                  <p className="text-xs text-gray-500">No hay otros puestos. Crea uno en <a href="/puestos" className="underline font-medium">Puestos</a> y regresa.</p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {otrosPuestos.map((op) => (
                        <button key={op.id} onClick={() => reasignar(t.id, op.id)} disabled={busy} className="text-xs px-3 py-1.5 bg-white border border-amber-200 rounded-lg hover:bg-amber-100 text-amber-800">
                          {op.nombre}{op.usuarioNombre ? ` · ${op.usuarioNombre}` : op.titular ? ` · ${op.titular}` : " · Vacante"}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-amber-600 mt-2">¿No aparece el puesto? Créalo en <a href="/puestos" className="underline font-medium">Puestos</a> y regresa.</p>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Agregar nueva tarea */}
      {adding ? (
        <div className="border-2 border-dashed rounded-lg p-4 space-y-2" style={{ borderColor: "#9bdcec", backgroundColor: "#f0fbfd" }}>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
            value={nueva.nombre}
            onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })}
            placeholder="Nombre de la nueva tarea"
            autoFocus
          />
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#00b4d8] resize-none"
            rows={2}
            value={nueva.descripcion}
            onChange={(e) => setNueva({ ...nueva, descripcion: e.target.value })}
            placeholder="¿Cómo se desarrolla? (opcional)"
          />
          <div className="flex gap-2 flex-wrap">
            <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white" value={nueva.recurrencia} onChange={(e) => setNueva({ ...nueva, recurrencia: e.target.value })}>
              {FRECUENCIAS.map((f) => <option key={f}>{f}</option>)}
            </select>
            <input type="number" min={0.25} step={0.25} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-24 bg-white" value={nueva.tiempoHoras} onChange={(e) => setNueva({ ...nueva, tiempoHoras: Number(e.target.value) })} />
            <span className="text-xs text-gray-400 self-center">horas</span>
            <div className="flex-1" />
            <button onClick={agregar} disabled={busy || !nueva.nombre.trim()} className={`${btn} text-white border-transparent disabled:opacity-50`} style={{ backgroundColor: "#1a3a6b" }}>
              <Check size={13} /> Agregar
            </button>
            <button onClick={() => setAdding(false)} className={`${btn} text-gray-500 border-gray-200`}>
              <X size={13} /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-lg border border-dashed w-full justify-center hover:bg-[#f0fbfd]" style={{ borderColor: "#9bdcec", color: "#0a7d99" }}>
          <Plus size={14} /> Agregar tarea a este puesto
        </button>
      )}
    </div>
  );
}
