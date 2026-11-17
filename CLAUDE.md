# CLAUDE.md – opinnäytetyön koodiosuus

## Kuka ja mikä
Käyttäjä on OAMK:n ICT-opiskelija ja tekee opinnäytetyötä yksin.
Työn nimi: "Kielimallipohjainen valmennusavustaja – RAG-chatbotin suunnittelu,
toteutus ja evaluointi". Työ on tehtävä **18.12.2026** mennessä. Työ valmistuu OAMK:lle
toimeksiantajana, ja aihe on kuvitteellinen verkkovalmennusyritys.
Tämä repo (coaching-rag-assistant) on työn käytännön osuus: toimiva RAG-chatbot-prototyyppi.
**Raporttitekstin käyttäjä kirjoittaa itse – älä kirjoita sitä hänen puolestaan.**

## Miten työskennellään
- Tavoite on oppia ja pystyä selittämään jokainen ratkaisu raportissa ja arvioinnissa.
  Kerro ennen koodia, mitä ollaan tekemässä ja miksi. Selitä uudet käsitteet lyhyesti.
- Etene pienissä, testattavissa askelissa. Yksi tiedosto tai ominaisuus kerrallaan,
  ja ajetaan se ennen seuraavaa.
- Älä rakenna isoja kokonaisuuksia kysymättä. Ehdota ensin, käyttäjä päättää.
- Kommentoi koodi suomeksi tai englanniksi lyhyesti, mutta älä liikaa.
- Pidä scope pieni. Aikaa on rajallisesti (n. 8–14 h koodaukseen), joten MVP ensin.
- Kerro suoraan, jos jokin valinta on huono tai jos jokin on tehtävä toisin.

## Arkkitehtuuri (korkea taso)
Asiakas (selain) ⇄ Frontend ⇄ Backend → (Upotus-API, Vektorikanta, Kielimalli-API)

- Frontend: Vite + React + TypeScript
- Backend: Node.js + Express (TypeScript, tsx)
- Vektorikanta: PostgreSQL + pgvector (varalla Qdrant)
- Kielimalli: Claude (Anthropic API). Mallin nimi tulee ympäristömuuttujasta, ei kovakoodattuna.
- Upotukset: Anthropicilla ei ole omaa upotusmallia, joten käytetään Voyage AI:ta.
- API-avaimet vain backendin .env-tiedostossa. Frontend ei koskaan saa avaimia
  (VITE_-muuttujat päätyvät selaimeen).

## RAG-putki (toteutettava)
Esikäsittely (kerran / aineiston muuttuessa):
  korpus → pilkkominen (muutaman sadan tokenin katkelmat) → upotukset → vektoritietokanta

Kyselyvaihe (jokaisella kysymyksellä):
  kysymys → upotus (sama malli kuin aineistolla) → lähimpien katkelmien haku
  → katkelmat kielimallin kehotteeseen → vastaus katkelmien perusteella

Haku tehdään joka kysymyksellä, ei vain silloin kun malli ei tiedä.

## Korpus
Aineisto on kuvitteellisen valmennusyrityksen sisältöä. Vaihtoehdot: oma kirjoitettu
sisältö, julkiset suositukset (THL, UKK) tai molemmat. **Päätös on vielä tekemättä.**
Ehdota ja kysy ennen kuin teet mitään.

## Evaluointi (myöhemmin)
Vertailu: L1 = pelkkä kielimalli ilman RAG:ia, L2 = RAG. Metriikat: recall@k (haku),
faithfulness (vastaus pysyy lähteissä), käyttäjien arviot / SUS. Kansio `eval/` on tähän.

## Repon rakenne
```
app-frontend/  app-backend/  data/  eval/  docs/
```
(Kansiot ovat `app-frontend/` ja `app-backend/`, ei `frontend/` / `backend/`.)

- `.env` ei koskaan commitiin. Repo muuttuu julkiseksi, joten `.gitignore` ja
  `.env.example` pidetään kunnossa, ja tarkistetaan ettei historiassa ole avaimia.

## Aikataulu
Viikko 47 (nyt): repon runko, backend kutsuu Claudea kovakoodatulla kysymyksellä,
korpuksen päätös, upotukset (Voyage) + pgvector.
Sen jälkeen: kyselyvaihe, frontend, evaluointi, raportti.

## Seuraavat askeleet
1. Tarkista, mitä repossa jo on, ja ehdota runko (kansiot, .gitignore, .env.example, README).
2. Alusta backend (Express + TypeScript) ja tee `POST /api/chat`, joka lähettää
   kovakoodatun kysymyksen Claudelle ja palauttaa vastauksen. Avain .env:stä.
3. Testataan curlilla. Sitten pieni commit.

Älä tee vielä frontendiä tai vektorikantaa ennen kuin askel 2 toimii.
