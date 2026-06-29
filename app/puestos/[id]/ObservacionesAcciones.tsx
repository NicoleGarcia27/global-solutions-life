"use client";
import { useState } from "react";
import Link from "next/link";
import { Inbox, Check, ArrowRight, Lightbulb } from "lucide-react";

type Obs = {
  noCorresponden: string;
  nadieHace: string;
  problemas: string;
  comoMide: string;
};

function ConvertibleObs({
  label, texto, origenLabel, color,
}: { label: string; texto: string; origenLabel: string; color: string }) {
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState(texto);
  const [busy, setBusy] = useState(false);
  const [listo, setListo] = useState(false);

  async function crear() {
    if (!nombre.trim()) return;
    setBusy(true);
    await fetch("/api/responsabilidades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, puestoId: null, origen: origenLabel, recurrencia: "Eventual" }),
    });
    setBusy(false);
    setAbierto(false);
    setListo(true);
  }

  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{texto}</p>

      {listo ? (
        <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1.5">
          <Check size={13} /> Agregada al Banco de tareas.
          <Link href="/admin/banco" className="underline">Ir al Banco →</Link>
        </p>
      ) : abierto ? (
        <div className="mt-2 border border-purple-200 rounded-lg p-3 bg-purple-50">
          <p className="text-xs text-purple-700 mb-1.5">Edita el texto como un nombre de tarea claro y mándala al Banco:</p>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none"
            rows={2}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <button onClick={crear} disabled={busy || !nombre.trim()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: "#7c3aed" }}>
              <Inbox size={13} /> Mandar al Banco
            </button>
            <button onClick={() => { setAbierto(false); setNombre(texto); }} className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg">Cancelar</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAbierto(true)}
          className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border"
          style={{ color, borderColor: color + "55", backgroundColor: color + "11" }}
        >
          <ArrowRight size={13} /> Convertir en tarea (al Banco)
        </button>
      )}
    </div>
  );
}

export default function ObservacionesAcciones({ obs, origenLabel }: { obs: Obs; origenLabel: string }) {
  return (
    <div className="space-y-5">
      {obs.noCorresponden && (
        <ConvertibleObs label="Tareas que considera que NO le corresponden" texto={obs.noCorresponden} origenLabel={origenLabel} color="#dc2626" />
      )}
      {obs.nadieHace && (
        <ConvertibleObs label="Tareas que nadie hace pero deberían hacerse" texto={obs.nadieHace} origenLabel={origenLabel} color="#d97706" />
      )}
      {obs.problemas && (
        <div>
          <p className="text-xs text-gray-400 mb-1">Problemas frecuentes en su trabajo</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{obs.problemas}</p>
          <p className="text-[11px] text-gray-400 mt-1">Información de contexto — para mejorar procesos del área.</p>
        </div>
      )}
      {obs.comoMide && (
        <div>
          <p className="text-xs text-gray-400 mb-1">¿Cómo mide que hizo bien su trabajo?</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{obs.comoMide}</p>
          <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
            <Lightbulb size={11} /> Útil para definir los KPIs de este puesto.
          </p>
        </div>
      )}
    </div>
  );
}
