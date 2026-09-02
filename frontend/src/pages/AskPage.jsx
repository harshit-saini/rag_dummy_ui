// Page 2: the retrieval / question-answering side of the app.

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import ChatPanel from '../components/ChatPanel.jsx'
import { loadDocuments } from '../store/documentsSlice.js'

function AskPage() {
  const dispatch = useDispatch()

  // make sure we have the latest document list so the "ask about" dropdown
  // is up to date even if the user jumps here directly
  useEffect(() => {
    dispatch(loadDocuments())
  }, [dispatch])

  return (
    <div className="ask-page">
      <h2>Ask questions about your papers</h2>
      <ChatPanel />
    </div>
  )
}

export default AskPage
