import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as fsp from "fs/promises";
import * as path from "path";

const NAS_PENDIENTES = "\\\\10.0.16.103\\tics\\Pruebas\\pendientes";

const NAS_DIRS = [
  NAS_PENDIENTES,
  "\\\\10.0.16.103\\tics\\Pruebas\\validados",
];

const MIME_MAP: Record<string, string> = {
  ".pdf":  "application/pdf",
  ".doc":  "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls":  "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".zip":  "application/zip",
};

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("filename");
  if (!raw) {
    return NextResponse.json({ error: "filename requerido" }, { status: 400 });
  }

  // Prevent path traversal — only allow the basename
  const safeName = path.basename(raw);
  const ext = path.extname(safeName).toLowerCase();
  const contentType = MIME_MAP[ext] ?? "application/octet-stream";

  for (const dir of NAS_DIRS) {
    const filePath = path.join(dir, safeName);
    if (fs.existsSync(filePath)) {
      try {
        const buffer = fs.readFileSync(filePath);
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `inline; filename="${safeName}"`,
            "Cache-Control": "no-store",
          },
        });
      } catch {
        return NextResponse.json({ error: "Error al leer el archivo" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ error: "Archivo no encontrado en el NAS" }, { status: 404 });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    // Prevent path traversal — only allow the basename
    const safeName = path.basename(file.name);

    // mkdir fails on UNC paths on Windows (errno -4094); skip it — NAS folder must pre-exist
    try { await fsp.mkdir(NAS_PENDIENTES, { recursive: true }); } catch { /* ignore */ }

    const destPath = path.join(NAS_PENDIENTES, safeName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fsp.writeFile(destPath, buffer);

    return NextResponse.json({ ok: true, fileName: safeName });
  } catch (err: any) {
    console.error("Error al guardar archivo en NAS:", err);
    return NextResponse.json(
      { error: err.message || "No se pudo guardar el archivo en el NAS" },
      { status: 500 }
    );
  }
}
