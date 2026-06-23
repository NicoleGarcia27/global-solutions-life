import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password, nombre, departamentoId } = await req.json();

  if (!email || !password || !nombre) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const existe = await prisma.usuario.findUnique({ where: { email: email.toLowerCase() } });
  if (existe) {
    return NextResponse.json({ error: "Este correo ya está registrado" }, { status: 400 });
  }

  const totalUsuarios = await prisma.usuario.count();
  const role = totalUsuarios === 0 ? "admin" : "usuario";

  const hash = await bcrypt.hash(password, 10);
  const usuario = await prisma.usuario.create({
    data: {
      email: email.toLowerCase(),
      password: hash,
      nombre,
      role,
      departamentoId: departamentoId ? Number(departamentoId) : null,
    },
  });

  return NextResponse.json({ id: usuario.id, role: usuario.role });
}
