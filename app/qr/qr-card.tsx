"use client";

import { QRCodeSVG } from "qrcode.react";

export default function QrCard({ url }: { url: string }) {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6 print:p-0">
      <div className="text-center max-w-sm w-full">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          📷 Fotos del pueblo
        </h1>
        <p className="text-neutral-500 mb-6">Escanea para ver y subir fotos</p>
        <div className="inline-block p-4 bg-white border border-neutral-200 rounded-2xl shadow-sm">
          <QRCodeSVG value={url} size={240} level="M" />
        </div>
        <p className="mt-6 text-sm text-neutral-400 break-all">{url}</p>
        <button
          onClick={() => window.print()}
          className="mt-6 print:hidden rounded-full bg-neutral-900 text-white px-5 py-2 text-sm"
          type="button"
        >
          Imprimir cartel
        </button>
      </div>
    </main>
  );
}
