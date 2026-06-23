import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.responsabilidad.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
