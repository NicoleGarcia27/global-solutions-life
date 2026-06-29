import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const puesto = await prisma.puesto.update({
    where: { id: Number(id) },
    data: {
      ...(body.estado !== undefined && { estado: body.estado }),
      ...(body.adminNotas !== undefined && { adminNotas: body.adminNotas }),
      ...(body.escolaridad !== undefined && { escolaridad: body.escolaridad }),
      ...(body.experiencia !== undefined && { experiencia: body.experiencia }),
      ...(body.competencias !== undefined && { competencias: body.competencias }),
      ...(body.formacion !== undefined && { formacion: body.formacion }),
      ...(body.periodicidad !== undefined && { periodicidad: body.periodicidad }),
      ...(body.edadMin !== undefined && { edadMin: body.edadMin }),
      ...(body.edadMax !== undefined && { edadMax: body.edadMax }),
      ...(body.tiempoAdaptacion !== undefined && { tiempoAdaptacion: body.tiempoAdaptacion }),
      ...(body.codigo !== undefined && { codigo: body.codigo }),
    },
  });
  return NextResponse.json(puesto);
}
