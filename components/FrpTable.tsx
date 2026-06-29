"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";

type Resp = {
  id: number;
  nombre: string;
  tiempoHoras: number;
  recurrencia: string;
  nivel: string;
  orden: number;
};

const nivelCls: Record<string, string> = {
  Alto: "bg-red-100 text-red-700",
  Medio: "bg-amber-100 text-amber-700",
  Bajo: "bg-blue-100 text-blue-700",
};

function formatHoras(h: number) {
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h >= 160) return `${Math.round(h / 160)} mes(es)`;
  return `${h} h`;
}

export default function FrpTable({ responsabilidades: initial, puestoId }: { responsabilidades: Resp[]; puestoId: number }) {
  const [items, setItems] = useState<Resp[]>(initial);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ nombre: "", tiempoHoras: "1", recurrencia: "Mensual", nivel: "Medio" });

  async function save() {
    if (!form.nombre) return;
    const res = await fetch("/api/responsabilidades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tiempoHoras: parseFloat(form.tiempoHoras), puestoId, orden: items.length + 1 }),
    });
    const created = await res.json();
    setItems([...items, created]);
    setForm({ nombre: "", tiempoHoras: "1", recurrencia: "Mensual", nivel: "Medio" });
    setAdding(false);
  }

  async function remove(id: number) {
    await fetch(`/api/responsabilidades/${id}`, { method: "DELETE" });
    setItems(items.filter((i) => i.id !== id));
  }

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
            <th className="text-left px-4 py-2 font-medium w-8">#</th>
            <th className="text-left px-4 py-2 font-medium">Responsabilidad</th>
            <th className="text-left px-4 py-2 font-medium">Tiempo estimado</th>
            <th className="text-left px-4 py-2 font-medium">Recurrencia</th>
            <th className="text-left px-4 py-2 font-medium">Nivel</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((r, i) => (
            <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="px-4 py-3 text-xs text-gray-400">R{i + 1}</td>
              <td className="px-4 py-3 text-gray-800">{r.nombre}</td>
              <td className="px-4 py-3 text-gray-600 text-xs">{formatHoras(r.tiempoHoras)}</td>
              <td className="px-4 py-3 text-gray-600 text-xs">{r.recurrencia}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${nivelCls[r.nivel] ?? "bg-gray-100 text-gray-500"}`}>
                  {r.nivel}
                </span>
              </td>
              <td className="px-4 py-3">
                <button onClick={() => remove(r.id)} className="text-gray-300 hover:text-red-500">
                  <X size={14} />
                </button>
              </td>
            </tr>
          ))}

          {adding && (
            <tr className="border-b border-[#cdeef6] bg-[#eef7fb]">
              <td className="px-4 py-2 text-xs text-gray-400">R{items.length + 1}</td>
              <td className="px-4 py-2">
                <input className="w-full border border-gray-300 rounded px-2 py-1 text-xs" placeholder="Descripción de la responsabilidad" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} autoFocus />
              </td>
              <td className="px-4 py-2">
                <input className="w-20 border border-gray-300 rounded px-2 py-1 text-xs" placeholder="Horas" type="number" min="0.1" step="0.25" value={form.tiempoHoras} onChange={(e) => setForm({ ...form, tiempoHoras: e.target.value })} />
              </td>
              <td className="px-4 py-2">
                <select className="border border-gray-300 rounded px-2 py-1 text-xs" value={form.recurrencia} onChange={(e) => setForm({ ...form, recurrencia: e.target.value })}>
                  {["Diario", "Semanal", "Mensual", "Trimestral", "Semestral", "Anual", "A demanda"].map((f) => <option key={f}>{f}</option>)}
                </select>
              </td>
              <td className="px-4 py-2">
                <select className="border border-gray-300 rounded px-2 py-1 text-xs" value={form.nivel} onChange={(e) => setForm({ ...form, nivel: e.target.value })}>
                  {["Alto", "Medio", "Bajo"].map((n) => <option key={n}>{n}</option>)}
                </select>
              </td>
              <td className="px-4 py-2">
                <div className="flex gap-2">
                  <button onClick={save} className="px-3 py-1 text-white text-xs rounded-lg hover:brightness-110" style={{ backgroundColor: "#1a3a6b" }}>Guardar</button>
                  <button onClick={() => setAdding(false)} className="text-gray-400 hover:text-gray-600 text-xs">Cancelar</button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {!adding && (
        <div className="px-4 py-3 border-t border-gray-100">
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-sm hover:brightness-110" style={{ color: "#00b4d8" }}>
            <Plus size={14} /> Agregar responsabilidad
          </button>
        </div>
      )}
    </div>
  );
}
