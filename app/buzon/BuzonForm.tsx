"use client";
import { useState } from "react";
import Link from "next/link";
import { Lock, CheckCircle2, ArrowLeft } from "lucide-react";

const TIPOS = [
  { val: "queja", label: "Queja" },
  { val: "sugerencia", label: "Sugerencia" },
  { val: "reconocimiento", label: "Reconocimiento" },
];

export default function BuzonForm({ departamentos }: { departamentos: string[] }) {
  const [tipo, setTipo] = useState("queja");
  const [area, setArea] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [busy, setBusy] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!mensaje.trim()) return;
    setBusy(true);
    await fetch("/api/buzon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, area, mensaje }),
    });
    setBusy(false);
    setEnviado(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#eef2f7" }}>
      <div className="w-full max-w-lg">
        {/* Encabezado de marca */}
        <div className="text-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/api/logo" alt="GSL" width={56} height={56} className="mx-auto mb-2" style={{ objectFit: "contain" }} />
          <h1 className="text-xl font-bold" style={{ color: "#1a3a6b" }}>Global Solutions Life</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_10px_40px_-12px_rgba(26,58,107,0.2)] p-8">
          {enviado ? (
            <div className="text-center py-6">
              <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: "#00b4d8" }} />
              <h2 className="text-xl font-bold mb-2" style={{ color: "#1a3a6b" }}>¡Gracias por tu mensaje!</h2>
              <p className="text-gray-500 text-sm mb-6">Lo recibimos de forma anónima. Tu opinión nos ayuda a mejorar.</p>
              <button
                onClick={() => { setEnviado(false); setMensaje(""); setArea(""); setTipo("queja"); }}
                className="text-sm font-semibold hover:underline"
                style={{ color: "#00b4d8" }}
              >
                Enviar otro mensaje
              </button>
              <div className="mt-4">
                <Link href="/login" className="text-xs text-gray-400 hover:underline inline-flex items-center gap-1">
                  <ArrowLeft size={12} /> Volver al inicio
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold" style={{ color: "#1a3a6b" }}>Buzón de quejas y sugerencias</h2>
              <div className="flex items-center gap-1.5 text-xs mt-2 mb-6 px-3 py-2 rounded-lg" style={{ backgroundColor: "#e6f8fc", color: "#0a7d99" }}>
                <Lock size={13} />
                100% anónimo — no pedimos tu nombre ni guardamos quién lo envía.
              </div>

              <form onSubmit={enviar} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "#1a3a6b" }}>Tipo de mensaje</label>
                  <div className="flex gap-2">
                    {TIPOS.map((t) => (
                      <button
                        key={t.val} type="button" onClick={() => setTipo(t.val)}
                        className="flex-1 py-2 rounded-lg text-sm border-2 transition-colors"
                        style={tipo === t.val
                          ? { borderColor: "#1a3a6b", backgroundColor: "#1a3a6b", color: "#fff", fontWeight: 600 }
                          : { borderColor: "#e2e8f0", color: "#64748b" }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#1a3a6b" }}>Área (opcional)</label>
                  <select
                    value={area} onChange={(e) => setArea(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00b4d8] transition"
                  >
                    <option value="">Prefiero no decir</option>
                    {departamentos.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#1a3a6b" }}>Tu mensaje</label>
                  <textarea
                    required value={mensaje} onChange={(e) => setMensaje(e.target.value)}
                    rows={5}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00b4d8] transition resize-none"
                    placeholder="Escribe aquí tu queja, sugerencia o reconocimiento..."
                  />
                </div>

                <button
                  type="submit" disabled={busy || !mensaje.trim()}
                  className="w-full font-bold py-3.5 rounded-xl transition disabled:opacity-50 text-white hover:brightness-110"
                  style={{ backgroundColor: "#1a3a6b" }}
                >
                  {busy ? "Enviando..." : "Enviar de forma anónima"}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link href="/login" className="text-xs text-gray-400 hover:underline inline-flex items-center gap-1">
                  <ArrowLeft size={12} /> Volver al inicio de sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
