"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronDown } from "lucide-react";

type Dep = { id: number; nombre: string };
type Tarea = { nombre: string; descripcion: string; frecuencia: string; tiempoHoras: number };

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

const FRECUENCIAS = ["Diaria", "Semanal", "Quincenal", "Mensual", "Eventual"];

export default function NuevoPuestoForm({ departamentos }: { departamentos: Dep[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tienePersonal, setTienePersonal] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    objetivo: "",
    titular: "",
    reportaA: "",
    supervisaA: "",
    horario: "Lun-Vie 9:00-18:00 / Sab 9:00-13:00",
    herramientas: "",
    departamentoId: String(departamentos[0]?.id ?? ""),
    // Supervisión
    numPersonasACargo: "",
    comoSupervisa: "",
    comoAudita: "",
    comoEvalua: "",
    autoridadSobre: "",
    // Relaciones
    internoConQuien: "",
    externoConQuien: "",
    // Documentos y decisiones
    documentosQueGenera: "",
    decisionesIndependientes: "",
    decisionesConAutorizacion: "",
    // Situaciones
    tareasNoCorresponden: "",
    tareasQueNadieHace: "",
    problemasFrecuentes: "",
    comoMideSuTrabajo: "",
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
    try {
      const res = await fetch("/api/puestos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tienePersonal,
          departamentoId: form.departamentoId ? Number(form.departamentoId) : null,
          tareas: tareas.filter((t) => t.nombre.trim()),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert("Error al guardar: " + (err.error ?? "intenta de nuevo"));
        setLoading(false);
        return;
      }
      const created = await res.json();
      router.push(`/puestos/${created.id}`);
    } catch {
      alert("Error de conexión, intenta de nuevo");
      setLoading(false);
    }
  }

  const field = (label: string, key: string, opts?: { textarea?: boolean; placeholder?: string; rows?: number }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">{label}</label>
      {opts?.textarea ? (
        <textarea
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00b4d8] resize-none"
          rows={opts.rows ?? 2}
          value={(form as Record<string, string>)[key]}
          onChange={(e) => set(key, e.target.value)}
          placeholder={opts.placeholder}
        />
      ) : (
        <input
          type="text"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
          value={(form as Record<string, string>)[key]}
          onChange={(e) => set(key, e.target.value)}
          placeholder={opts?.placeholder}
        />
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* 1. Identificación */}
      <Section title="Identificación">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Nombre del puesto <span className="text-red-400">*</span></label>
            <input
              type="text"
              required
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
              placeholder="ej. Gerente de Operación"
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Tu nombre completo</label>
            <input
              type="text"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
              placeholder="Nombre de quien ocupa el puesto"
              value={form.titular}
              onChange={(e) => set("titular", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Área / Departamento <span className="text-red-400">*</span></label>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
              value={form.departamentoId}
              onChange={(e) => set("departamentoId", e.target.value)}
            >
              {departamentos.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>
          {field("Horario de trabajo", "horario", { placeholder: "ej. Lun-Vie 9:00-18:00" })}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {field("Reporta a (jefe directo)", "reportaA", { placeholder: "ej. Director General" })}
          {field("Supervisa a (si aplica)", "supervisaA", { placeholder: "ej. Coordinador de Área" })}
        </div>
        {field("Objetivo general de tu puesto", "objetivo", { textarea: true, placeholder: "Describe en tus propias palabras para qué existe tu puesto, cuál es tu función principal en la empresa...", rows: 3 })}
      </Section>

      {/* 2. Tareas y Actividades */}
      <Section title="Tareas y Actividades" subtitle="Describe cada actividad que realizas. Sé lo más detallado posible — esto es la base del FRP.">
        <div className="space-y-4">
          {tareas.map((tarea, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tarea {i + 1}</span>
                {tareas.length > 1 && (
                  <button type="button" onClick={() => removeTarea(i)} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500">¿Qué actividad realizas? <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
                  placeholder="ej. Seguimiento de pólizas, elaboración de reportes, atención a clientes..."
                  value={tarea.nombre}
                  onChange={(e) => setTarea(i, "nombre", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">¿Cómo la desarrollas?</label>
                <textarea
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#00b4d8] resize-none"
                  rows={2}
                  placeholder="Describe el proceso: qué haces primero, qué herramientas usas, con quién interactúas, qué resultado produces..."
                  value={tarea.descripcion}
                  onChange={(e) => setTarea(i, "descripcion", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Frecuencia</label>
                  <select
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
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
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
                    value={tarea.tiempoHoras}
                    onChange={(e) => setTarea(i, "tiempoHoras", Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addTarea}
          className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg border border-dashed w-full justify-center hover:bg-[#e6f8fc]" style={{ borderColor: "#00b4d8", color: "#0a7d99" }}
        >
          <Plus size={13} /> Agregar otra tarea
        </button>
      </Section>

      {/* 3. Personal a cargo */}
      <Section title="Personal a cargo" subtitle="Indica si tienes personas bajo tu supervisión directa">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">¿Tienes personal a tu cargo?</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTienePersonal(true)}
              className={`px-4 py-1.5 rounded-lg text-sm border transition-colors ${tienePersonal ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-medium" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => setTienePersonal(false)}
              className={`px-4 py-1.5 rounded-lg text-sm border transition-colors ${!tienePersonal ? "border-gray-400 bg-gray-100 text-gray-700 font-medium" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              No
            </button>
          </div>
        </div>

        {tienePersonal && (
          <div className="border border-emerald-100 rounded-xl p-4 bg-emerald-50/40 space-y-4 mt-2">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium mb-1">
              <ChevronDown size={13} />
              Detalla cómo ejerces la supervisión
            </div>
            {field("¿Cuántas personas tienes a cargo?", "numPersonasACargo", { placeholder: "ej. 3 personas" })}
            {field("¿Cómo supervisas su trabajo?", "comoSupervisa", { textarea: true, placeholder: "ej. Revisión diaria de actividades, juntas semanales, seguimiento por sistema...", rows: 2 })}
            {field("¿Cómo auditas o revisas la calidad de su trabajo?", "comoAudita", { textarea: true, placeholder: "ej. Revisión de reportes, verificación de expedientes, muestreo de llamadas...", rows: 2 })}
            {field("¿Cómo evalúas su desempeño?", "comoEvalua", { textarea: true, placeholder: "ej. Evaluación mensual, métricas de producción, cumplimiento de metas...", rows: 2 })}
            {field("¿Qué autoridad tienes sobre ellos?", "autoridadSobre", { placeholder: "ej. Puedo asignar tareas, llamar la atención, proponer bonos — pero no contratar ni despedir" })}
          </div>
        )}
      </Section>

      {/* 4. Relaciones de trabajo */}
      <Section title="Relaciones de trabajo" subtitle="Con quién interactúas para realizar tu trabajo">
        {field("Internamente (dentro de la empresa)", "internoConQuien", { textarea: true, placeholder: "ej. Me coordino con Recursos Humanos para altas de empleados, con Contabilidad para facturas...", rows: 2 })}
        {field("Externamente (clientes, proveedores, instituciones)", "externoConQuien", { textarea: true, placeholder: "ej. Atiendo clientes directamente, contacto aseguradoras, trato con notarios...", rows: 2 })}
      </Section>

      {/* 5. Documentos y decisiones */}
      <Section title="Documentos y decisiones" subtitle="Qué produces y hasta dónde llega tu autoridad">
        {field("Documentos o reportes que generas", "documentosQueGenera", { textarea: true, placeholder: "ej. Reportes mensuales, contratos de seguros, cotizaciones, expedientes de clientes...", rows: 2 })}
        {field("Decisiones que puedes tomar de forma independiente", "decisionesIndependientes", { textarea: true, placeholder: "ej. Puedo aprobar descuentos hasta 10%, asignar horarios, aceptar clientes nuevos...", rows: 2 })}
        {field("Decisiones que requieren autorización de tu jefe", "decisionesConAutorizacion", { textarea: true, placeholder: "ej. Cancelación de pólizas, devoluciones, contrataciones, ajustes de precio...", rows: 2 })}
      </Section>

      {/* 6. Herramientas */}
      <Section title="Herramientas de trabajo">
        {field("¿Qué herramientas, sistemas o equipos usas?", "herramientas", { placeholder: "ej. Office, CRM, sistema de pólizas, celular corporativo, vehículo..." })}
      </Section>

      {/* 7. Situaciones del puesto */}
      <Section title="Observaciones del puesto" subtitle="Esta información es muy valiosa para mejorar la estructura del área">
        {field("¿Realizas tareas que crees que NO te corresponden a tu puesto?", "tareasNoCorresponden", { textarea: true, placeholder: "ej. A veces hago funciones de recepcionista, limpieza de archivos de otro departamento...", rows: 2 })}
        {field("¿Hay tareas que nadie hace pero que deberían hacerse en tu área?", "tareasQueNadieHace", { textarea: true, placeholder: "ej. Nadie da seguimiento a clientes que caducan, no hay quien archive documentos...", rows: 2 })}
        {field("¿Cuáles son los problemas más frecuentes que enfrentas en tu trabajo?", "problemasFrecuentes", { textarea: true, placeholder: "ej. Falta de información oportuna, sistemas lentos, falta de protocolo para X situación...", rows: 2 })}
        {field("¿Cómo sabes que hiciste bien tu trabajo? (indicadores propios)", "comoMideSuTrabajo", { textarea: true, placeholder: "ej. Cuando mis clientes renuevan, cuando no hay errores en reportes, cuando cumplo mis citas...", rows: 2 })}
      </Section>

      <div className="flex justify-end gap-3 pb-6">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !form.nombre}
          className="px-6 py-2 text-sm text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          style={{ backgroundColor: "#1a3a6b" }}
        >
          {loading ? "Guardando..." : "Guardar mi información"}
        </button>
      </div>
    </form>
  );
}
