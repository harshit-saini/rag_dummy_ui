// This service handles everything about documents: uploading a new paper,
// listing the ones we already have, and fetching the full "content" of a
// document (used by the viewer popup). Every function checks IS_MOCK_MODE
// first - if true, it just returns fake data instead of calling a server.

import { API_BASE_URL, IS_MOCK_MODE } from './config.js'
import { mockDocuments, createMockDocument, getMockDocument, mockChunksByDoc } from './mockData.js'

// tiny helper so mock mode still "feels" like a network call
function fakeDelay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function uploadDocument(file) {
  if (IS_MOCK_MODE) {
    await fakeDelay(600)
    return createMockDocument(file.name, file.size)
  }

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) {
    throw new Error('Upload failed, please try again')
  }
  return response.json()
}

export async function fetchDocuments() {
  if (IS_MOCK_MODE) {
    await fakeDelay(300)
    // return a copy so nobody outside accidentally mutates our fake db
    return [...mockDocuments]
  }

  const response = await fetch(`${API_BASE_URL}/api/documents`)
  if (!response.ok) {
    throw new Error('Could not load documents')
  }
  return response.json()
}

export async function fetchDocumentContent(documentId) {
  if (IS_MOCK_MODE) {
    await fakeDelay(300)
    const doc = getMockDocument(documentId)
    const pages = mockChunksByDoc[documentId] || []
    return {
      id: documentId,
      name: doc ? doc.name : 'Unknown document',
      pages: pages.map((p) => ({ page: p.page, text: p.text })),
    }
  }

  const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/content`)
  if (!response.ok) {
    throw new Error('Could not load document content')
  }
  return response.json()
}
