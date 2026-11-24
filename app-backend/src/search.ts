import { getPool } from "./db.js";
import { embedTexts } from "./voyage.js";

export interface SearchResult {
  file: string;
  docTitle: string;
  section: string;
  sourceType: string;
  sourceUrl: string;
  content: string;
  distance: number; // kosinietäisyys: pienempi = lähempänä kysymystä
}

// Hakee kysymykseen merkitykseltään lähimmät k katkelmaa
export async function searchChunks(
  question: string,
  k = 3,
): Promise<SearchResult[]> {
  // Kysymys upotetaan samalla mallilla kuin aineisto, mutta tyypillä "query"
  const [vector] = await embedTexts([question], "query");

  const { rows } = await getPool().query(
    `SELECT file, doc_title, section, source_type, source_url, content,
            embedding <=> $1::vector AS distance
     FROM chunks
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [`[${vector.join(",")}]`, k], // $1 = vektori pgvectorin tekstimuodossa, $2 = k
  );

  return rows.map((r) => ({
    file: r.file,
    docTitle: r.doc_title,
    section: r.section,
    sourceType: r.source_type,
    sourceUrl: r.source_url,
    content: r.content,
    distance: Number(r.distance),
  }));
}
