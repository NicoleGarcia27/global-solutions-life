import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json([], { status: 401 });

  const where = token.role === "admin" ? {} : { usuarioId: Number(token.sub) };
  const puestos = await prisma.puesto.findMany({
    where,
    include: { departamento: true, usuario: { select: { nombre: true, email: true } }, responsabilidades: { orderBy: { orden: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(puestos);
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const tareas: { nombre: string; descripcion: string; frecuencia: string; tiempoHoras: number }[] = body.tareas ?? [];

  const puesto = await prisma.puesto.create({
    data: {
      codigo: body.codigo || "",
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
      departamentoId: body.departamentoId || null,
      usuarioId: Number(token.sub),
      tienePersonal: body.tienePersonal ?? false,
      numPersonasACargo: body.numPersonasACargo ?? "",
      comoSupervisa: body.comoSupervisa ?? "",
      comoAudita: body.comoAudita ?? "",
      comoEvalua: body.comoEvalua ?? "",
      autoridadSobre: body.autoridadSobre ?? "",
      internoConQuien: body.internoConQuien ?? "",
      externoConQuien: body.externoConQuien ?? "",
      documentosQueGenera: body.documentosQueGenera ?? "",
      decisionesIndependientes: body.decisionesIndependientes ?? "",
      decisionesConAutorizacion: body.decisionesConAutorizacion ?? "",
      tareasNoCorresponden: body.tareasNoCorresponden ?? "",
      tareasQueNadieHace: body.tareasQueNadieHace ?? "",
      problemasFrecuentes: body.problemasFrecuentes ?? "",
      comoMideSuTrabajo: body.comoMideSuTrabajo ?? "",
      responsabilidades: {
        create: tareas.map((t, i) => ({
          nombre: t.nombre,
          descripcion: t.descripcion,
          recurrencia: t.frecuencia,
          tiempoHoras: t.tiempoHoras,
          orden: i,
        })),
      },
    },
  });
  return NextResponse.json(puesto);
}
