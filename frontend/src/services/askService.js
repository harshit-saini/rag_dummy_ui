// This service handles the "ask a question" part of the app - the
// retrieval side of our RAG project. In real mode it just calls the
// backend's /api/ask route. In mock mode we do a tiny fake "retrieval"
// ourselves using simple keyword overlap, same idea as the backend.

import { API_BASE_URL, IS_MOCK_MODE } from './config.js'
import { mockDocuments, mockChunksByDoc } from './mockData.js'

function fakeDelay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function scoreChunk(questionWords, chunkText) {
  const chunkWords = new Set(
    chunkText.toLowerCase().replace(/[.,]/g, '').split(/\s+/),
  )
  let score = 0
  for (const word of questionWords) {
    if (chunkWords.has(word)) score += 1
  }
  return score
}

async function askMock(question, documentId) {
  await fakeDelay(700)

  const questionWords = new Set(question.toLowerCase().replace('?', '').split(/\s+/))

  const docsToSearch = documentId
    ? mockDocuments.filter((d) => d.id === documentId)
    : mockDocuments

  const scored = []
  for (const doc of docsToSearch) {
    if (doc.status !== 'ready') continue // still "processing", skip it
    const chunks = mockChunksByDoc[doc.id] || []
    for (const chunk of chunks) {
      const score = scoreChunk(questionWords, chunk.text)
      if (score > 0) scored.push({ score, doc, chunk })
    }
  }

  scored.sort((a, b) => b.score - a.score)
  const topMatches = scored.slice(0, 3)

  if (topMatches.length === 0) {
    return {
      answer:
        'I could not find anything relevant in the uploaded papers for that ' +
        'question. Try uploading a paper first or rephrasing your question.',
      sources: [],
    }
  }

  const best = topMatches[0]
  const answer = `Based on "${best.doc.name}" (page ${best.chunk.page}), ${best.chunk.text}`

  const sources = topMatches.map(({ score, doc, chunk }) => ({
    documentId: doc.id,
    documentName: doc.name,
    chunkId: chunk.chunkId,
    page: chunk.page,
    snippet: chunk.text,
    relevance: score,
  }))

  return { answer, sources }
}

export async function askQuestion(question, documentId) {
  if (IS_MOCK_MODE) {
    return askMock(question, documentId)
  }

  const response = await fetch(`${API_BASE_URL}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, documentId: documentId || null }),
  })
  if (!response.ok) {
    throw new Error('Could not get an answer right now')
  }
  return response.json()
}
