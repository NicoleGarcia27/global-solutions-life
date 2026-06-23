import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const departamentos = await prisma.departamento.findMany({ orderBy: { nombre: "asc" } });
  return NextResponse.json(departamentos);
}

export async function POST(req: Request) {
  const { nombre } = await req.json();
  if (!nombre) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  const dep = await prisma.departamento.create({ data: { nombre } });
  return NextResponse.json(dep);
}
