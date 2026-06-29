"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Check, X, ArrowRightLeft } from "lucide-react";

type Tarea = {
  id: number;
  nombre: string;
  descripcion: string;
  recurrencia: string;
  tiempoHoras: number;
};

type OtroPuesto = { id: number; nombre: string; titular: string; usuarioNombre: string | null };

const FRECUENCIAS = ["Diaria", "Semanal", "Quincenal", "Mensual", "Eventual"];

export default function TaskManager({
  puestoId,
  tareas,
  otrosPuestos,
}: {
  puestoId: number;
  tareas: Tarea[];
  otrosPuestos: OtroPuesto[];
}) {
  const router = useRouter();
  const [editId, setEditId] = useState<number | null>(null);
  const [reassignId, setReassignId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Tarea | null>(null);
  const [adding, setAdding] = useState(false);
  const [nueva, setNueva] = useState({ nombre: "", descripcion: "", recurrencia: "Diaria", tiempoHoras: 1 });

  function startEdit(t: Tarea) {
    setEditId(t.id);
    setDraft({ ...t });
    setReassignId(null);
  }

  async function guardarEdit() {
    if (!draft) return;
    setBusy(true);
    await fetch(`/api/responsabilidades/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: draft.nombre,
        descripcion: draft.descripcion,
        recurrencia: draft.recurrencia,
        tiempoHoras: draft.tiempoHoras,
      }),
    });
    setEditId(null);
    setDraft(null);
    setBusy(false);
    router.refresh();
  }

  async function eliminar(id: number) {
    if (!confirm("¿Eliminar esta tarea? No se puede deshacer.")) return;
    setBusy(true);
    await fetch(`/api/responsabilidades/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  async function reasignar(id: number, nuevoPuestoId: number) {
    setBusy(true);
    await fetch(`/api/responsabilidades/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ puestoId: nuevoPuestoId }),
    });
    setReassignId(null);
    setBusy(false);
    router.refresh();
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

  return (
    <div className="space-y-3">
      {tareas.map((t, i) => (
        <div key={t.id} className="border border-gray-200 rounded-lg p-4 bg-white">
          {editId === t.id && draft ? (
            // MODO EDICIÓN
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
              <div className="flex gap-2">
                <select
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                  value={draft.recurrencia}
                  onChange={(e) => setDraft({ ...draft, recurrencia: e.target.value })}
                >
                  {FRECUENCIAS.map((f) => <option key={f}>{f}</option>)}
                </select>
                <input
                  type="number" min={0.25} step={0.25}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-24"
                  value={draft.tiempoHoras}
                  onChange={(e) => setDraft({ ...draft, tiempoHoras: Number(e.target.value) })}
                />
                <span className="text-xs text-gray-400 self-center">horas</span>
                <div className="flex-1" />
                <button onClick={guardarEdit} disabled={busy} className="flex items-center gap-1 px-3 py-1.5 text-xs text-white rounded-lg" style={{ backgroundColor: "#1a3a6b" }}>
                  <Check size={13} /> Guardar
                </button>
                <button onClick={() => { setEditId(null); setDraft(null); }} className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg">
                  <X size={13} /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            // MODO LECTURA
            <div className="flex items-start justify-between gap-4">
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
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button onClick={() => startEdit(t)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200">
                  <Pencil size={13} /> Editar
                </button>
                <button onClick={() => { setReassignId(reassignId === t.id ? null : t.id); setEditId(null); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-amber-200 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100">
                  <ArrowRightLeft size={13} /> Reasignar
                </button>
                <button onClick={() => eliminar(t.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>
            </div>
          )}

          {/* Reasignar */}
          {reassignId === t.id && (
            <div className="mt-3 pt-3 border-t border-gray-100 bg-amber-50 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
              <p className="text-xs font-medium text-amber-800 mb-2 flex items-center gap-1">
                <ArrowRightLeft size={12} /> Mover esta tarea al puesto de:
              </p>
              {otrosPuestos.length === 0 ? (
                <p className="text-xs text-gray-500">No hay otros puestos todavía. Crea uno en la sección <a href="/puestos" className="underline font-medium">Puestos</a> y vuelve aquí.</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {otrosPuestos.map((op) => (
                      <button
                        key={op.id}
                        onClick={() => reasignar(t.id, op.id)}
                        disabled={busy}
                        className="text-xs px-3 py-1.5 bg-white border border-amber-200 rounded-lg hover:bg-amber-100 text-amber-800"
                      >
                        {op.nombre}{op.usuarioNombre ? ` · ${op.usuarioNombre}` : op.titular ? ` · ${op.titular}` : " · Vacante"}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-amber-600 mt-2">¿No aparece el puesto correcto? Créalo en <a href="/puestos" className="underline font-medium">Puestos</a> (botón &quot;Crear puesto / vacante&quot;) y regresa.</p>
                </>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Agregar nueva tarea */}
      {adding ? (
        <div className="border-2 border-dashed border-emerald-300 rounded-lg p-4 bg-emerald-50/40 space-y-2">
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={nueva.nombre}
            onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })}
            placeholder="Nombre de la nueva tarea"
            autoFocus
          />
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
            rows={2}
            value={nueva.descripcion}
            onChange={(e) => setNueva({ ...nueva, descripcion: e.target.value })}
            placeholder="¿Cómo se desarrolla? (opcional)"
          />
          <div className="flex gap-2">
            <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white" value={nueva.recurrencia} onChange={(e) => setNueva({ ...nueva, recurrencia: e.target.value })}>
              {FRECUENCIAS.map((f) => <option key={f}>{f}</option>)}
            </select>
            <input type="number" min={0.25} step={0.25} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-24 bg-white" value={nueva.tiempoHoras} onChange={(e) => setNueva({ ...nueva, tiempoHoras: Number(e.target.value) })} />
            <span className="text-xs text-gray-400 self-center">horas</span>
            <div className="flex-1" />
            <button onClick={agregar} disabled={busy || !nueva.nombre.trim()} className="flex items-center gap-1 px-3 py-1.5 text-xs text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: "#1a3a6b" }}>
              <Check size={13} /> Agregar
            </button>
            <button onClick={() => setAdding(false)} className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg">
              <X size={13} /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-lg border border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50 w-full justify-center"
        >
          <Plus size={14} /> Agregar tarea a este puesto
        </button>
      )}
    </div>
  );
}
