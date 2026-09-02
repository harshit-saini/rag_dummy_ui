// Popup that shows the full (fake) content of a document, page by page.
// This opens either when the user clicks a document in the list, or when
// they click a citation on an answer in the Ask Questions page - in that
// second case we scroll to / highlight the page that was cited.

import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { closeDocumentViewer } from '../store/viewerSlice.js'

function DocumentViewerModal() {
  const dispatch = useDispatch()
  const { isOpen, loading, documentName, pages, highlightPage } = useSelector(
    (state) => state.viewer,
  )
  const highlightedRef = useRef(null)

  useEffect(() => {
    if (isOpen && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isOpen, loading, highlightPage])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={() => dispatch(closeDocumentViewer())}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{documentName || 'Document'}</h3>
          <button className="close-btn" onClick={() => dispatch(closeDocumentViewer())}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading && <p className="muted">Loading document...</p>}

          {!loading &&
            pages.map((p) => (
              <div
                key={p.page}
                ref={p.page === highlightPage ? highlightedRef : null}
                className={p.page === highlightPage ? 'doc-page highlighted' : 'doc-page'}
              >
                <div className="doc-page-number">Page {p.page}</div>
                <p>{p.text}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default DocumentViewerModal
