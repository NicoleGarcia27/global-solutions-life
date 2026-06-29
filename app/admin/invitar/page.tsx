"use client";
import { useState } from "react";
import { Mail, Plus, Send, Trash2, CheckCircle } from "lucide-react";

type Invitado = { nombre: string; email: string; estado: "pendiente" | "enviado" | "error" };

export default function InvitarPage() {
  const [lista, setLista] = useState<Invitado[]>([{ nombre: "", email: "", estado: "pendiente" }]);
  const [enviando, setEnviando] = useState(false);
  const [resultados, setResultados] = useState<boolean>(false);

  function agregarFila() {
    setLista((l) => [...l, { nombre: "", email: "", estado: "pendiente" }]);
  }

  function eliminarFila(i: number) {
    setLista((l) => l.filter((_, idx) => idx !== i));
  }

  function setFila(i: number, key: "nombre" | "email", val: string) {
    setLista((l) => l.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  }

  async function enviarInvitaciones() {
    setEnviando(true);
    const nuevaLista = [...lista];
    for (let i = 0; i < nuevaLista.length; i++) {
      const inv = nuevaLista[i];
      if (!inv.nombre || !inv.email) continue;
      const res = await fetch("/api/admin/invitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: inv.nombre, email: inv.email }),
      });
      nuevaLista[i] = { ...inv, estado: res.ok ? "enviado" : "error" };
      setLista([...nuevaLista]);
    }
    setEnviando(false);
    setResultados(true);
  }

  const enviados = lista.filter((l) => l.estado === "enviado").length;
  const validos = lista.filter((l) => l.nombre && l.email).length;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Invitar empleados</h1>
        <p className="text-sm text-gray-400 mt-0.5">Envía el link de registro por correo a cada empleado</p>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Mail size={18} className="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">¿Cómo funciona?</p>
          <p className="text-xs text-blue-600 mt-1 leading-relaxed">
            Agrega el nombre y correo de cada empleado. Les llegará un correo con el link para registrarse en el sistema.
            Una vez registrados, podrán llenar su formulario de puesto.
          </p>
          <p className="text-xs text-blue-500 mt-1 font-medium">
            Link de registro: global-solutions-life.vercel.app/registro
          </p>
        </div>
      </div>

      {/* Tabla de invitados */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-700">Lista de empleados a invitar</h2>
        </div>
        <div className="p-4 space-y-3">
          {lista.map((inv, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={inv.nombre}
                  onChange={(e) => setFila(i, "nombre", e.target.value)}
                  disabled={inv.estado === "enviado"}
                />
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={inv.email}
                  onChange={(e) => setFila(i, "email", e.target.value)}
                  disabled={inv.estado === "enviado"}
                />
              </div>
              {inv.estado === "enviado" ? (
                <CheckCircle size={18} className="text-emerald-500 shrink-0" />
              ) : inv.estado === "error" ? (
                <span className="text-xs text-red-500 shrink-0">Error</span>
              ) : (
                <button
                  onClick={() => eliminarFila(i)}
                  className="text-gray-300 hover:text-red-400 shrink-0"
                  disabled={lista.length === 1}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={agregarFila}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5"
          >
            <Plus size={13} /> Agregar otro empleado
          </button>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          {resultados && enviados > 0 && (
            <p className="text-sm text-emerald-600 font-medium">
              ✓ {enviados} invitación{enviados !== 1 ? "es" : ""} enviada{enviados !== 1 ? "s" : ""} con éxito
            </p>
          )}
          {!resultados && <p className="text-xs text-gray-400">{validos} empleado{validos !== 1 ? "s" : ""} listo{validos !== 1 ? "s" : ""} para invitar</p>}
          <button
            onClick={enviarInvitaciones}
            disabled={enviando || validos === 0}
            className="flex items-center gap-2 px-5 py-2 text-sm text-white rounded-lg disabled:opacity-50 font-medium"
            style={{ backgroundColor: "#1a3a6b" }}
          >
            <Send size={14} />
            {enviando ? "Enviando..." : "Enviar invitaciones"}
          </button>
        </div>
      </div>
    </div>
  );
}
