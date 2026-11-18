import express from "express";
import { askClaude } from "./claude.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

// Muuntaa saapuvan JSON-pyynnön rungon JavaScript-objektiksi (req.body)
app.use(express.json());

// Kertoo vain, että palvelin on käynnissä
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Kovakoodattu testikysymys, myöhemmin kysymys tulee pyynnön rungosta
const TEST_QUESTION = "Kuinka paljon proteiinia pitäisi syödä lihaskasvun tukemiseen?";

app.post("/api/chat", async (_req, res) => {
  try {
    const answer = await askClaude(TEST_QUESTION);
    res.json({ answer });
  } catch (err) {
    // Lokiin vain viesti, ei koko virheoliota
    console.error("Chat-virhe:", err instanceof Error ? err.message : err);
    res.status(500).json({ error: "Vastauksen haku epäonnistui" });
  }
});

app.listen(port, () => {
  console.log(`Backend kuuntelee portissa ${port}`);
});
