"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const MAX_DIM = 1600;
const JPEG_QUALITY = 0.82;

/** Resizes/compresses an image client-side before upload. Falls back to the
 * original file if the browser can't do canvas resizing for some reason. */
async function resizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), "image/jpeg", JPEG_QUALITY);
  });
}

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFile(f: File | undefined | null) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Elige o haz una foto primero.");
      return;
    }
    if (!caption.trim()) {
      setError("Escribe una descripción para la foto.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      let uploadBlob: Blob = file;
      try {
        uploadBlob = await resizeImage(file);
      } catch {
        // Keep the original file if resizing isn't supported.
      }

      const form = new FormData();
      form.append("file", uploadBlob, file.name.replace(/\.[^.]+$/, "") + ".jpg");
      form.append("caption", caption.trim());
      form.append("name", name.trim());

      const res = await fetch("/api/photos", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir la foto.");

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la foto.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="text-neutral-500 text-sm"
            type="button"
          >
            ← Volver
          </button>
          <h1 className="text-base font-semibold text-neutral-900">
            Subir una foto
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {preview ? (
            <div className="relative rounded-xl overflow-hidden border border-neutral-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Vista previa" className="w-full h-auto block" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-3 right-3 rounded-full bg-black/60 text-white text-xs px-3 py-1.5"
              >
                Cambiar foto
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-4/3 rounded-xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 text-neutral-500 hover:border-accent hover:text-accent transition-colors"
            >
              <span className="text-3xl">📷</span>
              <span className="text-sm">Toca para hacer o elegir una foto</span>
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Descripción
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={280}
            rows={3}
            placeholder="¿Qué se ve en la foto?"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <p className="mt-1 text-xs text-neutral-400 text-right">
            {caption.length}/280
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Tu nombre (opcional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Anónimo"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-accent text-white py-3 text-sm font-medium hover:bg-accent-dark transition-colors disabled:opacity-50"
        >
          {submitting ? "Subiendo…" : "Subir foto"}
        </button>
      </form>
    </main>
  );
}
