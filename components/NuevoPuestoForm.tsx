"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Dep = { id: number; nombre: string };

export default function NuevoPuestoForm({ departamentos }: { departamentos: Dep[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    codigo: "",
    objetivo: "",
    titular: "",
    reportaA: "",
    supervisaA: "",
    horario: "Lun-Vie 9:00-18:00 / Sab 9:00-13:00",
    escolaridad: "Licenciatura titulada",
    experiencia: "",
    edadMin: "25",
    edadMax: "50",
    tiempoAdaptacion: "3 meses",
    periodicidad: "Mensual",
    herramientas: "",
    formacion: "",
    competencias: "",
    estado: "pendiente",
    departamentoId: String(departamentos[0]?.id ?? ""),
  });

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/puestos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, edadMin: Number(form.edadMin), edadMax: Number(form.edadMax), departamentoId: Number(form.departamentoId) }),
    });
    const created = await res.json();
    router.push(`/puestos/${created.id}`);
  }

  const field = (label: string, key: string, opts?: { type?: string; textarea?: boolean; placeholder?: string }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">{label}</label>
      {opts?.textarea ? (
        <textarea
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
          rows={3}
          value={(form as Record<string, string>)[key]}
          onChange={(e) => set(key, e.target.value)}
          placeholder={opts.placeholder}
        />
      ) : (
        <input
          type={opts?.type ?? "text"}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
          value={(form as Record<string, string>)[key]}
          onChange={(e) => set(key, e.target.value)}
          placeholder={opts?.placeholder}
        />
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-medium text-gray-700">Identificación</h2>
        <div className="grid grid-cols-2 gap-4">
          {field("Nombre del puesto *", "nombre", { placeholder: "ej. Gerente de Operación" })}
          {field("Código", "codigo", { placeholder: "ej. DP-GSL-005" })}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Departamento *</label>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={form.departamentoId}
              onChange={(e) => set("departamentoId", e.target.value)}
            >
              {departamentos.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Estado</label>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={form.estado}
              onChange={(e) => set("estado", e.target.value)}
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En proceso</option>
              <option value="activo">Activo</option>
            </select>
          </div>
        </div>
        {field("Objetivo del puesto", "objetivo", { textarea: true, placeholder: "Describe el propósito principal del puesto..." })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-medium text-gray-700">Perfil y estructura</h2>
        <div className="grid grid-cols-2 gap-4">
          {field("Titular", "titular", { placeholder: "Nombre de quien ocupa el puesto" })}
          {field("Reporta a", "reportaA", { placeholder: "ej. Director General" })}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {field("Supervisa a", "supervisaA", { placeholder: "ej. Coordinador de Área" })}
          {field("Horario", "horario" )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {field("Escolaridad mínima", "escolaridad")}
          {field("Experiencia requerida", "experiencia", { placeholder: "ej. 5 años en mantenimiento" })}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {field("Edad mínima", "edadMin", { type: "number" })}
          {field("Edad máxima", "edadMax", { type: "number" })}
          {field("Tiempo de adaptación", "tiempoAdaptacion", { placeholder: "ej. 3 meses" })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-medium text-gray-700">Formación y herramientas</h2>
        {field("Formación deseable", "formacion", { textarea: true, placeholder: "Conocimientos teóricos, técnicos y normativos..." })}
        {field("Herramientas de trabajo", "herramientas", { placeholder: "ej. Office, CRM, Celular" })}
        {field("Competencias (separadas por coma)", "competencias", { placeholder: "ej. Liderazgo, Negociación, Trabajo en equipo" })}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Periodicidad de medición</label>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={form.periodicidad}
            onChange={(e) => set("periodicidad", e.target.value)}
          >
            {["Mensual", "Bimestral", "Trimestral", "Semestral", "Anual"].map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !form.nombre}
          className="px-6 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Guardando..." : "Crear puesto"}
        </button>
      </div>
    </form>
  );
}
