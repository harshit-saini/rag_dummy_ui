// This service is in charge of the "live progress" updates while a paper
// is going through the RAG pipeline (extracting text -> chunking ->
// embeddings -> indexing -> ready).
//
// In real mode we open an actual WebSocket to the backend.
// In mock mode there is no server to connect to, so we just fake the
// same behaviour with setTimeout, stepping through the pipeline stages
// one by one and calling the same onUpdate callback the real socket
// would call. This way the redux slice / components don't need to know
// or care which mode we are in.

import { IS_MOCK_MODE, getWsBaseUrl } from './config.js'
import { PIPELINE_STAGES, getMockDocument } from './mockData.js'

export function subscribeToDocumentProgress(documentId, onUpdate) {
  if (IS_MOCK_MODE) {
    return subscribeMock(documentId, onUpdate)
  }
  return subscribeReal(documentId, onUpdate)
}

function subscribeReal(documentId, onUpdate) {
  const wsUrl = `${getWsBaseUrl()}/ws/processing/${documentId}`
  const socket = new WebSocket(wsUrl)

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onUpdate(data)
    } catch (err) {
      console.error('Could not parse websocket message', err)
    }
  }

  socket.onerror = (err) => {
    console.error('Websocket error while watching document', documentId, err)
  }

  // caller can call this to stop listening (e.g. when component unmounts)
  return () => socket.close()
}

function subscribeMock(documentId, onUpdate) {
  let stageIndex = 0
  let cancelled = false

  function pushNextStage() {
    if (cancelled || stageIndex >= PIPELINE_STAGES.length) return

    const stage = PIPELINE_STAGES[stageIndex]
    const doc = getMockDocument(documentId)
    if (doc) {
      doc.status = stage.key
      doc.stageLabel = stage.label
      doc.progress = stage.progress
    }

    onUpdate({
      type: 'progress',
      documentId,
      status: stage.key,
      stageLabel: stage.label,
      progress: stage.progress,
    })

    stageIndex += 1
    if (stageIndex < PIPELINE_STAGES.length) {
      timeoutId = setTimeout(pushNextStage, 1200)
    }
  }

  let timeoutId = setTimeout(pushNextStage, 400)

  return () => {
    cancelled = true
    clearTimeout(timeoutId)
  }
}
