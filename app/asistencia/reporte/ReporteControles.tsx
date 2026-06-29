"use client";
import { useRouter } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

function ymd(d: Date) { return d.toISOString().slice(0, 10); }

export default function ReporteControles({ desde, hasta }: { desde: string; hasta: string }) {
  const router = useRouter();

  function ir(d: string, h: string) { router.push(`/asistencia/reporte?desde=${d}&hasta=${h}`); }

  function estaSemana() {
    const hoy = new Date();
    const dow = (hoy.getDay() + 6) % 7; // lunes = 0
    const lunes = new Date(hoy); lunes.setDate(hoy.getDate() - dow);
    const domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 6);
    ir(ymd(lunes), ymd(domingo));
  }
  function esteMes() {
    const h = new Date();
    ir(ymd(new Date(h.getFullYear(), h.getMonth(), 1)), ymd(new Date(h.getFullYear(), h.getMonth() + 1, 0)));
  }

  return (
    <div className="flex items-center gap-2 flex-wrap bg-white rounded-xl border border-gray-200 p-3">
      <Link href="/asistencia" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mr-1"><ArrowLeft size={13} /> Volver</Link>
      <label className="flex items-center gap-1.5 text-xs text-gray-500">Del
        <input type="date" value={desde} onChange={(e) => ir(e.target.value, hasta)} className="border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#00b4d8]" />
      </label>
      <label className="flex items-center gap-1.5 text-xs text-gray-500">al
        <input type="date" value={hasta} onChange={(e) => ir(desde, e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#00b4d8]" />
      </label>
      <button onClick={estaSemana} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Esta semana</button>
      <button onClick={esteMes} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Este mes</button>
      <div className="flex-1" />
      <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-white rounded-lg font-medium" style={{ backgroundColor: "#1a3a6b" }}>
        <Printer size={13} /> Descargar / Imprimir PDF
      </button>
    </div>
  );
}
