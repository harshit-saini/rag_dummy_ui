// The main Q&A chat box. User can optionally pick one document to ask
// about (using the dropdown), or leave it on "All documents" to search
// across everything that has finished processing.

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { sendQuestion } from '../store/chatSlice.js'
import AnswerCard from './AnswerCard.jsx'

function ChatPanel() {
  const dispatch = useDispatch()
  const documents = useSelector((state) => state.documents.items)
  const { messages, asking } = useSelector((state) => state.chat)

  const [question, setQuestion] = useState('')
  const [selectedDocId, setSelectedDocId] = useState('')

  const readyDocuments = documents.filter((d) => d.status === 'ready')

  function handleSubmit(e) {
    e.preventDefault()
    if (!question.trim() || asking) return
    dispatch(sendQuestion({ question: question.trim(), documentId: selectedDocId || null }))
    setQuestion('')
  }

  return (
    <div className="chat-panel">
      <div className="chat-toolbar">
        <label className="muted small">Ask about:</label>
        <select value={selectedDocId} onChange={(e) => setSelectedDocId(e.target.value)}>
          <option value="">All documents</option>
          {readyDocuments.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.name}
            </option>
          ))}
        </select>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="muted">
            Ask a question about your uploaded papers, for example "what method
            does the paper use?" or "what were the results?".
          </p>
        )}

        {messages.map((msg) =>
          msg.role === 'user' ? (
            <div key={msg.id} className="chat-message user-message">
              {msg.text}
            </div>
          ) : (
            <AnswerCard key={msg.id} text={msg.text} sources={msg.sources} />
          ),
        )}

        {asking && <p className="muted">Thinking...</p>}
      </div>

      <form className="chat-input-row" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your question here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button type="submit" disabled={asking}>
          Ask
        </button>
      </form>
    </div>
  )
}

export default ChatPanel
