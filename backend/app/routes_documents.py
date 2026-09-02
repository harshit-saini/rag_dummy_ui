# All the REST endpoints related to documents: upload, list, get one,
# and get the full "content" of a document (used by the document viewer
# modal on the frontend when the user clicks a citation).

import asyncio

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from . import store
from .websocket_manager import manager

router = APIRouter(prefix="/api", tags=["documents"])


async def run_fake_pipeline(doc_id: str):
    """This function pretends to run the document through the RAG
    pipeline. We just wait a bit and move to the next stage each time,
    broadcasting the progress over the websocket so the UI can show a
    nice progress bar. A real system would actually parse the PDF, chunk
    it, call an embedding model, etc. here."""
    for stage in store.PIPELINE_STAGES:
        # small delay so the frontend has time to actually show each stage
        await asyncio.sleep(1.2)
        doc = store.update_document_stage(doc_id, stage)
        if doc is None:
            return
        await manager.broadcast(doc_id, {
            "type": "progress",
            "documentId": doc_id,
            "status": doc["status"],
            "stageLabel": doc["stage_label"],
            "progress": doc["progress"],
        })


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    # we don't actually need to do anything with the file bytes for this
    # dummy project, but we read it so the "size" we show is real
    contents = await file.read()
    doc = store.create_document(filename=file.filename, size=len(contents))

    # kick off the fake processing pipeline in the background so the
    # upload request can return immediately (this is what makes the
    # progress bar / websocket updates actually happen over time)
    asyncio.create_task(run_fake_pipeline(doc["id"]))

    return {
        "id": doc["id"],
        "name": doc["name"],
        "size": doc["size"],
        "status": doc["status"],
        "stageLabel": doc["stage_label"],
        "progress": doc["progress"],
        "uploadedAt": doc["uploaded_at"],
    }


def _serialize(doc):
    return {
        "id": doc["id"],
        "name": doc["name"],
        "size": doc["size"],
        "status": doc["status"],
        "stageLabel": doc["stage_label"],
        "progress": doc["progress"],
        "domain": doc["domain"],
        "keywords": doc["keywords"],
        "summary": doc["summary"],
        "pages": doc["pages"],
        "uploadedAt": doc["uploaded_at"],
    }


@router.get("/documents")
async def get_documents():
    return [_serialize(d) for d in store.list_documents()]


@router.get("/documents/{doc_id}")
async def get_document(doc_id: str):
    doc = store.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return _serialize(doc)


@router.get("/documents/{doc_id}/content")
async def get_document_content(doc_id: str):
    doc = store.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    chunks = store.get_document_chunks(doc_id)
    return JSONResponse({
        "id": doc["id"],
        "name": doc["name"],
        "pages": [{"page": c["page"], "text": c["text"]} for c in chunks],
    })
