import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const puesto = await prisma.puesto.create({
    data: {
      codigo: body.codigo || `DP-GSL-${Date.now()}`,
      nombre: body.nombre,
      objetivo: body.objetivo ?? "",
      horario: body.horario ?? "Lun-Vie 9:00-18:00",
      escolaridad: body.escolaridad ?? "Licenciatura",
      experiencia: body.experiencia ?? "",
      edadMin: body.edadMin ?? 25,
      edadMax: body.edadMax ?? 55,
      reportaA: body.reportaA ?? "",
      supervisaA: body.supervisaA ?? "",
      tiempoAdaptacion: body.tiempoAdaptacion ?? "3 meses",
      periodicidad: body.periodicidad ?? "Mensual",
      herramientas: body.herramientas ?? "",
      formacion: body.formacion ?? "",
      competencias: body.competencias ?? "",
      titular: body.titular ?? "",
      estado: body.estado ?? "pendiente",
      departamentoId: body.departamentoId,
    },
  });
  return NextResponse.json(puesto);
}
