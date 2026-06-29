import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token?.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const b = await req.json();
  if (!b.empleadoId || !b.fecha) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

  const fecha = new Date(`${b.fecha}T00:00:00.000Z`);
  const empleadoId = Number(b.empleadoId);

  const data = { estado: b.estado ?? "a_tiempo", horaLlegada: b.horaLlegada ?? "", nota: b.nota ?? "" };
  await prisma.asistencia.upsert({
    where: { empleadoId_fecha: { empleadoId, fecha } },
    update: data,
    create: { empleadoId, fecha, ...data },
  });
  return NextResponse.json({ ok: true });
}
