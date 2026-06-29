import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MessageSquareWarning, Lightbulb, Heart, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

const TIPO_INFO: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  queja: { label: "Queja", icon: MessageSquareWarning, color: "#dc2626", bg: "#fef2f2" },
  sugerencia: { label: "Sugerencia", icon: Lightbulb, color: "#d97706", bg: "#fffbeb" },
  reconocimiento: { label: "Reconocimiento", icon: Heart, color: "#059669", bg: "#ecfdf5" },
};

export default async function AdminBuzonPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const quejas = await prisma.queja.findMany({ orderBy: { createdAt: "desc" } });

  const conteo = {
    queja: quejas.filter((q) => q.tipo === "queja").length,
    sugerencia: quejas.filter((q) => q.tipo === "sugerencia").length,
    reconocimiento: quejas.filter((q) => q.tipo === "reconocimiento").length,
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquareWarning size={19} style={{ color: "#1a3a6b" }} /> Buzón de quejas y sugerencias
        </h1>
        <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
          <Lock size={12} /> Mensajes anónimos enviados por el personal. No se registra quién los manda.
        </p>
      </div>

      {/* Conteo */}
      <div className="grid grid-cols-3 gap-3">
        {(["queja", "sugerencia", "reconocimiento"] as const).map((t) => {
          const info = TIPO_INFO[t];
          return (
            <div key={t} className="rounded-xl border border-gray-200 p-4 text-center" style={{ backgroundColor: info.bg }}>
              <p className="text-2xl font-bold" style={{ color: info.color }}>{conteo[t]}</p>
              <p className="text-xs mt-0.5" style={{ color: info.color }}>{info.label}{conteo[t] !== 1 ? "s" : ""}</p>
            </div>
          );
        })}
      </div>

      {quejas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
          Aún no hay mensajes en el buzón.
        </div>
      ) : (
        <div className="space-y-3">
          {quejas.map((q) => {
            const info = TIPO_INFO[q.tipo] ?? TIPO_INFO.queja;
            const Icon = info.icon;
            return (
              <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: info.bg, color: info.color }}>
                    <Icon size={12} /> {info.label}
                  </span>
                  {q.area && <span className="text-xs text-gray-400">· {q.area}</span>}
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(q.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{q.mensaje}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
