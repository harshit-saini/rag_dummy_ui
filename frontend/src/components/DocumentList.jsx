// Shows every document we have uploaded so far, along with its current
// pipeline progress. Clicking a document (once it is ready) opens the
// full document viewer popup.

import { useDispatch, useSelector } from 'react-redux'
import ProcessingStatus from './ProcessingStatus.jsx'
import { openDocumentViewer } from '../store/viewerSlice.js'

function formatSize(bytes) {
  if (!bytes) return ''
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

function DocumentList() {
  const dispatch = useDispatch()
  const documents = useSelector((state) => state.documents.items)

  if (documents.length === 0) {
    return <p className="muted">No papers uploaded yet. Upload one above to get started.</p>
  }

  return (
    <div className="document-list">
      {documents.map((doc) => (
        <div key={doc.id} className="document-card">
          <div className="document-card-header">
            <button
              className="document-name-btn"
              disabled={doc.status !== 'ready'}
              onClick={() => dispatch(openDocumentViewer({ documentId: doc.id }))}
              title={doc.status === 'ready' ? 'Click to open document' : 'Still processing...'}
            >
              {doc.name}
            </button>
            <span className="muted small">{formatSize(doc.size)}</span>
          </div>

          <ProcessingStatus
            status={doc.status}
            stageLabel={doc.stageLabel}
            progress={doc.progress}
          />

          {doc.status === 'ready' && (
            <div className="document-meta">
              {doc.domain && <span className="badge">{doc.domain}</span>}
              {doc.keywords &&
                doc.keywords.slice(0, 3).map((k) => (
                  <span className="badge muted-badge" key={k}>
                    {k}
                  </span>
                ))}
            </div>
          )}

          {doc.status === 'ready' && doc.summary && (
            <p className="document-summary">{doc.summary}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default DocumentList
