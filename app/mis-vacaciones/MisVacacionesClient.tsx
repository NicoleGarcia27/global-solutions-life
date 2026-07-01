"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Palmtree, Send, Trash2, Clock, CheckCircle2, XCircle, Info } from "lucide-react";

type Solicitud = { id: number; fechaInicio: string; fechaFin: string; dias: number; estado: string; nota: string };
type Datos = { corresponden: number; tomados: number; pendientes: number; disponibles: number; tieneFecha: boolean; solicitudes: Solicitud[] };

const fmt = (s: string) => new Date(`${s}T00:00:00.000Z`).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const BADGE: Record<string, { label: string; bg: string; color: string; Icon: any }> = {
  solicitada: { label: "Pendiente", bg: "#fef9e7", color: "#b45309", Icon: Clock },
  aprobada: { label: "Aprobada", bg: "#ecfdf5", color: "#059669", Icon: CheckCircle2 },
  tomada: { label: "Tomada", bg: "#eef2f8", color: "#475569", Icon: CheckCircle2 },
  rechazada: { label: "Rechazada", bg: "#fef2f2", color: "#dc2626", Icon: XCircle },
};

export default function MisVacacionesClient({ vinculado, minInicio, diasAnticipacion, anio, datos }: {
  vinculado: boolean; minInicio: string; diasAnticipacion: number; anio: number; datos: Datos | null;
}) {
  const router = useRouter();
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [nota, setNota] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);

  if (!vinculado || !datos) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Palmtree size={19} style={{ color: "#00b4d8" }} /> Mis vacaciones
        </h1>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-sm text-amber-800 flex gap-3">
          <Info size={18} className="flex-shrink-0 mt-0.5" />
          <span>Tu cuenta todavía no está ligada a tu expediente de empleado. Pídele a Recursos Humanos que la vincule para poder solicitar tus vacaciones.</span>
        </div>
      </div>
    );
  }

  const dias = inicio && fin ? Math.floor((new Date(`${fin}T00:00:00Z`).getTime() - new Date(`${inicio}T00:00:00Z`).getTime()) / 86400000) + 1 : 0;
  const inicioValido = inicio ? inicio >= minInicio : true;
  const rangoValido = inicio && fin ? fin >= inicio : true;
  const puedeEnviar = !!inicio && !!fin && inicioValido && rangoValido && dias > 0 && !enviando;

  async function enviar() {
    setError(""); setOk(false);
    if (!inicio || !fin) { setError("Selecciona ambas fechas."); return; }
    if (!inicioValido) { setError(`Debes pedirlas con al menos ${diasAnticipacion} días de anticipación (a partir del ${fmt(minInicio)}).`); return; }
    if (!rangoValido) { setError("La fecha de fin no puede ser antes de la de inicio."); return; }
    setEnviando(true);
    const r = await fetch("/api/vacaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fechaInicio: inicio, fechaFin: fin, nota }),
    });
    setEnviando(false);
    if (!r.ok) { const d = await r.json().catch(() => ({})); setError(d.error ?? "No se pudo enviar la solicitud."); return; }
    setInicio(""); setFin(""); setNota(""); setOk(true);
    router.refresh();
  }

  async function cancelar(id: number) {
    if (!confirm("¿Cancelar esta solicitud?")) return;
    const r = await fetch(`/api/vacaciones/${id}`, { method: "DELETE" });
    if (r.ok) router.refresh();
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Palmtree size={19} style={{ color: "#00b4d8" }} /> Mis vacaciones {anio}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Solicítalas con al menos {diasAnticipacion} días de anticipación. Recursos Humanos las revisa y aprueba.</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: datos.disponibles < 0 ? "#dc2626" : "#059669" }}>{datos.disponibles}</p>
          <p className="text-xs text-gray-500 mt-0.5">Disponibles</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{datos.tomados}</p>
          <p className="text-xs text-gray-500 mt-0.5">Tomados</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: "#b45309" }}>{datos.pendientes}</p>
          <p className="text-xs text-gray-500 mt-0.5">Por aprobar</p>
        </div>
      </div>

      {!datos.tieneFecha && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-800 flex items-center gap-2">
          <Info size={14} className="flex-shrink-0" /> Aún no tienes fecha de ingreso registrada; el cálculo de días puede variar. Recursos Humanos lo ajustará.
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100" style={{ backgroundColor: "#eef2f8" }}>
          <h2 className="text-sm font-semibold" style={{ color: "#1a3a6b" }}>Solicitar vacaciones</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Del</label>
              <input type="date" value={inicio} min={minInicio} onChange={(e) => setInicio(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Al</label>
              <input type="date" value={fin} min={inicio || minInicio} onChange={(e) => setFin(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>

          {dias > 0 && rangoValido && (
            <p className="text-sm text-gray-600">Estás solicitando <span className="font-semibold text-gray-900">{dias} {dias === 1 ? "día" : "días"}</span>.</p>
          )}
          {inicio && !inicioValido && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">La fecha de inicio debe ser a partir del {fmt(minInicio)} ({diasAnticipacion} días de anticipación).</p>
          )}
          {dias > 0 && rangoValido && dias > datos.disponibles && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">Ojo: estás pidiendo más días ({dias}) de los que tienes disponibles ({datos.disponibles}). Recursos Humanos lo revisará.</p>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Motivo (opcional)</label>
            <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={2} placeholder="Ej. Descanso familiar"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          {ok && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">¡Solicitud enviada! Recursos Humanos la revisará.</p>}

          <button onClick={enviar} disabled={!puedeEnviar}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg disabled:opacity-40"
            style={{ backgroundColor: "#00b4d8" }}>
            <Send size={14} /> {enviando ? "Enviando…" : "Enviar solicitud"}
          </button>
        </div>
      </div>

      {/* Historial */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-700">Mis solicitudes</h2>
        </div>
        {datos.solicitudes.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">Aún no has solicitado vacaciones.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {datos.solicitudes.map((s) => {
              const b = BADGE[s.estado] ?? BADGE.solicitada;
              const Icon = b.Icon;
              return (
                <div key={s.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{fmt(s.fechaInicio)} — {fmt(s.fechaFin)}</p>
                    <p className="text-xs text-gray-500">{s.dias} {s.dias === 1 ? "día" : "días"}{s.nota ? ` · ${s.nota}` : ""}</p>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-1 rounded-full flex items-center gap-1" style={{ backgroundColor: b.bg, color: b.color }}>
                    <Icon size={12} /> {b.label}
                  </span>
                  {s.estado === "solicitada" && (
                    <button onClick={() => cancelar(s.id)} className="text-gray-300 hover:text-red-400" title="Cancelar solicitud">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
