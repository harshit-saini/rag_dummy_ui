# Backend (FastAPI) - AI Research Paper Assistant

This is the optional backend for our project. The frontend works fine
without it (it shows dummy data on its own), but if you want to see the
"real" API + websocket flow, run this.

## How to run

```bash
cd backend
python -m venv venv
source venv/bin/activate   # on Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The server will start at `http://localhost:8000`.

## API endpoints

| Method | Path                              | What it does                                   |
|--------|-----------------------------------|-------------------------------------------------|
| POST   | `/api/upload`                     | Upload a paper (multipart file), starts pipeline |
| GET    | `/api/documents`                  | List all uploaded documents                    |
| GET    | `/api/documents/{id}`             | Get details for one document                   |
| GET    | `/api/documents/{id}/content`     | Get the (fake) full text/pages of a document    |
| POST   | `/api/ask`                        | Ask a question, get an answer + source citations |
| WS     | `/ws/processing/{id}`             | Live updates while a document is being processed |

## Connecting the frontend to this backend

In `frontend/.env`, set:

```
VITE_API_BASE_URL=http://localhost:8000
```

Once this is set, the frontend will call this backend instead of using
its built-in dummy data.
