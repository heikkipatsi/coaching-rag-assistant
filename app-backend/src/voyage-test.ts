// Kertakäyttöinen testi: ajetaan käsin, ei osa palvelinta.
// Ajo: npx tsx --env-file=../.env src/voyage-test.ts
import { embedTexts } from "./voyage.js";

// Kosinisamankaltaisuus: lähellä 1 = samaa merkitystä, lähellä 0 = ei yhteyttä
function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

const question = "Voinko lopettaa valmennuksen kesken kuukauden?";
const docs = [
  "Valmennusjäsenyyden voi lopettaa milloin tahansa, ja peruutus astuu voimaan laskutuskauden lopussa.",
  "Kissa nukkuu sohvalla ja katselee ikkunasta lintuja.",
];

const [q] = await embedTexts([question], "query");
const vectors = await embedTexts(docs, "document");

console.log("Vektorin pituus (dimensio):", q.length);
console.log("Kaksi ensimmäistä lukua:", q[0], q[1]);
console.log("Samankaltaisuus, aiheeseen sopiva:", cosine(q, vectors[0]).toFixed(3));
console.log("Samankaltaisuus, aiheeton:       ", cosine(q, vectors[1]).toFixed(3));
