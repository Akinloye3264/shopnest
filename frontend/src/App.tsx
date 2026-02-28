import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Products from './components/Products'
import Jobs from './components/Jobs'
import AuthCallback from './components/AuthCallback'
import { Toaster } from 'react-hot-toast'

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

interface User {
  id: string
  email: string
  role: string
  name?: string
  picture?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiSentMessage, setAiSentMessage] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const formatMarkdown = (text: string): string => {
    let html = text
      // Escape HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    // Bold: **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Headers: ### text or ## text
    html = html.replace(/^### (.+)$/gm, '<h4 class="ai-heading">$1</h4>')
    html = html.replace(/^## (.+)$/gm, '<h3 class="ai-heading">$1</h3>')
    // Unordered list items: - text
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
    // Numbered list items: 1. text
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul class="ai-list">$1</ul>')
    // Line breaks for remaining newlines (but not before/after block elements)
    html = html.replace(/\n(?!<)/g, '<br />')
    // Clean up extra <br /> before block elements
    html = html.replace(/<br \/>(\s*<(?:ul|h3|h4))/g, '$1')
    html = html.replace(/(<\/(?:ul|h3|h4)>)<br \/>/g, '$1')
    return html
  }

  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      if (storedToken && storedUser) {
        try { setUser(JSON.parse(storedUser)) } catch (e) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }
    checkAuth()

    // Listen for storage changes (e.g. from AuthCallback)
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)) } catch (e) { /* ignore */ }
      } else {
        setUser(null)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    setUser(null)
    setMobileMenuOpen(false)
  }

  const askAi = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiMessage.trim()) return
    setAiSentMessage(aiMessage)
    setAiMessage('')
    setAiResponse('Consulting ShopNest Intelligence...')
    try {
      const res = await fetch('http://localhost:5001/api/ai/learning-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: aiMessage })
      })
      const data = await res.json()
      setAiResponse(data.response)
    } catch (err) {
      setAiResponse('Connection to AI brain failed.')
    }
  }

  if (loading) return null

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen font-sans selection:bg-black selection:text-white">
        <Toaster position="top-center" />

        {/* Navigation - Fixed Sticky */}
        {user && (
          <nav className="fixed top-0 left-0 w-full z-[100] nav-blur transition-all duration-300">
            <div className="studio-container flex justify-between items-center h-24">
              <Link to="/" className="text-3xl font-black tracking-tighter hover:opacity-70 transition-opacity">
                ShopNest<span className="text-gray-400">.</span>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden lg:flex items-center space-x-12">
                <Link to="/products" className="text-sm font-bold uppercase tracking-widest hover:text-gray-500 transition-colors">Marketplace</Link>
                <Link to="/jobs" className="text-sm font-bold uppercase tracking-widest hover:text-gray-500 transition-colors">Career Hub</Link>
                <button onClick={() => setAiOpen(true)} className="text-sm font-bold uppercase tracking-widest hover:text-gray-500 transition-colors">Consult AI</button>
              </div>

              <div className="hidden lg:flex items-center space-x-8">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{user.name || user.email.split('@')[0]}</span>
                <button onClick={handleLogout} className="studio-button uppercase text-xs tracking-widest px-8">Sign Out</button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-4 focus:outline-none"
              >
                <div className={`w-8 h-0.5 bg-black transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></div>
                <div className={`w-8 h-0.5 bg-black mt-2 transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></div>
              </button>
            </div>

            {/* Mobile Nav Overlay */}
            {mobileMenuOpen && (
              <div className="lg:hidden absolute top-24 left-0 w-full bg-white border-b-2 border-black p-8 flex flex-col space-y-8 animate-fade-in shadow-2xl">
                <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black uppercase">Marketplace</Link>
                <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black uppercase">Career Hub</Link>
                <button onClick={() => { setAiOpen(true); setMobileMenuOpen(false); }} className="text-2xl font-black uppercase text-left text-brand-secondary">Consult AI</button>
                <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">{user.email}</span>
                  <button onClick={handleLogout} className="studio-button text-xs px-6">LOGOUT</button>
                </div>
              </div>
            )}
          </nav>
        )}

        <main className={user ? "pt-32 pb-24 studio-container" : ""}>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
            <Route path="/login" element={!user ? <Login onLogin={setUser} /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/auth/callback" element={<AuthCallback onLogin={setUser} />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/products" element={user ? <Products user={user} /> : <Navigate to="/login" />} />
            <Route path="/jobs" element={user ? <Jobs user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </main>

        {/* AI Modal - Enhanced */}
        {aiOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
            <div className="w-full max-w-4xl max-h-[90vh] flex flex-col animate-slide-up">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-white studio-h2 mb-0">AI STRATEGIST</h2>
                <button onClick={() => setAiOpen(false)} className="text-white font-black uppercase text-xs tracking-widest border border-white/20 px-6 py-2 rounded-full hover:bg-white hover:text-black transition-all">Close</button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                {!aiSentMessage && !aiResponse && (
                  <div className="text-white/20 text-5xl font-black leading-none uppercase select-none">
                    Waiting for your query...
                  </div>
                )}
                {aiSentMessage && (
                  <div className="flex justify-end">
                    <div className="bg-white/10 border border-white/10 text-white rounded-2xl rounded-tr-sm px-6 py-4 max-w-[75%] text-base font-medium">
                      {aiSentMessage}
                    </div>
                  </div>
                )}
                {aiResponse && (
                  <div className="flex justify-start">
                    <div className="ai-response-bubble bg-white text-black rounded-2xl rounded-tl-sm px-8 py-6 max-w-[85%] text-[15px] leading-relaxed font-medium">
                      <div dangerouslySetInnerHTML={{ __html: formatMarkdown(aiResponse) }} />
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={askAi} className="mt-12 flex space-x-4">
                <input
                  type="text"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder="Inquire about growth..."
                  className="flex-1 bg-transparent border-b-4 border-white/10 text-white text-4xl font-black pb-4 outline-none focus:border-white transition-colors placeholder:text-white/10"
                />
                <button type="submit" className="studio-button px-12 text-lg">SEND</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Router>
  )
}

export default App
