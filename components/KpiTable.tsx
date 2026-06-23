"use client";
import { useState } from "react";
import { Plus, Check, X } from "lucide-react";

type Kpi = {
  id: number;
  area: string;
  metrica: string;
  meta: string;
  actual: string;
  unidad: string;
  frecuencia: string;
  estado: string;
};

const estadoMap: Record<string, { label: string; cls: string; dot: string }> = {
  verde: { label: "Verde", cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  amarillo: { label: "Amarillo", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-400" },
  rojo: { label: "Rojo", cls: "bg-red-100 text-red-700", dot: "bg-red-500" },
  pendiente: { label: "Sin dato", cls: "bg-gray-100 text-gray-500", dot: "bg-gray-300" },
};

export default function KpiTable({ kpis: initial, puestoId }: { kpis: Kpi[]; puestoId: number }) {
  const [kpis, setKpis] = useState<Kpi[]>(initial);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ area: "", metrica: "", meta: "", unidad: "%", frecuencia: "Mensual" });
  const [editId, setEditId] = useState<number | null>(null);
  const [editActual, setEditActual] = useState("");

  async function saveKpi() {
    if (!form.area || !form.metrica || !form.meta) return;
    const res = await fetch("/api/kpis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, puestoId }),
    });
    const created = await res.json();
    setKpis([...kpis, created]);
    setForm({ area: "", metrica: "", meta: "", unidad: "%", frecuencia: "Mensual" });
    setAdding(false);
  }

  async function updateActual(kpi: Kpi) {
    const metaNum = parseFloat(kpi.meta);
    const actualNum = parseFloat(editActual);
    let estado = "pendiente";
    if (!isNaN(metaNum) && !isNaN(actualNum)) {
      const isLessIsBetter = kpi.area.toLowerCase().includes("variación") || kpi.area.toLowerCase().includes("desviación");
      if (isLessIsBetter) {
        estado = actualNum <= metaNum ? "verde" : actualNum <= metaNum * 1.5 ? "amarillo" : "rojo";
      } else {
        const pct = actualNum / metaNum;
        estado = pct >= 1 ? "verde" : pct >= 0.8 ? "amarillo" : "rojo";
      }
    }
    const res = await fetch(`/api/kpis/${kpi.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actual: editActual, estado }),
    });
    const updated = await res.json();
    setKpis(kpis.map((k) => (k.id === updated.id ? updated : k)));
    setEditId(null);
  }

  async function deleteKpi(id: number) {
    await fetch(`/api/kpis/${id}`, { method: "DELETE" });
    setKpis(kpis.filter((k) => k.id !== id));
  }

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
            <th className="text-left px-4 py-2 font-medium">Área</th>
            <th className="text-left px-4 py-2 font-medium">Métrica</th>
            <th className="text-left px-4 py-2 font-medium">Meta</th>
            <th className="text-left px-4 py-2 font-medium">Actual</th>
            <th className="text-left px-4 py-2 font-medium">Frecuencia</th>
            <th className="text-left px-4 py-2 font-medium">Estado</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {kpis.map((k) => {
            const st = estadoMap[k.estado] ?? estadoMap.pendiente;
            return (
              <tr key={k.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-xs text-gray-500 font-medium">{k.area}</td>
                <td className="px-4 py-3 text-gray-700">{k.metrica}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{k.meta} {k.unidad}</td>
                <td className="px-4 py-3">
                  {editId === k.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        className="w-16 border border-gray-300 rounded px-1.5 py-1 text-xs"
                        value={editActual}
                        onChange={(e) => setEditActual(e.target.value)}
                        autoFocus
                      />
                      <button onClick={() => updateActual(k)} className="text-emerald-600 hover:text-emerald-800">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditId(k.id); setEditActual(k.actual); }}
                      className="text-gray-700 hover:text-emerald-600 hover:underline text-left"
                    >
                      {k.actual ? `${k.actual} ${k.unidad}` : <span className="text-gray-300">Clic para ingresar</span>}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{k.frecuencia}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    {st.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteKpi(k.id)} className="text-gray-300 hover:text-red-500">
                    <X size={14} />
                  </button>
                </td>
              </tr>
            );
          })}

          {adding && (
            <tr className="border-b border-emerald-100 bg-emerald-50">
              <td className="px-4 py-2">
                <input className="w-full border border-gray-300 rounded px-2 py-1 text-xs" placeholder="Área" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
              </td>
              <td className="px-4 py-2">
                <input className="w-full border border-gray-300 rounded px-2 py-1 text-xs" placeholder="Métrica" value={form.metrica} onChange={(e) => setForm({ ...form, metrica: e.target.value })} />
              </td>
              <td className="px-4 py-2">
                <input className="w-20 border border-gray-300 rounded px-2 py-1 text-xs" placeholder="Meta" value={form.meta} onChange={(e) => setForm({ ...form, meta: e.target.value })} />
              </td>
              <td className="px-4 py-2">
                <input className="w-16 border border-gray-300 rounded px-2 py-1 text-xs" placeholder="%" value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })} />
              </td>
              <td className="px-4 py-2">
                <select className="border border-gray-300 rounded px-2 py-1 text-xs" value={form.frecuencia} onChange={(e) => setForm({ ...form, frecuencia: e.target.value })}>
                  {["Diario", "Semanal", "Mensual", "Trimestral", "Semestral", "Anual", "A demanda"].map((f) => <option key={f}>{f}</option>)}
                </select>
              </td>
              <td colSpan={2} className="px-4 py-2">
                <div className="flex gap-2">
                  <button onClick={saveKpi} className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700">Guardar</button>
                  <button onClick={() => setAdding(false)} className="px-3 py-1 text-gray-500 text-xs hover:text-gray-700">Cancelar</button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {!adding && (
        <div className="px-4 py-3 border-t border-gray-100">
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700"
          >
            <Plus size={14} /> Agregar KPI
          </button>
        </div>
      )}
    </div>
  );
}
