"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Inbox, Trash2, ArrowRight } from "lucide-react";

type Tarea = { id: number; nombre: string; descripcion: string; recurrencia: string; tiempoHoras: number; origen: string };
type Puesto = { id: number; nombre: string; titular: string; usuarioNombre: string | null };

export default function BancoClient({ tareas, puestos }: { tareas: Tarea[]; puestos: Puesto[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);

  async function asignar(id: number, puestoId: number) {
    setBusy(true);
    await fetch(`/api/responsabilidades/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ puestoId, origen: "" }),
    });
    setBusy(false);
    setOpenId(null);
    router.refresh();
  }

  async function eliminar(id: number) {
    if (!confirm("¿Eliminar esta tarea del banco? No se puede deshacer.")) return;
    setBusy(true);
    await fetch(`/api/responsabilidades/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Inbox size={20} style={{ color: "#7c3aed" }} /> Banco de tareas
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Tareas que los empleados realizan pero que no son de su área. Asígnalas al puesto correcto o usa esta lista para crear puestos nuevos.
        </p>
      </div>

      {/* Guía */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-800">
        <p className="font-medium mb-1">¿Cómo crear un puesto nuevo desde aquí?</p>
        <ol className="text-xs text-purple-700 list-decimal list-inside space-y-0.5">
          <li>Ve a <a href="/puestos" className="underline font-medium">Puestos</a> → botón &quot;Crear puesto / vacante&quot;</li>
          <li>Regresa al Banco y asigna estas tareas al puesto que creaste</li>
        </ol>
      </div>

      {tareas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
          El banco está vacío. Las tareas que marques como &quot;No es de su área&quot; aparecerán aquí.
        </div>
      ) : (
        <div className="space-y-3">
          {tareas.map((t) => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{t.nombre}</p>
                  {t.descripcion && <p className="text-xs text-gray-500 mt-1">{t.descripcion}</p>}
                  <div className="flex flex-wrap gap-2 mt-2 items-center">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{t.recurrencia}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{t.tiempoHoras}h</span>
                    {t.origen && <span className="text-xs text-gray-400">· venía de: {t.origen}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setOpenId(openId === t.id ? null : t.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg"
                    style={{ backgroundColor: "#1a3a6b" }}
                  >
                    <ArrowRight size={13} /> Asignar a puesto
                  </button>
                  <button onClick={() => eliminar(t.id)} className="px-2.5 py-1.5 text-xs text-gray-400 border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {openId === t.id && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-600 mb-2">Asignar a:</p>
                  {puestos.length === 0 ? (
                    <p className="text-xs text-gray-400">No hay puestos. Crea uno en <a href="/puestos" className="underline">Puestos</a>.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {puestos.map((p) => (
                        <button key={p.id} onClick={() => asignar(t.id, p.id)} disabled={busy} className="text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 text-gray-700">
                          {p.nombre}{p.usuarioNombre ? ` · ${p.usuarioNombre}` : p.titular ? ` · ${p.titular}` : " · Vacante"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
