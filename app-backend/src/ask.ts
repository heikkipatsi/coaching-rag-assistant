// Komentorivikysely demoa varten: haku + vastaus ilman HTTP-palvelinta.
// Ajo app-backend/-kansiossa: npm run ask "Kuinka kauan tauko voi kestää?"
import { askClaude } from "./claude.js";
import { closePool } from "./db.js";
import { searchChunks } from "./search.js";

const question = process.argv.slice(2).join(" ").trim();

if (!question) {
  console.error('Anna kysymys: npm run ask "Kysymys tähän"');
  process.exitCode = 1;
} else {
  try {
    const chunks = await searchChunks(question); // oletus k = 3, sama kuin chat-reitillä
    const answer = await askClaude(question, chunks);

    console.log(`\nKysymys: ${question}\n\n${answer}\n\nHaetut katkelmat (pienempi etäisyys = lähempänä):`);
    for (const c of chunks) {
      console.log(`  ${c.distance.toFixed(3)} | ${c.docTitle} > ${c.section}`);
    }
  } finally {
    await closePool();
  }
}
