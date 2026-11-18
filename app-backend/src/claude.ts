import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | undefined;

// Luodaan client vasta ensimmäisellä kutsulla, jotta palvelin käynnistyy ilman avainta
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY puuttuu (.env tiedostossa repon juuressa)");
  }
  client ??= new Anthropic(); // lukee avaimen ympäristöstä itse
  return client;
}

// Lähettää kysymyksen Claudelle ja palauttaa vastauksen tekstinä
export async function askClaude(question: string): Promise<string> {
  const model = process.env.ANTHROPIC_MODEL;
  if (!model) {
    throw new Error("ANTHROPIC_MODEL puuttuu (.env repon juuressa)");
  }

  const response = await getClient().messages.create({
    model,
    max_tokens: 16000,
    messages: [{ role: "user", content: question }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Claude kieltäytyi vastaamasta");
  }

  // content on lista lohkoja (text, thinking, ...) - otetaan vain tekstilohkot
  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}
