# AI Research Paper Assistant - RAG UI (College Project)

This is our college project UI for the "AI Research Paper Assistant" idea:
a web app where you can upload research papers, watch them get processed
through a RAG (Retrieval Augmented Generation) style pipeline, and then
ask questions about them and get answers with citations back to the
source document/page.

## Project structure

```
frontend/   React + Redux Toolkit app (the actual UI)
backend/    FastAPI backend with the real APIs + websocket (optional)
```

## Important: dummy data mode

We were asked to build this so that it works **even without a real
backend**. Here is how that works:

- The frontend reads an env variable called `VITE_API_BASE_URL`.
- If it is **empty/not set**, the app automatically shows **dummy/sample
  data** - fake documents, fake processing progress, fake answers. No
  backend needs to be running at all, you can just run `npm run dev`
  inside `frontend/` and everything works.
- If you **do** set `VITE_API_BASE_URL` (for example to
  `http://localhost:8000`), the app switches to calling the real FastAPI
  backend for uploads, document list, the processing websocket, and
  question answering.

This logic lives in `frontend/src/services/config.js` and is used by all
the other files inside `frontend/src/services/`.

## Running just the frontend (dummy mode, quickest way to see it)

```bash
cd frontend
npm install
npm run dev
```

Then open the URL vite prints (usually `http://localhost:5173`).

## Running frontend + backend together

1. Start the backend:
   ```bash
   cd backend
   python -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```
2. Create `frontend/.env` (copy from `frontend/.env.example`) and set:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```
3. Start the frontend as shown above.

## What the app can do

- **Upload a paper** and see it move through the pipeline stages
  (extracting text -> chunking -> generating embeddings -> indexing ->
  ready) live, updated over a websocket.
- **See a list of uploaded papers** with a summary, domain, and keywords
  once processing is done.
- **Open the full document** in a popup to read through its (fake) pages.
- **Ask questions** about a specific paper or across all papers, and get
  an answer along with **source citations** (document name + page number)
  that you can click to jump straight to that part of the document.

## Tech used

- React (Vite)
- Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) for state management
- Plain CSS, no UI framework
- FastAPI + WebSockets for the optional backend
