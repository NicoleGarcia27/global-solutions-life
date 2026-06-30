"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, Clock, MapPin, CheckCircle2, Utensils, UtensilsCrossed } from "lucide-react";

type Reg = { estado: string; horaLlegada: string; horaSalida: string; comidaInicio: string; comidaFin: string; ipLlegada: string; ipSalida: string } | null;

function difMin(a: string, b: string): number | null {
  if (!a || !b) return null;
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  return (bh * 60 + bm) - (ah * 60 + am);
}

export default function ChecadorClient({ nombre, vinculado, horaEntrada, minutosComida, registro }: { nombre: string; vinculado: boolean; horaEntrada: string; minutosComida: number; registro: Reg }) {
  const router = useRouter();
  const [reloj, setReloj] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const tick = () => setReloj(new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const entradaHecha = !!registro?.horaLlegada || done.entrada;
  const comidaIniHecha = !!registro?.comidaInicio || done.comida_inicio;
  const comidaFinHecha = !!registro?.comidaFin || done.comida_fin;
  const salidaHecha = !!registro?.horaSalida || done.salida;

  async function checar(tipo: string) {
    setBusy(true); setMsg("");
    const res = await fetch("/api/checador", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipo }) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setMsg(data.error ?? "Error al registrar"); return; }
    setDone((d) => ({ ...d, [tipo]: true }));
    const etiqueta: Record<string, string> = { entrada: "Entrada", comida_inicio: "Salida a comer", comida_fin: "Regreso de comer", salida: "Salida" };
    setMsg(`✓ ${etiqueta[tipo]} registrada a las ${data.hora}`);
    router.refresh();
  }

  const fechaHoy = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const durComida = difMin(registro?.comidaInicio ?? "", registro?.comidaFin ?? "");
  const comidaExcedida = durComida !== null && durComida > minutosComida;

  function Accion({ tipo, label, hora, hecho, enabled, color, bg, Icon }: { tipo: string; label: string; hora: string; hecho: boolean; enabled: boolean; color: string; bg: string; Icon: any }) {
    if (hecho) {
      return (
        <div className="flex flex-col items-center justify-center gap-1 py-4 rounded-xl font-medium border-2" style={{ borderColor: color, color, backgroundColor: bg }}>
          <CheckCircle2 size={22} /> <span className="text-xs">{label} {hora}</span>
        </div>
      );
    }
    return (
      <button onClick={() => checar(tipo)} disabled={busy || !enabled} className="flex flex-col items-center gap-1.5 py-4 rounded-xl text-white font-medium disabled:opacity-40" style={{ backgroundColor: color }}>
        <Icon size={22} /> <span className="text-xs">{label}</span>
      </button>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_10px_40px_-12px_rgba(26,58,107,0.18)] p-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/api/mascota" alt="Mascota GSL" width={120} height={120} className="mx-auto -mt-2 mb-1" style={{ objectFit: "contain" }} />
          <p className="text-sm text-gray-400 capitalize">{fechaHoy}</p>
          <div className="text-5xl font-bold my-2" style={{ color: "#1a3a6b" }}>{reloj}</div>
          <p className="text-sm text-gray-500 mb-6">¡Hola <strong>{nombre}</strong>! Marca tu asistencia</p>

          {!vinculado ? (
            <div className="text-sm bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800">
              Tu cuenta aún no está vinculada a tu ficha de empleado. Pídele a RH que la vincule para poder checar.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Accion tipo="entrada" label="Entrada" hora={registro?.horaLlegada ?? ""} hecho={entradaHecha} enabled={!entradaHecha} color="#059669" bg="#ecfdf5" Icon={LogIn} />
                <Accion tipo="comida_inicio" label="Salgo a comer" hora={registro?.comidaInicio ?? ""} hecho={comidaIniHecha} enabled={entradaHecha && !comidaIniHecha && !salidaHecha} color="#d97706" bg="#fffbeb" Icon={Utensils} />
                <Accion tipo="comida_fin" label="Regreso de comer" hora={registro?.comidaFin ?? ""} hecho={comidaFinHecha} enabled={comidaIniHecha && !comidaFinHecha && !salidaHecha} color="#0a7d99" bg="#e6f8fc" Icon={UtensilsCrossed} />
                <Accion tipo="salida" label="Salida" hora={registro?.horaSalida ?? ""} hecho={salidaHecha} enabled={entradaHecha && !salidaHecha} color="#1a3a6b" bg="#eef2f8" Icon={LogOut} />
              </div>

              {durComida !== null && (
                <p className="mt-3 text-sm font-medium" style={{ color: comidaExcedida ? "#dc2626" : "#059669" }}>
                  Comida: {durComida} min {comidaExcedida ? `· se pasó ${durComida - minutosComida} min (permitido ${minutosComida})` : `· dentro del límite (${minutosComida} min)`}
                </p>
              )}
              {msg && <p className="mt-2 text-sm font-medium" style={{ color: "#059669" }}>{msg}</p>}

              <div className="mt-6 pt-5 border-t border-gray-100 text-left space-y-1.5">
                <p className="text-xs text-gray-400 mb-1">Tu registro de hoy (entrada esperada: {horaEntrada})</p>
                <Linea label="Entrada" valor={registro?.horaLlegada} extra={registro?.estado === "retardo" ? "retardo" : registro?.horaLlegada ? "a tiempo" : ""} extraColor={registro?.estado === "retardo" ? "#d97706" : "#059669"} />
                <Linea label="Salida a comer" valor={registro?.comidaInicio} />
                <Linea label="Regreso de comer" valor={registro?.comidaFin} />
                <Linea label="Salida" valor={registro?.horaSalida} />
                {registro?.ipLlegada && <p className="text-[11px] text-gray-400 flex items-center gap-1 pt-1"><MapPin size={11} /> IP: {registro.ipLlegada}</p>}
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

function Linea({ label, valor, extra, extraColor }: { label: string; valor?: string; extra?: string; extraColor?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-1.5 text-gray-600"><Clock size={14} /> {label}</span>
      <span className="font-medium text-gray-800">{valor || "—"}{extra && <span className="ml-2 text-xs" style={{ color: extraColor }}>{extra}</span>}</span>
    </div>
  );
}
