import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

type Params = { params: Promise<{ size: string }> };
const PERMITIDOS = new Set(["180", "192", "512"]);

// Sirve los íconos de la app instalable desde public/pwa-<size>.png
export async function GET(_req: Request, { params }: Params) {
  const { size } = await params;
  if (!PERMITIDOS.has(size)) return new NextResponse(null, { status: 404 });
  try {
    const file = readFileSync(join(process.cwd(), "public", `pwa-${size}.png`));
    return new NextResponse(file, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=604800",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
