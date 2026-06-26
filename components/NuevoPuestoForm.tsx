"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

type Dep = { id: number; nombre: string };
type Tarea = { nombre: string; descripcion: string; frecuencia: string; tiempoHoras: number };

const FRECUENCIAS = ["Diaria", "Semanal", "Quincenal", "Mensual", "Eventual"];

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

  const [tareas, setTareas] = useState<Tarea[]>([
    { nombre: "", descripcion: "", frecuencia: "Diaria", tiempoHoras: 1 },
  ]);

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function addTarea() {
    setTareas((t) => [...t, { nombre: "", descripcion: "", frecuencia: "Diaria", tiempoHoras: 1 }]);
  }

  function removeTarea(i: number) {
    setTareas((t) => t.filter((_, idx) => idx !== i));
  }

  function setTarea(i: number, key: keyof Tarea, val: string | number) {
    setTareas((t) => t.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/puestos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        edadMin: Number(form.edadMin),
        edadMax: Number(form.edadMax),
        departamentoId: Number(form.departamentoId),
        tareas: tareas.filter((t) => t.nombre.trim()),
      }),
    });
    const created = await res.json();
    router.push(`/puestos/${created.id}`);
  }

  const field = (label: string, key: string, opts?: { type?: string; textarea?: boolean; placeholder?: string; required?: boolean }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">{label}{opts?.required && <span className="text-red-400 ml-0.5">*</span>}</label>
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
      {/* Identificación */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-medium text-gray-700">Identificación</h2>
        <div className="grid grid-cols-2 gap-4">
          {field("Nombre del puesto", "nombre", { placeholder: "ej. Gerente de Operación", required: true })}
          {field("Código", "codigo", { placeholder: "ej. DP-GSL-005" })}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Departamento <span className="text-red-400">*</span></label>
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

      {/* Tareas y Actividades */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-700">Tareas y Actividades</h2>
            <p className="text-xs text-gray-400 mt-0.5">Describe cada actividad que realizas en tu puesto, cómo la desarrollas y con qué frecuencia</p>
          </div>
          <button
            type="button"
            onClick={addTarea}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            <Plus size={13} /> Agregar tarea
          </button>
        </div>

        <div className="space-y-4">
          {tareas.map((tarea, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tarea {i + 1}</span>
                {tareas.length > 1 && (
                  <button type="button" onClick={() => removeTarea(i)} className="text-gray-300 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500">¿Qué actividad realizas? <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="ej. Atención a clientes, elaboración de reportes, seguimiento de pólizas..."
                  value={tarea.nombre}
                  onChange={(e) => setTarea(i, "nombre", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">¿Cómo la desarrollas?</label>
                <textarea
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  rows={2}
                  placeholder="Describe el proceso paso a paso, herramientas que usas, con quién interactúas..."
                  value={tarea.descripcion}
                  onChange={(e) => setTarea(i, "descripcion", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Frecuencia</label>
                  <select
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={tarea.frecuencia}
                    onChange={(e) => setTarea(i, "frecuencia", e.target.value)}
                  >
                    {FRECUENCIAS.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Tiempo estimado (horas)</label>
                  <input
                    type="number"
                    min={0.25}
                    step={0.25}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={tarea.tiempoHoras}
                    onChange={(e) => setTarea(i, "tiempoHoras", Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Perfil y estructura */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-medium text-gray-700">Perfil y estructura</h2>
        <div className="grid grid-cols-2 gap-4">
          {field("Titular", "titular", { placeholder: "Nombre de quien ocupa el puesto" })}
          {field("Reporta a", "reportaA", { placeholder: "ej. Director General" })}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {field("Supervisa a", "supervisaA", { placeholder: "ej. Coordinador de Área" })}
          {field("Horario", "horario")}
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

      {/* Formación y herramientas */}
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
          className="px-6 py-2 text-sm text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#1a3a6b" }}
        >
          {loading ? "Guardando..." : "Guardar mi información"}
        </button>
      </div>
    </form>
  );
}
