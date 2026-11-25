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
- Lue `docs/tyoloki.md` istunnon alussa, niin tiedät missä mennään. Pidä se ajan tasalla
  jokaisen valmistuneen askeleen jälkeen: mitä tehtiin, komennot, perustelut ja testitulokset.
  Se on tekninen loki, ei raporttitekstiä. Tiedosto on `.gitignore`ssa, eikä sitä commitoida.

## Arkkitehtuuri (korkea taso)
Asiakas (selain) ⇄ Frontend ⇄ Backend → (Upotus-API, Vektorikanta, Kielimalli-API)

- Frontend: Vite + React + TypeScript
- Backend: Node.js + Express (TypeScript, tsx)
- Vektorikanta: PostgreSQL + pgvector (Docker, `docker-compose.yml`); Qdrant jäi varavaihtoehdoksi
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
Aineisto on kuvitteellisen valmennusyrityksen sisältöä. **Päätös (alustava):** aloitetaan
pienellä omalla aineistolla (`data/corpus/`, Markdown + front matter, `source_type: oma`).
Julkisia lähteitä (THL, UKK) voi lisätä myöhemmin samassa muodossa (`source_type: julkinen`).
Korpus jäädytetään ennen varsinaista evaluointia, koska dokumenttien lisäys muuttaa
hakutuloksia. Perustelut ja nykyiset dokumentit: `docs/tyoloki.md` kohta 5.
Korpuksen laajennuksista ehdota ja kysy ennen kuin teet mitään.

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
Valmiina (viikko 47): repon runko, backend, korpuksen alustava päätös ja esimerkkidokumentit,
upotukset (Voyage), pilkkominen, pgvector, haku ja RAG-vastaus (`POST /api/chat` hakee
katkelmat ja vastaa niiden perusteella).
Seuraavaksi: etäisyysraja "ei löydy → ohjaa valmentajalle" (perustellaan evaluointikysymyksillä),
frontend, evaluointi (`eval/`), raportti.

## Seuraavat askeleet
Tarkka tilanne ja päätökset ovat `docs/tyoloki.md`:ssä (kohta "Seuraavaksi").
1. Etäisyysrajan päätös (tarvitaan enemmän kysymyksiä kuin nykyiset 5) ja lähteiden
   piilotus, kun mikään katkelma ei ole riittävän lähellä.
2. Frontend (Vite + React + TypeScript), kun backend on vakaa.
3. Evaluointikysymykset ja L1/L2-vertailu kansioon `eval/`; korpus jäädytetään ennen sitä.
