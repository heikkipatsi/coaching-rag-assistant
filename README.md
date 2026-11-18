# coaching-rag-assistant
RAG-based chatbot prototype for an online coach's clients: answers common training, recovery and nutrition questions from a curated knowledge base, cites its sources, and hands off to the coach when no reliable answer is found.

Online coaching clients keep asking the same questions between programs: training, recovery, nutrition and everything in between. A coach's time rarely stretches to answer them all, and many have near-universal answers that are easy to repeat.

This project is a prototype of a language-model chatbot that answers clients' most common questions based on a knowledge base curated by the coach. It cites its sources and, when no complete answer is found, refers the client to the coach.

Deliverables: a working web prototype, test data, an evaluation report and a bachelor's thesis (Oulu University of Applied Sciences).

## Getting started

Requires Node.js 24 or newer.

1. Install dependencies:
   ```
   cd app-backend
   npm install
   ```
2. Create the environment file in the repository root:
   ```
   cp .env.example .env
   ```
   Then set `ANTHROPIC_API_KEY` in `.env`. Never commit `.env`.
3. Start the backend:
   ```
   npm run dev
   ```
4. Test it (in another terminal):
   ```
   curl http://localhost:3001/api/health
   curl -X POST http://localhost:3001/api/chat
   ```
