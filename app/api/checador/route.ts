import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

function ipDe(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "";
}

// Hora y fecha en zona horaria de México
function ahoraMx() {
  const ahora = new Date();
  const hora = new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", hour12: false, hour: "2-digit", minute: "2-digit" }).format(ahora);
  const fechaStr = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit" }).format(ahora);
  return { hora, fechaStr };
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const empleado = await prisma.empleado.findUnique({ where: { usuarioId: Number(token.sub) } });
  if (!empleado) return NextResponse.json({ error: "Tu cuenta no está vinculada a un empleado. Pídele a RH que la vincule." }, { status: 400 });

  const { tipo } = await req.json(); // "entrada" | "salida"
  const ip = ipDe(req);
  const { hora, fechaStr } = ahoraMx();
  const fecha = new Date(`${fechaStr}T00:00:00.000Z`);

  const existente = await prisma.asistencia.findUnique({ where: { empleadoId_fecha: { empleadoId: empleado.id, fecha } } });

  if (tipo === "entrada") {
    const estado = hora > (empleado.horaEntrada || "09:00") ? "retardo" : "a_tiempo";
    await prisma.asistencia.upsert({
      where: { empleadoId_fecha: { empleadoId: empleado.id, fecha } },
      update: { horaLlegada: hora, ipLlegada: ip, estado, origen: "empleado" },
      create: { empleadoId: empleado.id, fecha, horaLlegada: hora, ipLlegada: ip, estado, origen: "empleado" },
    });
    return NextResponse.json({ ok: true, hora, estado, ip });
  }

  if (tipo === "salida") {
    if (!existente) {
      await prisma.asistencia.create({ data: { empleadoId: empleado.id, fecha, horaSalida: hora, ipSalida: ip, estado: "a_tiempo", origen: "empleado" } });
    } else {
      await prisma.asistencia.update({ where: { empleadoId_fecha: { empleadoId: empleado.id, fecha } }, data: { horaSalida: hora, ipSalida: ip } });
    }
    return NextResponse.json({ ok: true, hora, ip });
  }

  return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
}
