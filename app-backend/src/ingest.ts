// Syöttö: lukee korpuksen, upottaa katkelmat (Voyage) ja tallentaa ne tietokantaan.
// Tyhjentää taulun ja kirjoittaa kaiken uudelleen joka ajolla.
// Ajo app-backend/-kansiossa: npm run ingest
import path from "node:path";
import { loadCorpus } from "./chunk.js";
import { closePool, getPool, initSchema } from "./db.js";
import { embedTexts } from "./voyage.js";

const EXPECTED_DIMS = 1024; // pitää vastata taulun vector(1024) -saraketta

try {
  // Kanta ensin: jos se ei vastaa, ei tehdä turhaa API-kutsua
  await initSchema();

  const chunks = await loadCorpus(path.resolve("../data/corpus"));
  console.log(`Katkelmia: ${chunks.length}`);

  // Yksi kutsu kaikille katkelmille (pieni aineisto; isolla aineistolla pitää jakaa erissä)
  const vectors = await embedTexts(
    chunks.map((c) => c.text),
    "document",
  );
  if (vectors.length !== chunks.length) {
    throw new Error(`Vektoreita ${vectors.length}, katkelmia ${chunks.length}`);
  }
  if (vectors.some((v) => v.length !== EXPECTED_DIMS)) {
    throw new Error(`Vektorin pituus ei ole ${EXPECTED_DIMS} (mallia vaihdettu?)`);
  }

  // Transaktio: joko kaikki onnistuu tai taulu pysyy ennallaan
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("TRUNCATE chunks RESTART IDENTITY");
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      await client.query(
        `INSERT INTO chunks
           (file, chunk_index, doc_title, section, source_type, source_url, content, embedding)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::vector)`,
        [
          c.file,
          c.index,
          c.docTitle,
          c.section,
          c.sourceType,
          c.sourceUrl,
          c.text,
          `[${vectors[i].join(",")}]`, // pgvectorin tekstimuoto
        ],
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  console.log(`Tallennettu ${chunks.length} katkelmaa tauluun chunks.`);
} finally {
  await closePool();
}
