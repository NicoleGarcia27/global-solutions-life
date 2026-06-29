import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const count = await prisma.responsabilidad.count({ where: { puestoId: body.puestoId } });
  const resp = await prisma.responsabilidad.create({
    data: {
      nombre: body.nombre,
      descripcion: body.descripcion ?? "",
      tiempoHoras: body.tiempoHoras ?? 1,
      recurrencia: body.recurrencia ?? "Diaria",
      nivel: body.nivel ?? "Medio",
      orden: count,
      puestoId: body.puestoId,
    },
  });
  return NextResponse.json(resp);
}
