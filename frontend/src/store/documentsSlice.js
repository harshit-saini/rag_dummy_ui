// Redux slice that keeps track of every uploaded document and how far
// along it is in the RAG pipeline. We use createAsyncThunk for the
// network-ish calls (upload / fetch list) because that gives us the
// pending/fulfilled/rejected actions for free instead of us writing
// try/catch + loading flags everywhere by hand.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { uploadDocument, fetchDocuments } from '../services/documentService.js'
import { subscribeToDocumentProgress } from '../services/socketService.js'

const initialState = {
  items: [],
  uploading: false,
  error: null,
}

export const loadDocuments = createAsyncThunk('documents/loadDocuments', async () => {
  return fetchDocuments()
})

// This thunk does two things: 1) upload the file, 2) start listening on
// the websocket (real or fake) for progress updates on that document.
export const uploadNewDocument = createAsyncThunk(
  'documents/uploadNewDocument',
  async (file, { dispatch }) => {
    const doc = await uploadDocument(file)

    subscribeToDocumentProgress(doc.id, (update) => {
      dispatch(
        documentProgressUpdated({
          id: update.documentId,
          status: update.status,
          stageLabel: update.stageLabel,
          progress: update.progress,
        }),
      )

      // once the pipeline finishes, refresh the full list so we also get
      // the domain / keywords / summary that get generated for the doc
      // (the initial upload response does not include those yet)
      if (update.status === 'ready') {
        dispatch(loadDocuments())
      }
    })

    return doc
  },
)

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    documentProgressUpdated(state, action) {
      const { id, status, stageLabel, progress } = action.payload
      const doc = state.items.find((d) => d.id === id)
      if (doc) {
        doc.status = status
        doc.stageLabel = stageLabel
        doc.progress = progress
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDocuments.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(uploadNewDocument.pending, (state) => {
        state.uploading = true
        state.error = null
      })
      .addCase(uploadNewDocument.fulfilled, (state, action) => {
        state.uploading = false
        // normalise field names in case a real backend sends stageLabel differently
        state.items.unshift({
          id: action.payload.id,
          name: action.payload.name,
          size: action.payload.size,
          status: action.payload.status,
          stageLabel: action.payload.stageLabel || 'File uploaded',
          progress: action.payload.progress || 5,
          uploadedAt: action.payload.uploadedAt,
        })
      })
      .addCase(uploadNewDocument.rejected, (state, action) => {
        state.uploading = false
        state.error = action.error.message
      })
  },
})

export const { documentProgressUpdated } = documentsSlice.actions
export default documentsSlice.reducer
