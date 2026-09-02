// Top navigation bar. Just two tabs since our app only has two pages:
// one for uploading + tracking papers, and one for asking questions.

function Navbar({ activeTab, onTabChange }) {
  return (
    <header className="navbar">
      <div className="navbar-brand">📄 AI Research Paper Assistant</div>
      <nav className="navbar-tabs">
        <button
          className={activeTab === 'upload' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => onTabChange('upload')}
        >
          Upload & Process
        </button>
        <button
          className={activeTab === 'ask' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => onTabChange('ask')}
        >
          Ask Questions
        </button>
      </nav>
    </header>
  )
}

export default Navbar
