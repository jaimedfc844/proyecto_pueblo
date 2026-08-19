import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Created lazily (not at module load) so build/type-check steps that never
// actually run a query don't require DATABASE_URL to be set.
let sql: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  if (!sql) {
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL_UNPOOLED ||
      "";
    if (!connectionString) {
      throw new Error(
        "No DATABASE_URL/POSTGRES_URL found. Set one in your environment (see README).",
      );
    }
    sql = neon(connectionString);
  }
  return sql;
}

let tableReady: Promise<unknown> | null = null;

function ensureTable() {
  if (!tableReady) {
    tableReady = getSql()`
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        blob_url TEXT NOT NULL,
        caption TEXT NOT NULL,
        uploader_name TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
  }
  return tableReady;
}

export type Photo = {
  id: number;
  blob_url: string;
  caption: string;
  uploader_name: string | null;
  created_at: string;
};

export async function getPhotos(): Promise<Photo[]> {
  await ensureTable();
  const rows = await getSql()`
    SELECT id, blob_url, caption, uploader_name, created_at
    FROM photos
    ORDER BY created_at DESC
  `;
  return rows as unknown as Photo[];
}

export async function addPhoto(
  blobUrl: string,
  caption: string,
  uploaderName: string | null,
): Promise<void> {
  await ensureTable();
  await getSql()`
    INSERT INTO photos (blob_url, caption, uploader_name)
    VALUES (${blobUrl}, ${caption}, ${uploaderName})
  `;
}
