import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

// Yksi katkelma: upotettava teksti + metatiedot lähdeviitteitä varten
export interface Chunk {
  file: string; // tiedostonimi, esim. 01-peruutus-ja-tauot.md
  docTitle: string; // front matterin title
  section: string; // osion (##) otsikko
  index: number; // monesko katkelma tiedostossa (0, 1, 2, ...)
  sourceType: string; // "oma" tai "julkinen"
  sourceUrl: string; // tyhjä, jos ei ole
  text: string; // upotettava teksti (alussa otsikkoliite)
}

// Yläraja osion koolle merkkeinä (noin 460 tokenia, mitattu voyage-4:llä: ~2,6 merkkiä/token suomessa);
// pidempi osio jaetaan kappaleittain
const MAX_CHARS = 1200;

// Erottaa tiedoston alun front matterin (--- ... ---) ja varsinaisen tekstin
export function parseFrontMatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  // Siivotaan BOM (U+FEFF) ja Windowsin rivinvaihdot
  const text = raw.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { meta: {}, body: text };

  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: text.slice(match[0].length) };
}

// Jakaa tekstin ##-otsikoiden mukaan. Ennen ensimmäistä ##-otsikkoa oleva teksti jää pois.
function splitSections(body: string): { heading: string; content: string }[] {
  const sections: { heading: string; lines: string[] }[] = [];
  for (const line of body.split("\n")) {
    if (line.startsWith("## ")) {
      sections.push({ heading: line.slice(3).trim(), lines: [] });
    } else if (sections.length > 0) {
      sections[sections.length - 1].lines.push(line);
    }
  }
  return sections
    .map((s) => ({ heading: s.heading, content: s.lines.join("\n").trim() }))
    .filter((s) => s.content.length > 0);
}

// Jakaa liian pitkän osion kappaleraja kerrallaan. Yksittäistä kappaletta ei leikata.
function splitBySize(content: string, max: number): string[] {
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const parts: string[] = [];
  let current = "";
  for (const p of paragraphs) {
    if (current && current.length + p.length + 2 > max) {
      parts.push(current);
      current = p;
    } else {
      current = current ? `${current}\n\n${p}` : p;
    }
  }
  if (current) parts.push(current);
  return parts;
}

// Pilkkoo yhden dokumentin katkelmiksi
export function chunkDocument(file: string, raw: string): Chunk[] {
  const { meta, body } = parseFrontMatter(raw);
  const docTitle = meta.title || file;
  const chunks: Chunk[] = [];

  for (const section of splitSections(body)) {
    for (const part of splitBySize(section.content, MAX_CHARS)) {
      chunks.push({
        file,
        docTitle,
        section: section.heading,
        index: chunks.length,
        sourceType: meta.source_type || "",
        sourceUrl: meta.source_url || "",
        // Otsikkoliite: antaa katkelmalle asiayhteyden
        text: `${docTitle} > ${section.heading}\n\n${part}`,
      });
    }
  }
  return chunks;
}

// Lukee kansion kaikki .md-tiedostot (aakkosjärjestyksessä) ja pilkkoo ne
export async function loadCorpus(dir: string): Promise<Chunk[]> {
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md")).sort();
  const all: Chunk[] = [];
  for (const file of files) {
    const raw = await readFile(path.join(dir, file), "utf8");
    all.push(...chunkDocument(file, raw));
  }
  return all;
}
