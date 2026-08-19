import Link from "next/link";
import { getPhotos, type Photo } from "@/lib/db";

export const dynamic = "force-dynamic";

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

function PhotoCard({ photo }: { photo: Photo }) {
  return (
    <figure className="mb-4 break-inside-avoid rounded-xl overflow-hidden bg-white shadow-sm border border-neutral-200">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.blob_url}
        alt={photo.caption}
        className="w-full h-auto block"
        loading="lazy"
      />
      <figcaption className="p-3">
        <p className="text-sm text-neutral-800 whitespace-pre-wrap break-words">
          {photo.caption}
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          {photo.uploader_name ? `${photo.uploader_name} · ` : ""}
          {timeAgo(photo.created_at)}
        </p>
      </figcaption>
    </figure>
  );
}

export default async function Home() {
  let photos: Photo[] = [];
  let loadError = false;
  try {
    photos = await getPhotos();
  } catch (err) {
    console.error("Failed to load photos:", err);
    loadError = true;
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-neutral-900">
            📷 Fotos del pueblo
          </h1>
          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-700 transition"
          >
            + Subir foto
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {loadError ? (
          <div className="text-center py-24 text-neutral-500">
            <p className="text-4xl mb-3">⚠️</p>
            <p>No se han podido cargar las fotos ahora mismo.</p>
            <p className="text-sm">Vuelve a intentarlo en un momento.</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-24 text-neutral-500">
            <p className="text-4xl mb-3">📭</p>
            <p>Todavía no hay fotos.</p>
            <p className="text-sm">¡Sé el primero en subir una!</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
            {photos.map((p) => (
              <PhotoCard key={p.id} photo={p} />
            ))}
          </div>
        )}
      </div>

      <Link
        href="/upload"
        className="sm:hidden fixed bottom-5 right-5 rounded-full bg-neutral-900 text-white w-14 h-14 flex items-center justify-center text-2xl shadow-lg"
        aria-label="Subir foto"
      >
        +
      </Link>
    </main>
  );
}
