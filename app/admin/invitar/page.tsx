"use client";
import { useState } from "react";
import { Mail, Plus, Trash2, Copy, CheckCircle, MessageCircle } from "lucide-react";

const LINK = "https://global-solutions-life.vercel.app/registro";

export default function InvitarPage() {
  const [lista, setLista] = useState([{ nombre: "", email: "" }]);
  const [copiado, setCopiado] = useState<number | null>(null);

  function agregar() {
    setLista((l) => [...l, { nombre: "", email: "" }]);
  }

  function eliminar(i: number) {
    setLista((l) => l.filter((_, idx) => idx !== i));
  }

  function set(i: number, key: "nombre" | "email", val: string) {
    setLista((l) => l.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  }

  function mensajeWhatsApp(nombre: string) {
    return `Hola ${nombre}, te invito a registrarte en el sistema institucional de Global Solutions Life para que puedas llenar la información de tu puesto.\n\nEntra aquí: ${LINK}\n\nCrea tu cuenta con tu correo y llena el formulario de tus actividades. Si tienes alguna duda comunícate con RH.`;
  }

  function copiar(i: number, nombre: string) {
    navigator.clipboard.writeText(mensajeWhatsApp(nombre));
    setCopiado(i);
    setTimeout(() => setCopiado(null), 2000);
  }

  function abrirWhatsApp(nombre: string, email: string) {
    const msg = encodeURIComponent(mensajeWhatsApp(nombre));
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Invitar empleados</h1>
        <p className="text-sm text-gray-400 mt-0.5">Genera el mensaje de invitación listo para enviar por WhatsApp o correo</p>
      </div>

      {/* Link directo */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-blue-700 mb-1">Link de registro para compartir:</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm text-blue-800 bg-white border border-blue-200 rounded-lg px-3 py-2">
            {LINK}
          </code>
          <button
            onClick={() => { navigator.clipboard.writeText(LINK); }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-blue-700 border border-blue-200 bg-white rounded-lg hover:bg-blue-50"
          >
            <Copy size={12} /> Copiar
          </button>
        </div>
      </div>

      {/* Lista de empleados */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-700">Generar mensaje personalizado por empleado</h2>
          <p className="text-xs text-gray-400 mt-0.5">Agrega su nombre y genera el mensaje listo para copiar o abrir en WhatsApp</p>
        </div>

        <div className="p-4 space-y-3">
          {lista.map((inv, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Nombre del empleado"
                  className="flex-1 border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={inv.nombre}
                  onChange={(e) => set(i, "nombre", e.target.value)}
                />
                {lista.length > 1 && (
                  <button onClick={() => eliminar(i)} className="text-gray-300 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {inv.nombre && (
                <>
                  <div className="text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-2 whitespace-pre-wrap leading-relaxed">
                    {mensajeWhatsApp(inv.nombre)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copiar(i, inv.nombre)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100"
                    >
                      {copiado === i ? <><CheckCircle size={12} className="text-emerald-500" /> Copiado</> : <><Copy size={12} /> Copiar mensaje</>}
                    </button>
                    <button
                      onClick={() => abrirWhatsApp(inv.nombre, inv.email)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white rounded-lg"
                      style={{ backgroundColor: "#25D366" }}
                    >
                      <MessageCircle size={12} /> Abrir en WhatsApp
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          <button
            onClick={agregar}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5"
          >
            <Plus size={13} /> Agregar otro empleado
          </button>
        </div>
      </div>
    </div>
  );
}
