// Handles picking a file and kicking off the upload. We kept the file
// input very basic (no drag-and-drop) since that was not asked for and
// it keeps the code easier to explain during viva/demo.

import { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { uploadNewDocument } from '../store/documentsSlice.js'

function UploadPanel() {
  const dispatch = useDispatch()
  const uploading = useSelector((state) => state.documents.uploading)
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    dispatch(uploadNewDocument(file))
    // reset the input so the user can upload the same file again if they want
    e.target.value = ''
  }

  return (
    <div className="upload-panel">
      <h2>Upload a research paper</h2>
      <p className="muted">
        Upload a PDF and we will run it through our RAG pipeline: extracting
        text, chunking, generating embeddings, and indexing it so you can ask
        questions about it later.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.doc,.docx"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {uploading && <p className="muted">Uploading, please wait...</p>}
    </div>
  )
}

export default UploadPanel
