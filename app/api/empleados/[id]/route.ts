import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

type Params = { params: Promise<{ id: string }> };

async function requireAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return token?.role === "admin";
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const b = await req.json();

  // Una cuenta de acceso solo puede estar ligada a un empleado.
  if (b.usuarioId) {
    const ya = await prisma.empleado.findFirst({ where: { usuarioId: Number(b.usuarioId), id: { not: Number(id) } } });
    if (ya) return NextResponse.json({ error: `Esa cuenta ya está vinculada a ${ya.nombre}.` }, { status: 400 });
  }

  const empleado = await prisma.empleado.update({
    where: { id: Number(id) },
    data: {
      ...(b.nombre !== undefined && { nombre: b.nombre }),
      ...(b.puesto !== undefined && { puesto: b.puesto }),
      ...(b.area !== undefined && { area: b.area }),
      ...(b.tipo !== undefined && { tipo: b.tipo }),
      ...(b.factura !== undefined && { factura: b.factura }),
      ...(b.fechaIngreso !== undefined && { fechaIngreso: b.fechaIngreso ? new Date(b.fechaIngreso) : null }),
      ...(b.sueldoActual !== undefined && { sueldoActual: Number(b.sueldoActual) || 0 }),
      ...(b.bonoDespensa !== undefined && { bonoDespensa: Number(b.bonoDespensa) || 0 }),
      ...(b.bonoGasolina !== undefined && { bonoGasolina: Number(b.bonoGasolina) || 0 }),
      ...(b.correo !== undefined && { correo: b.correo }),
      ...(b.telefono !== undefined && { telefono: b.telefono }),
      ...(b.notas !== undefined && { notas: b.notas }),
      ...(b.activo !== undefined && { activo: b.activo }),
      ...(b.diasVacaciones !== undefined && { diasVacaciones: Number(b.diasVacaciones) || 0 }),
      ...(b.diasExtra !== undefined && { diasExtra: Number(b.diasExtra) || 0 }),
      ...(b.horaEntrada !== undefined && { horaEntrada: b.horaEntrada }),
      ...(b.usuarioId !== undefined && { usuarioId: b.usuarioId ? Number(b.usuarioId) : null }),
    },
  });
  return NextResponse.json(empleado);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  await prisma.empleado.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
