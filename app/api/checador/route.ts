import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

function ipDe(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "";
}

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

  const { tipo } = await req.json(); // entrada | comida_inicio | comida_fin | salida
  const ip = ipDe(req);
  const { hora, fechaStr } = ahoraMx();
  const fecha = new Date(`${fechaStr}T00:00:00.000Z`);
  const llave = { empleadoId_fecha: { empleadoId: empleado.id, fecha } };

  // Asegura que exista el registro del día
  async function asegurar() {
    const ex = await prisma.asistencia.findUnique({ where: llave });
    if (!ex) await prisma.asistencia.create({ data: { empleadoId: empleado!.id, fecha, estado: "a_tiempo", origen: "empleado" } });
  }

  if (tipo === "entrada") {
    const estado = hora > (empleado.horaEntrada || "09:00") ? "retardo" : "a_tiempo";
    await prisma.asistencia.upsert({
      where: llave,
      update: { horaLlegada: hora, ipLlegada: ip, estado, origen: "empleado" },
      create: { empleadoId: empleado.id, fecha, horaLlegada: hora, ipLlegada: ip, estado, origen: "empleado" },
    });
  } else if (tipo === "comida_inicio") {
    await asegurar();
    await prisma.asistencia.update({ where: llave, data: { comidaInicio: hora } });
  } else if (tipo === "comida_fin") {
    await asegurar();
    await prisma.asistencia.update({ where: llave, data: { comidaFin: hora } });
  } else if (tipo === "salida") {
    await asegurar();
    await prisma.asistencia.update({ where: llave, data: { horaSalida: hora, ipSalida: ip } });
  } else {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, hora, ip });
}
