import { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import UploadPage from './pages/UploadPage.jsx'
import AskPage from './pages/AskPage.jsx'
import DocumentViewerModal from './components/DocumentViewerModal.jsx'
import { IS_MOCK_MODE } from './services/config.js'

// We kept navigation super simple - just two "pages" and a piece of state
// to remember which one is active. We didn't want to add react-router
// just for two pages, that felt like overkill for this project.
function App() {
  const [activeTab, setActiveTab] = useState('upload')

  return (
    <div className="app-shell">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {IS_MOCK_MODE && (
        <div className="mock-mode-banner">
          Running in <strong>dummy data mode</strong> - no backend URL was
          configured (VITE_API_BASE_URL is empty), so everything you see is
          fake/sample data generated in the browser.
        </div>
      )}

      <main className="page-container">
        {activeTab === 'upload' && <UploadPage />}
        {activeTab === 'ask' && <AskPage />}
      </main>

      {/* the "open full document" popup lives here so any page can open it */}
      <DocumentViewerModal />
    </div>
  )
}

export default App
