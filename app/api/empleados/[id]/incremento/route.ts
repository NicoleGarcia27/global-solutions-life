import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token?.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const empleadoId = Number(id);
  const b = await req.json();
  const sueldoNuevo = Number(b.sueldoNuevo) || 0;

  const empleado = await prisma.empleado.findUnique({ where: { id: empleadoId } });
  const anterior = empleado?.sueldoActual ?? 0;
  const porcentaje = anterior > 0 ? Math.round(((sueldoNuevo - anterior) / anterior) * 1000) / 10 : 0;

  await prisma.incremento.create({
    data: {
      empleadoId,
      sueldoNuevo,
      porcentaje,
      nota: b.nota ?? "",
      fecha: b.fecha ? new Date(b.fecha) : new Date(),
    },
  });
  // Actualiza el sueldo actual del empleado
  await prisma.empleado.update({ where: { id: empleadoId }, data: { sueldoActual: sueldoNuevo } });

  return NextResponse.json({ ok: true });
}
