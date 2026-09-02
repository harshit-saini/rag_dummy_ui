// Small slice just for the "document viewer" popup that opens when the
// user clicks a document in the list, or clicks a citation on an answer.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchDocumentContent } from '../services/documentService.js'

const initialState = {
  isOpen: false,
  loading: false,
  documentId: null,
  documentName: '',
  pages: [],
  highlightPage: null, // used when opening from a citation, to jump to that page
}

export const openDocumentViewer = createAsyncThunk(
  'viewer/openDocumentViewer',
  async ({ documentId, highlightPage }) => {
    const content = await fetchDocumentContent(documentId)
    return { ...content, highlightPage: highlightPage || null }
  },
)

const viewerSlice = createSlice({
  name: 'viewer',
  initialState,
  reducers: {
    closeDocumentViewer(state) {
      state.isOpen = false
      state.pages = []
      state.documentId = null
      state.highlightPage = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(openDocumentViewer.pending, (state, action) => {
        state.isOpen = true
        state.loading = true
        state.documentId = action.meta.arg.documentId
        state.highlightPage = action.meta.arg.highlightPage || null
      })
      .addCase(openDocumentViewer.fulfilled, (state, action) => {
        state.loading = false
        state.documentName = action.payload.name
        state.pages = action.payload.pages
        state.highlightPage = action.payload.highlightPage
      })
      .addCase(openDocumentViewer.rejected, (state) => {
        state.loading = false
        state.pages = []
      })
  },
})

export const { closeDocumentViewer } = viewerSlice.actions
export default viewerSlice.reducer
