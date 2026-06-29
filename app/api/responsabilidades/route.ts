import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const puestoId = body.puestoId ?? null;
  const count = await prisma.responsabilidad.count({ where: { puestoId } });
  const resp = await prisma.responsabilidad.create({
    data: {
      nombre: body.nombre,
      descripcion: body.descripcion ?? "",
      tiempoHoras: body.tiempoHoras ?? 1,
      recurrencia: body.recurrencia ?? "Diaria",
      nivel: body.nivel ?? "Medio",
      origen: body.origen ?? "",
      orden: count,
      puestoId,
    },
  });
  return NextResponse.json(resp);
}
