# This file is basically the "fake database" for our project.
# In a real RAG system we would use something like Postgres + a vector DB
# (Pinecone / Chroma / FAISS) but for our college project we just keep
# everything in a python dictionary in memory. Every time the server
# restarts, all uploaded papers are gone. That is totally fine for a demo.

import random
import time
import uuid

# ---------------------------------------------------------------------------
# These are the stages our "RAG pipeline" pretends to go through.
# We made these names up based on what we studied about how RAG systems
# work: first you read the file, then you split it into chunks, then you
# turn the chunks into embeddings, then you put those embeddings in an
# index so they can be searched later.
# ---------------------------------------------------------------------------
PIPELINE_STAGES = [
    {"key": "uploaded", "label": "File uploaded", "progress": 5},
    {"key": "extracting_text", "label": "Extracting text from PDF", "progress": 25},
    {"key": "chunking", "label": "Splitting document into chunks", "progress": 50},
    {"key": "generating_embeddings", "label": "Generating embeddings", "progress": 75},
    {"key": "indexing", "label": "Adding chunks to vector index", "progress": 90},
    {"key": "ready", "label": "Ready for questions", "progress": 100},
]

# Small pool of made up research domains so every paper does not look the same.
DOMAINS = [
    "Natural Language Processing",
    "Computer Vision",
    "Machine Learning",
    "Deep Learning",
    "Information Retrieval",
]

# Made up keyword pool, we just randomly pick a few of these per document.
KEYWORD_POOL = [
    "transformers", "attention mechanism", "semantic search", "embeddings",
    "neural networks", "fine-tuning", "text classification", "summarization",
    "vector database", "self-supervised learning", "tokenization",
    "knowledge graph", "question answering", "retrieval augmented generation",
]

# A few canned summary sentences. We just stitch 2-3 of these together so
# every document gets a "unique-ish" summary without us needing a real
# summarizer model (that would be way too much for this project).
SUMMARY_SENTENCES = [
    "This paper presents a new approach to improve model performance on the given task.",
    "The authors evaluate their method on multiple benchmark datasets and report improved results.",
    "A key contribution of this work is a more efficient way to process large amounts of text data.",
    "The proposed technique reduces training time while keeping accuracy competitive with existing methods.",
    "Experimental results show that the method generalizes well across different domains.",
    "The paper also discusses limitations of the approach and possible directions for future work.",
]

# Fake "pages" of content for every document, so that when the user opens
# the document viewer or asks a question, we have something to search
# through and to show on screen with page numbers.
FAKE_PAGE_TEMPLATES = [
    "Introduction: In recent years, research on {domain} has grown rapidly. "
    "This section motivates the problem and explains why {keyword} is important.",
    "Related Work: Several prior studies have explored {keyword} in the context of {domain}. "
    "We build on these ideas and extend them further.",
    "Methodology: We describe our proposed pipeline which makes use of {keyword} "
    "to solve the problem more effectively than earlier baselines.",
    "Experiments: We test our approach on standard datasets related to {domain} and "
    "compare it against baseline models using {keyword}.",
    "Results and Discussion: Our model outperforms the baseline and we analyse why "
    "{keyword} helped improve the results for {domain} tasks.",
    "Conclusion: We summarise our findings on {domain} and highlight how {keyword} "
    "can be used in future research.",
]

# In-memory "tables"
documents = {}   # doc_id -> document dict
chunks_by_doc = {}  # doc_id -> list of chunk dicts


def _make_fake_pages(domain, keywords):
    """Builds a small set of fake pages/chunks for a newly uploaded doc."""
    pages = []
    for i, template in enumerate(FAKE_PAGE_TEMPLATES):
        keyword = keywords[i % len(keywords)]
        text = template.format(domain=domain, keyword=keyword)
        pages.append({
            "chunk_id": str(uuid.uuid4()),
            "page": i + 1,
            "text": text,
        })
    return pages


def create_document(filename: str, size: int) -> dict:
    """Called right after a file is uploaded. Creates the document record
    and picks a random domain / keyword set / fake pages for it."""
    doc_id = str(uuid.uuid4())
    domain = random.choice(DOMAINS)
    keywords = random.sample(KEYWORD_POOL, k=4)
    pages = _make_fake_pages(domain, keywords)
    summary = " ".join(random.sample(SUMMARY_SENTENCES, k=3))

    doc = {
        "id": doc_id,
        "name": filename,
        "size": size,
        "status": "uploaded",
        "stage_label": PIPELINE_STAGES[0]["label"],
        "progress": PIPELINE_STAGES[0]["progress"],
        "domain": domain,
        "keywords": keywords,
        "summary": summary,
        "pages": len(pages),
        "uploaded_at": time.time(),
    }

    documents[doc_id] = doc
    chunks_by_doc[doc_id] = pages
    return doc


def get_document(doc_id: str):
    return documents.get(doc_id)


def list_documents():
    # newest documents first, looks nicer in the UI
    return sorted(documents.values(), key=lambda d: d["uploaded_at"], reverse=True)


def get_document_chunks(doc_id: str):
    return chunks_by_doc.get(doc_id, [])


def update_document_stage(doc_id: str, stage: dict):
    doc = documents.get(doc_id)
    if not doc:
        return None
    doc["status"] = stage["key"]
    doc["stage_label"] = stage["label"]
    doc["progress"] = stage["progress"]
    return doc
