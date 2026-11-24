// Kertakäyttöinen testi: ajaa muutaman kysymyksen ja tulostaa lähimmät katkelmat.
// Ei kutsu Claudea. Ajo app-backend/-kansiossa: npx tsx --env-file=../.env src/search-test.ts
import { closePool } from "./db.js";
import { searchChunks } from "./search.js";

// expected = osio, jonka pitäisi tulla ensimmäisenä (tyhjä = aiheeton kysymys)
const questions = [
  { q: "Voinko lopettaa valmennuksen kesken kuukauden?", expected: "Jäsenyyden peruuttaminen" },
  { q: "Kuinka kauan tauko voi kestää?", expected: "Tauko jäsenyydessä" },
  { q: "Kuinka nopeasti valmentaja vastaa viesteihin?", expected: "Viestintä valmentajan kanssa" },
  { q: "Mitä teen, jos minulla on kipua?", expected: "Aina valmentajalle ohjattavat aiheet" },
  { q: "Mikä on Ranskan pääkaupunki?", expected: "" },
];

try {
  for (const { q, expected } of questions) {
    const results = await searchChunks(q, 3);
    const hit = expected && results[0].section === expected ? "OSUI" : expected ? "EI OSUNUT" : "(aiheeton)";
    console.log(`\nKysymys: ${q}  [${hit}]`);
    for (const r of results) {
      const sim = (1 - r.distance).toFixed(3);
      console.log(`  etäisyys ${r.distance.toFixed(3)} (samankaltaisuus ${sim}) | ${r.file} | ${r.section}`);
    }
  }
} finally {
  await closePool();
}
