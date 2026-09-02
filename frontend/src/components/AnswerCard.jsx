// Renders one assistant message: the generated answer plus the list of
// "sources" (the document + page it pulled the answer from). Clicking a
// source chip opens that document in the viewer, jumped to that page.
// This is the part of the requirements that asked for citations that can
// be opened up to see the whole document.

import { useDispatch } from 'react-redux'
import { openDocumentViewer } from '../store/viewerSlice.js'

function AnswerCard({ text, sources }) {
  const dispatch = useDispatch()

  return (
    <div className="answer-card">
      <p>{text}</p>

      {sources && sources.length > 0 && (
        <div className="sources-row">
          <span className="muted small">Sources:</span>
          {sources.map((s) => (
            <button
              key={s.chunkId}
              className="source-chip"
              onClick={() =>
                dispatch(
                  openDocumentViewer({
                    documentId: s.documentId,
                    highlightPage: s.page,
                  }),
                )
              }
              title={s.snippet}
            >
              📄 {s.documentName} — p.{s.page}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default AnswerCard
