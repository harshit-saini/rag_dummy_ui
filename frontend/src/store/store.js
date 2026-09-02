import { configureStore } from '@reduxjs/toolkit'
import documentsReducer from './documentsSlice.js'
import chatReducer from './chatSlice.js'
import viewerReducer from './viewerSlice.js'

// Redux toolkit makes this part really easy compared to old-school redux,
// we just combine all our slice reducers here in one place.
export const store = configureStore({
  reducer: {
    documents: documentsReducer,
    chat: chatReducer,
    viewer: viewerReducer,
  },
})
