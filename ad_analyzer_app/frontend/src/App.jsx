import { useState } from 'react'
import ImageUploader from './components/ImageUploader'
import BatchUploader from './components/BatchUploader'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('single')

  return (
    <div className="app">
      <header className="app-header">
        <h1>Creative Image Analyzer</h1>
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'single' ? 'active' : ''}`}
            onClick={() => setActiveTab('single')}
          >
            Single Image
          </button>
          <button
            className={`tab-button ${activeTab === 'batch' ? 'active' : ''}`}
            onClick={() => setActiveTab('batch')}
          >
            Batch Upload
          </button>
        </div>
      </header>
      <main className="app-content">
        {activeTab === 'single' ? <ImageUploader /> : <BatchUploader />}
      </main>
    </div>
  )
}

export default App 