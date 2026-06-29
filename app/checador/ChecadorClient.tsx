"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, Clock, MapPin, CheckCircle2 } from "lucide-react";

type Reg = { estado: string; horaLlegada: string; horaSalida: string; ipLlegada: string; ipSalida: string } | null;

export default function ChecadorClient({ nombre, vinculado, horaEntrada, registro }: { nombre: string; vinculado: boolean; horaEntrada: string; registro: Reg }) {
  const router = useRouter();
  const [reloj, setReloj] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [doneEntrada, setDoneEntrada] = useState(false);
  const [doneSalida, setDoneSalida] = useState(false);

  const entradaHecha = !!registro?.horaLlegada || doneEntrada;
  const salidaHecha = !!registro?.horaSalida || doneSalida;

  useEffect(() => {
    const tick = () => setReloj(new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  async function checar(tipo: "entrada" | "salida") {
    setBusy(true); setMsg("");
    const res = await fetch("/api/checador", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipo }) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setMsg(data.error ?? "Error al registrar"); return; }
    if (tipo === "entrada") setDoneEntrada(true); else setDoneSalida(true);
    setMsg(tipo === "entrada" ? `✓ Entrada registrada a las ${data.hora}` : `✓ Salida registrada a las ${data.hora}`);
    router.refresh();
  }

  const fechaHoy = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_10px_40px_-12px_rgba(26,58,107,0.18)] p-8 text-center">
          <p className="text-sm text-gray-400 capitalize">{fechaHoy}</p>
          <div className="text-5xl font-bold my-3" style={{ color: "#1a3a6b" }}>{reloj}</div>
          <p className="text-sm text-gray-500 mb-6">Hola <strong>{nombre}</strong></p>

          {!vinculado ? (
            <div className="text-sm bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800">
              Tu cuenta aún no está vinculada a tu ficha de empleado. Pídele a RH que la vincule para poder checar.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {entradaHecha ? (
                  <div className="flex flex-col items-center justify-center gap-1 py-5 rounded-xl font-medium border-2" style={{ borderColor: "#059669", color: "#059669", backgroundColor: "#ecfdf5" }}>
                    <CheckCircle2 size={24} /> <span className="text-sm">Entrada {registro?.horaLlegada}</span>
                  </div>
                ) : (
                  <button onClick={() => checar("entrada")} disabled={busy} className="flex flex-col items-center gap-1.5 py-5 rounded-xl text-white font-medium disabled:opacity-50" style={{ backgroundColor: "#059669" }}>
                    <LogIn size={26} /> Registrar entrada
                  </button>
                )}
                {salidaHecha ? (
                  <div className="flex flex-col items-center justify-center gap-1 py-5 rounded-xl font-medium border-2" style={{ borderColor: "#1a3a6b", color: "#1a3a6b", backgroundColor: "#eef2f8" }}>
                    <CheckCircle2 size={24} /> <span className="text-sm">Salida {registro?.horaSalida}</span>
                  </div>
                ) : (
                  <button onClick={() => checar("salida")} disabled={busy || !entradaHecha} className="flex flex-col items-center gap-1.5 py-5 rounded-xl text-white font-medium disabled:opacity-50" style={{ backgroundColor: "#1a3a6b" }}>
                    <LogOut size={26} /> Registrar salida
                  </button>
                )}
              </div>

              {entradaHecha && salidaHecha && <p className="mt-4 text-sm text-gray-500">Ya registraste tu entrada y salida de hoy. ¡Buen trabajo! ✓</p>}
              {msg && <p className="mt-4 text-sm font-medium" style={{ color: "#059669" }}>{msg}</p>}

              <div className="mt-6 pt-5 border-t border-gray-100 text-left space-y-2">
                <p className="text-xs text-gray-400 mb-1">Tu registro de hoy (hora de entrada esperada: {horaEntrada})</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-gray-600"><Clock size={14} /> Entrada</span>
                  <span className="font-medium text-gray-800">{registro?.horaLlegada || "—"}{registro?.estado === "retardo" && <span className="ml-2 text-xs text-amber-600">retardo</span>}{registro?.estado === "a_tiempo" && registro?.horaLlegada && <span className="ml-2 text-xs text-emerald-600">a tiempo</span>}</span>
                </div>
                {registro?.ipLlegada && <p className="text-[11px] text-gray-400 flex items-center gap-1"><MapPin size={11} /> IP entrada: {registro.ipLlegada}</p>}
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-gray-600"><Clock size={14} /> Salida</span>
                  <span className="font-medium text-gray-800">{registro?.horaSalida || "—"}</span>
                </div>
                {registro?.ipSalida && <p className="text-[11px] text-gray-400 flex items-center gap-1"><MapPin size={11} /> IP salida: {registro.ipSalida}</p>}
              </div>
            </>
          )}
        </div>
        <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
          <CheckCircle2 size={12} /> La hora la registra el sistema automáticamente, no se puede modificar.
        </p>
      </div>
    </div>
  );
}
