import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

async function requireAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return token?.role === "admin";
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json([], { status: 401 });
  const empleados = await prisma.empleado.findMany({ orderBy: { nombre: "asc" } });
  return NextResponse.json(empleados);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const b = await req.json();
  if (!b.nombre?.trim()) return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });

  const empleado = await prisma.empleado.create({
    data: {
      nombre: b.nombre,
      puesto: b.puesto ?? "",
      area: b.area ?? "",
      tipo: b.tipo ?? "empleado",
      factura: b.factura ?? false,
      fechaIngreso: b.fechaIngreso ? new Date(b.fechaIngreso) : null,
      sueldoActual: Number(b.sueldoActual) || 0,
      correo: b.correo ?? "",
      telefono: b.telefono ?? "",
      notas: b.notas ?? "",
    },
  });
  return NextResponse.json(empleado);
}
