# This is our "retrieval" endpoint. In a real RAG project this is where
# you would embed the question, search a vector database for the closest
# chunks, and then send those chunks + the question to an LLM to get the
# final answer. Since we don't have any real ML models here, we fake the
# retrieval step using simple keyword overlap between the question and
# our fake document chunks. It's not smart, but it is enough to show how
# the UI is supposed to behave.

from fastapi import APIRouter
from pydantic import BaseModel

from . import store

router = APIRouter(prefix="/api", tags=["ask"])


class AskRequest(BaseModel):
    question: str
    documentId: str | None = None  # if not given, search across all documents


def _score_chunk(question_words: set, chunk_text: str) -> int:
    chunk_words = set(chunk_text.lower().replace(".", "").replace(",", "").split())
    return len(question_words & chunk_words)


@router.post("/ask")
async def ask_question(payload: AskRequest):
    question_words = set(payload.question.lower().replace("?", "").split())

    # decide which documents we are allowed to search through
    if payload.documentId:
        doc_ids = [payload.documentId] if store.get_document(payload.documentId) else []
    else:
        doc_ids = list(store.documents.keys())

    scored_chunks = []
    for doc_id in doc_ids:
        doc = store.get_document(doc_id)
        if not doc or doc["status"] != "ready":
            # skip documents that are still being processed
            continue
        for chunk in store.get_document_chunks(doc_id):
            score = _score_chunk(question_words, chunk["text"])
            if score > 0:
                scored_chunks.append((score, doc, chunk))

    # sort best matches first, keep the top 3 as our "sources"
    scored_chunks.sort(key=lambda item: item[0], reverse=True)
    top_matches = scored_chunks[:3]

    if not top_matches:
        return {
            "answer": "I could not find anything relevant in the uploaded papers "
                      "for that question. Try uploading a paper first or "
                      "rephrasing your question.",
            "sources": [],
        }

    # build a simple templated answer using the best matching chunk
    best_score, best_doc, best_chunk = top_matches[0]
    answer = (
        f"Based on \"{best_doc['name']}\" (page {best_chunk['page']}), "
        f"{best_chunk['text']}"
    )

    sources = [
        {
            "documentId": doc["id"],
            "documentName": doc["name"],
            "chunkId": chunk["chunk_id"],
            "page": chunk["page"],
            "snippet": chunk["text"],
            "relevance": score,
        }
        for score, doc, chunk in top_matches
    ]

    return {"answer": answer, "sources": sources}
