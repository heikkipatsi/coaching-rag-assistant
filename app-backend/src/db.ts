import pg from "pg";

let pool: pg.Pool | undefined;

// Yhteys luodaan vasta ensimmäisellä käytöllä. Arvot tulevat .env:stä (samat kuin docker-compose.yml:ssä).
export function getPool(): pg.Pool {
  if (!pool) {
    const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, DB_PORT } = process.env;
    if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB) {
      throw new Error("POSTGRES_USER/PASSWORD/DB puuttuu (.env repon juuressa)");
    }
    pool = new pg.Pool({
      host: "localhost",
      port: Number(DB_PORT) || 5432,
      user: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      database: POSTGRES_DB,
    });
  }
  return pool;
}

// Sulkee yhteydet, jotta kertakäyttöinen skripti pääsee päättymään
export async function closePool(): Promise<void> {
  await pool?.end();
  pool = undefined;
}

// Luo pgvector-laajennuksen ja katkelmataulun, jos niitä ei vielä ole
export async function initSchema(): Promise<void> {
  const db = getPool();
  await db.query("CREATE EXTENSION IF NOT EXISTS vector");
  await db.query(`
    CREATE TABLE IF NOT EXISTS chunks (
      id serial PRIMARY KEY,
      file text NOT NULL,
      chunk_index int NOT NULL,
      doc_title text NOT NULL,
      section text NOT NULL,
      source_type text NOT NULL DEFAULT '',
      source_url text NOT NULL DEFAULT '',
      content text NOT NULL,
      embedding vector(1024) NOT NULL,
      UNIQUE (file, chunk_index)
    )
  `);
}
