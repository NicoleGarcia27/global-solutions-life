"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, Save } from "lucide-react";

type Props = {
  puesto: {
    id: number;
    estado: string;
    adminNotas: string;
    escolaridad: string;
    experiencia: string;
    competencias: string;
    formacion: string;
    periodicidad: string;
    edadMin: number;
    edadMax: number;
    tiempoAdaptacion: string;
    codigo: string;
  };
};

export default function AdminRevision({ puesto }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    estado: puesto.estado,
    adminNotas: puesto.adminNotas,
    escolaridad: puesto.escolaridad,
    experiencia: puesto.experiencia,
    competencias: puesto.competencias,
    formacion: puesto.formacion,
    periodicidad: puesto.periodicidad,
    edadMin: puesto.edadMin,
    edadMax: puesto.edadMax,
    tiempoAdaptacion: puesto.tiempoAdaptacion,
    codigo: puesto.codigo,
  });

  function set(key: string, val: string | number) {
    setForm((f) => ({ ...f, [key]: val }));
    setSaved(false);
  }

  async function guardar() {
    setSaving(true);
    await fetch(`/api/puestos/${puesto.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <h2 className="text-sm font-semibold text-amber-800">Panel de revisión — solo visible para administradoras</h2>
        </div>
        <button
          onClick={guardar}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-1.5 text-xs text-white rounded-lg disabled:opacity-50 font-medium"
          style={{ backgroundColor: "#1a3a6b" }}
        >
          {saved ? <><CheckCircle size={12} /> Guardado</> : saving ? <><Clock size={12} /> Guardando...</> : <><Save size={12} /> Guardar cambios</>}
        </button>
      </div>

      {/* Estado */}
      <div>
        <label className="text-xs text-amber-700 font-medium">Estado de revisión</label>
        <div className="flex gap-2 mt-1.5">
          {[
            { val: "pendiente", label: "Pendiente" },
            { val: "en_proceso", label: "En revisión" },
            { val: "activo", label: "Revisado ✓" },
          ].map((opt) => (
            <button
              key={opt.val}
              type="button"
              onClick={() => set("estado", opt.val)}
              className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                form.estado === opt.val
                  ? opt.val === "activo" ? "bg-emerald-600 text-white border-emerald-600"
                    : opt.val === "en_proceso" ? "bg-amber-500 text-white border-amber-500"
                    : "bg-gray-600 text-white border-gray-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notas admin */}
      <div>
        <label className="text-xs text-amber-700 font-medium">Notas de auditoría (internas)</label>
        <textarea
          className="mt-1 w-full border border-amber-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
          rows={3}
          placeholder="Escribe aquí tus observaciones, tareas a quitar, tareas a agregar, decisiones tomadas..."
          value={form.adminNotas}
          onChange={(e) => set("adminNotas", e.target.value)}
        />
      </div>

      {/* Campos que solo admin define */}
      <div>
        <p className="text-xs text-amber-700 font-medium mb-2">Requisitos del puesto (tú los defines)</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Código del puesto</label>
            <input type="text" className="mt-1 w-full border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-sm focus:outline-none" value={form.codigo} onChange={(e) => set("codigo", e.target.value)} placeholder="ej. DP-GSL-005" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Escolaridad mínima requerida</label>
            <input type="text" className="mt-1 w-full border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-sm focus:outline-none" value={form.escolaridad} onChange={(e) => set("escolaridad", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Experiencia requerida</label>
            <input type="text" className="mt-1 w-full border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-sm focus:outline-none" value={form.experiencia} onChange={(e) => set("experiencia", e.target.value)} placeholder="ej. 2 años en seguros" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Tiempo de adaptación</label>
            <input type="text" className="mt-1 w-full border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-sm focus:outline-none" value={form.tiempoAdaptacion} onChange={(e) => set("tiempoAdaptacion", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Edad mínima</label>
            <input type="number" className="mt-1 w-full border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-sm focus:outline-none" value={form.edadMin} onChange={(e) => set("edadMin", Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Edad máxima</label>
            <input type="number" className="mt-1 w-full border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-sm focus:outline-none" value={form.edadMax} onChange={(e) => set("edadMax", Number(e.target.value))} />
          </div>
        </div>
        <div className="mt-3">
          <label className="text-xs text-gray-500">Competencias requeridas (separadas por coma)</label>
          <input type="text" className="mt-1 w-full border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-sm focus:outline-none" value={form.competencias} onChange={(e) => set("competencias", e.target.value)} placeholder="ej. Liderazgo, Negociación, Seguros de vida" />
        </div>
        <div className="mt-3">
          <label className="text-xs text-gray-500">Formación deseable</label>
          <textarea className="mt-1 w-full border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-sm focus:outline-none resize-none" rows={2} value={form.formacion} onChange={(e) => set("formacion", e.target.value)} />
        </div>
      </div>
    </div>
  );
}
