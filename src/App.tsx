import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ThesisPage from './pages/ThesisPage'
import './styles/App.css'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || ''

function App() {
  const isThesisPage = window.location.pathname.endsWith('/thesis')

  return (
    <BrowserRouter basename={basename}>
      <div className="App">
        {!isThesisPage && (
          <nav className="nav">
            <div className="nav-container">
              <a href={`${basename}/`} className="nav-logo">
                <svg className="nav-logo-icon" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="16" cy="16" r="5" fill="currentColor"/>
                  <path d="M16 4v4M16 24v4M4 16h4M24 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M8 8l3 3M21 21l3 3M8 24l3-3M21 11l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                </svg>
                Namecast
              </a>
              <div className="nav-links">
                <a href={`${basename}/thesis`}>Thesis</a>
                <a href="https://github.com/MaxGhenis/namecast">GitHub</a>
                <a href="mailto:hello@namecast.ai">Contact</a>
              </div>
            </div>
          </nav>
        )}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/thesis" element={<ThesisPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
