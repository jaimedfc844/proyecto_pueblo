# Fotos del pueblo

A shared photo gallery: anyone with the link (or who scans the QR code) can upload a photo with a caption, and it shows up immediately for everyone else. Built with Next.js, Vercel Blob (photo storage) and Postgres/Neon (captions + metadata).

## Pages

- `/` — the gallery (public, no login).
- `/upload` — the upload form (photo + caption + optional name).
- `/qr` — a printable page with a QR code pointing at the site, for posting at the event.

## Local development

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` (see "Provisioning storage" below — you can point local dev at the same Vercel-hosted Postgres/Blob store you use in production, or set up your own).
3. Run the dev server:
   ```
   npm run dev
   ```
4. Open http://localhost:3000

The photos table (`photos`) is created automatically on first request — no manual migration needed.

## Deploying to Vercel

1. Push this repo to GitHub (or any git provider), then import it at https://vercel.com/new — or deploy straight from the CLI:
   ```
   npx vercel
   ```
2. **Add a Postgres database:** in the Vercel project dashboard → Storage → Create Database → choose Postgres (Neon). Connect it to the project; this sets `DATABASE_URL` automatically.
3. **Add Blob storage:** Storage → Create Database → Blob. Connect it to the project; this sets `BLOB_READ_WRITE_TOKEN` automatically.
4. Redeploy (or trigger a new deploy) so the new env vars take effect.
5. Visit `https://<your-project>.vercel.app/qr` to get the printable QR code — it automatically encodes whatever domain you're viewing it from, so it works the same on a custom domain if you add one later.

## Notes / things you may want to change

- **Moderation:** uploads currently go live immediately with no approval step, per the "open event gallery" design. If you'd rather review photos before they're public, add a `status` column (e.g. `pending`/`approved`) and an admin page to approve — ask and I can add this.
- **Abuse protection:** basic validation only (image type, 10MB size cap, non-empty caption). For a public link at a real event, consider adding simple rate limiting if it becomes an issue.
- **Language:** UI copy is in Spanish (matching the project name). Ask if you'd like it in another language, or bilingual.
- **Image size:** photos are resized/compressed client-side (max 1600px, JPEG ~82% quality) before upload to keep storage and load times reasonable.
