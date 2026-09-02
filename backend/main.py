# Entry point for our FastAPI backend.
# Run it with:  uvicorn main:app --reload --port 8000
#
# This backend is completely optional for the frontend to work - the React
# app has a "mock mode" built in that shows dummy data when no backend URL
# is configured. We built this backend anyway so the project actually has
# real APIs and a real websocket behind it, like a proper RAG project would.

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.routes_documents import router as documents_router
from app.routes_ask import router as ask_router
from app.websocket_manager import manager

app = FastAPI(title="AI Research Paper Assistant - Dummy Backend")

# allow the React dev server to call this API from another port
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents_router)
app.include_router(ask_router)


@app.get("/")
async def health_check():
    # just a small route so we can quickly check the server is alive
    return {"status": "ok", "message": "RAG dummy backend is running"}


@app.websocket("/ws/processing/{doc_id}")
async def processing_socket(websocket: WebSocket, doc_id: str):
    """The frontend connects here right after uploading a paper, so it
    can receive live updates about which pipeline stage the document is
    currently in (extracting text, chunking, embedding, etc.)."""
    await manager.connect(doc_id, websocket)
    try:
        while True:
            # we don't expect the client to send anything, we just keep
            # the connection open so we can push updates to it
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(doc_id, websocket)
