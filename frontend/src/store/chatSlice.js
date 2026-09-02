// Redux slice for the question-answering / chat part of the app.
// We keep a simple list of messages (both from the user and the
// "assistant") plus an "asking" flag to show a loading state on the
// send button while we wait for the answer.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { askQuestion } from '../services/askService.js'

const initialState = {
  messages: [],
  asking: false,
  error: null,
}

let messageIdCounter = 1

export const sendQuestion = createAsyncThunk(
  'chat/sendQuestion',
  async ({ question, documentId }) => {
    const result = await askQuestion(question, documentId)
    return { question, ...result }
  },
)

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendQuestion.pending, (state, action) => {
        state.asking = true
        state.error = null
        // show the user's own question in the chat right away
        state.messages.push({
          id: messageIdCounter++,
          role: 'user',
          text: action.meta.arg.question,
        })
      })
      .addCase(sendQuestion.fulfilled, (state, action) => {
        state.asking = false
        state.messages.push({
          id: messageIdCounter++,
          role: 'assistant',
          text: action.payload.answer,
          sources: action.payload.sources,
        })
      })
      .addCase(sendQuestion.rejected, (state, action) => {
        state.asking = false
        state.error = action.error.message
        state.messages.push({
          id: messageIdCounter++,
          role: 'assistant',
          text: 'Something went wrong while getting the answer. Please try again.',
          sources: [],
        })
      })
  },
})

export default chatSlice.reducer
