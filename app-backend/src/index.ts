import express from "express";
import { askClaude } from "./claude.js";
import { searchChunks } from "./search.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

// Muuntaa saapuvan JSON-pyynnön rungon JavaScript-objektiksi (req.body)
app.use(express.json());

// Kertoo vain, että palvelin on käynnissä
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const K = 3; // montako katkelmaa haetaan (evaluoinnissa muuttuja: recall@k)
const MAX_QUESTION_LENGTH = 500;

app.post("/api/chat", async (req, res) => {
  // Pyynnön runko tulee ulkopuolelta, joten se tarkistetaan ennen maksullisia kutsuja.
  // req.body voi puuttua kokonaan, jos Content-Type ei ole JSON.
  const question = req.body?.question;
  if (typeof question !== "string" || question.trim() === "") {
    res.status(400).json({ error: "Kenttä 'question' (teksti) puuttuu tai on tyhjä" });
    return;
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    res.status(400).json({ error: `Kysymys on liian pitkä (enintään ${MAX_QUESTION_LENGTH} merkkiä)` });
    return;
  }

  try {
    const chunks = await searchChunks(question, K);
    const answer = await askClaude(question, chunks);
    // Lähteet mukaan vastaukseen (frontend ja evaluointi tarvitsevat ne)
    const sources = chunks.map((c) => ({
      docTitle: c.docTitle,
      section: c.section,
      sourceUrl: c.sourceUrl,
      distance: c.distance,
    }));
    res.json({ answer, sources });
  } catch (err) {
    // Lokiin vain viesti, ei koko virheoliota
    console.error("Chat-virhe:", err instanceof Error ? err.message : err);
    res.status(500).json({ error: "Vastauksen haku epäonnistui" });
  }
});

app.listen(port, () => {
  console.log(`Backend kuuntelee portissa ${port}`);
});
