"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Briefcase } from "lucide-react";

type Dep = { id: number; nombre: string };

export default function CrearPuestoButton({ departamentos }: { departamentos: Dep[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    departamentoId: String(departamentos[0]?.id ?? ""),
    titular: "",
    objetivo: "",
  });

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    setBusy(true);
    const res = await fetch("/api/puestos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        departamentoId: form.departamentoId ? Number(form.departamentoId) : null,
        vacante: true,
        estado: "pendiente",
        tareas: [],
      }),
    });
    const created = await res.json();
    setBusy(false);
    setOpen(false);
    if (created?.id) router.push(`/puestos/${created.id}`);
    else router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg"
        style={{ backgroundColor: "#1a3a6b" }}
      >
        <Plus size={15} /> Crear puesto / vacante
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Briefcase size={18} style={{ color: "#1a3a6b" }} /> Nuevo puesto
              </h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <p className="text-xs text-gray-400 mb-5">Crea un puesto institucional. Déjalo sin titular si es una <strong>vacante futura</strong> — luego podrás moverle tareas.</p>

            <form onSubmit={crear} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-medium">Nombre del puesto <span className="text-red-400">*</span></label>
                <input
                  type="text" required autoFocus
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ej. Coordinador de Cobranza"
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Departamento</label>
                <select
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.departamentoId}
                  onChange={(e) => setForm((f) => ({ ...f, departamentoId: e.target.value }))}
                >
                  {departamentos.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Titular <span className="text-gray-300">(dejar vacío si es vacante)</span></label>
                <input
                  type="text"
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre de quien lo ocupa (opcional)"
                  value={form.titular}
                  onChange={(e) => setForm((f) => ({ ...f, titular: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Objetivo del puesto</label>
                <textarea
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                  placeholder="¿Para qué existe este puesto? (opcional)"
                  value={form.objetivo}
                  onChange={(e) => setForm((f) => ({ ...f, objetivo: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={busy || !form.nombre.trim()} className="flex-1 px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 font-medium" style={{ backgroundColor: "#1a3a6b" }}>
                  {busy ? "Creando..." : "Crear puesto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
