// Voyage AI:n upotusrajapinta (tavallinen HTTP-kutsu, ei erillistä kirjastoa)
const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";

// "document" = tallennettava aineisto, "query" = käyttäjän kysymys
export type InputType = "document" | "query";

interface VoyageResponse {
  data: { embedding: number[]; index: number }[];
}

// Muuttaa tekstit vektoreiksi. Palauttaa yhden vektorin per teksti samassa järjestyksessä.
export async function embedTexts(
  texts: string[],
  inputType: InputType,
): Promise<number[][]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  const model = process.env.VOYAGE_MODEL;
  if (!apiKey) throw new Error("VOYAGE_API_KEY puuttuu (.env repon juuressa)");
  if (!model) throw new Error("VOYAGE_MODEL puuttuu (.env repon juuressa)");

  const res = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ input: texts, model, input_type: inputType }),
  });

  if (!res.ok) {
    throw new Error(`Voyage-virhe ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as VoyageResponse;
  return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}
