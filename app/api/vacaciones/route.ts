import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { notificar } from "@/lib/notificaciones";

// Días mínimos de anticipación para solicitar vacaciones.
const DIAS_ANTICIPACION = 15;

function hoyMx(): Date {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return new Date(`${ymd}T00:00:00.000Z`);
}

// El empleado solicita sus propias vacaciones. Queda en estado "solicitada" hasta que RH la apruebe.
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const empleado = await prisma.empleado.findUnique({ where: { usuarioId: Number(token.sub) } });
  if (!empleado) {
    return NextResponse.json({ error: "Tu cuenta todavía no está ligada a tu expediente de empleado. Avísale a Recursos Humanos." }, { status: 400 });
  }

  const b = await req.json();
  if (!b.fechaInicio || !b.fechaFin) return NextResponse.json({ error: "Selecciona la fecha de inicio y de fin." }, { status: 400 });

  const ini = new Date(`${b.fechaInicio}T00:00:00.000Z`);
  const fin = new Date(`${b.fechaFin}T00:00:00.000Z`);
  if (isNaN(ini.getTime()) || isNaN(fin.getTime())) return NextResponse.json({ error: "Fechas inválidas." }, { status: 400 });
  if (fin < ini) return NextResponse.json({ error: "La fecha de fin no puede ser antes de la de inicio." }, { status: 400 });

  // Regla: al menos DIAS_ANTICIPACION días de anticipación.
  const minInicio = new Date(hoyMx().getTime() + DIAS_ANTICIPACION * 86400000);
  if (ini < minInicio) {
    return NextResponse.json({ error: `Las vacaciones se piden con al menos ${DIAS_ANTICIPACION} días de anticipación. La fecha de inicio más próxima es el ${minInicio.toISOString().slice(0, 10)}.` }, { status: 400 });
  }

  const dias = Math.floor((fin.getTime() - ini.getTime()) / 86400000) + 1;

  await prisma.vacacion.create({
    data: {
      empleadoId: empleado.id,
      fechaInicio: ini,
      fechaFin: fin,
      dias,
      estado: "solicitada",
      nota: (b.nota ?? "").slice(0, 500),
    },
  });

  const f = (d: Date) => d.toLocaleDateString("es-MX", { day: "numeric", month: "long", timeZone: "UTC" });
  await notificar("vacaciones", `Solicitud de vacaciones: ${empleado.nombre}`, `${f(ini)} al ${f(fin)} · ${dias} ${dias === 1 ? "día" : "días"}`, "/vacaciones");

  return NextResponse.json({ ok: true });
}
