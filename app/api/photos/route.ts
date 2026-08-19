import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { addPhoto, getPhotos } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_CAPTION_LEN = 280;
const MAX_NAME_LEN = 80;

export async function GET() {
  try {
    const photos = await getPhotos();
    return NextResponse.json({ photos });
  } catch (err) {
    console.error("Failed to load photos:", err);
    return NextResponse.json(
      { error: "No se han podido cargar las fotos." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const captionRaw = form.get("caption");
    const nameRaw = form.get("name");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Falta la foto." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen." },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "La imagen es demasiado grande (máx. 10MB)." },
        { status: 400 },
      );
    }

    const caption =
      typeof captionRaw === "string" ? captionRaw.trim() : "";
    if (!caption) {
      return NextResponse.json(
        { error: "La descripción no puede estar vacía." },
        { status: 400 },
      );
    }
    if (caption.length > MAX_CAPTION_LEN) {
      return NextResponse.json(
        {
          error: `La descripción debe tener menos de ${MAX_CAPTION_LEN} caracteres.`,
        },
        { status: 400 },
      );
    }

    const name =
      typeof nameRaw === "string" ? nameRaw.trim().slice(0, MAX_NAME_LEN) : "";

    const ext = file.type.split("/")[1]?.split("+")[0] || "jpg";
    const filename = `photos/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    await addPhoto(blob.url, caption, name || null);

    return NextResponse.json({ ok: true, url: blob.url });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json(
      { error: "Error al subir la foto. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
