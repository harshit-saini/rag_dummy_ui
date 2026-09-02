// Page 1: upload a paper and watch it move through the RAG pipeline.

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import UploadPanel from '../components/UploadPanel.jsx'
import DocumentList from '../components/DocumentList.jsx'
import { loadDocuments } from '../store/documentsSlice.js'

function UploadPage() {
  const dispatch = useDispatch()

  // load whatever documents already exist as soon as this page mounts
  useEffect(() => {
    dispatch(loadDocuments())
  }, [dispatch])

  return (
    <div className="upload-page">
      <UploadPanel />
      <h2>Your papers</h2>
      <DocumentList />
    </div>
  )
}

export default UploadPage
