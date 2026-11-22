// Kertakäyttöinen testi: tulostaa korpuksen katkelmat. Ei kutsu Voyagea eikä tietokantaa.
// Ajo app-backend/-kansiossa: npx tsx src/chunk-test.ts
import path from "node:path";
import { loadCorpus } from "./chunk.js";

const chunks = await loadCorpus(path.resolve("../data/corpus"));

for (const c of chunks) {
  console.log(`--- ${c.file} #${c.index} | osio: ${c.section} | ${c.text.length} merkkiä | ${c.sourceType}`);
  console.log(c.text);
  console.log();
}
console.log(`Katkelmia yhteensä: ${chunks.length}`);
console.log(`Pisin katkelma: ${Math.max(...chunks.map((c) => c.text.length))} merkkiä`);
