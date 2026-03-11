import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Products from './components/Products'
import Jobs from './components/Jobs'
import Orders from './components/Orders'
import Messaging from './components/Messaging'
import AdminPanel from './components/AdminPanel'
import AuthCallback from './components/AuthCallback'
import Background3D from './components/Background3D'
import { Toaster } from 'react-hot-toast'
import { ShoppingCart, MessageSquare, LayoutDashboard, Shield } from 'lucide-react'
import API_URL from './config'

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
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/^### (.+)$/gm, '<h4 class="ai-heading">$1</h4>')
    html = html.replace(/^## (.+)$/gm, '<h3 class="ai-heading">$1</h3>')
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul class="ai-list">$1</ul>')
    html = html.replace(/\n(?!<)/g, '<br />')
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
      const res = await fetch(`${API_URL}/api/ai/learning-assistant`, {
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
      <Background3D />
      <div className="min-h-screen font-sans selection:bg-brand-accent selection:text-black text-white relative z-10">
        <Toaster position="top-center"
          toastOptions={{
            style: {
              background: '#111',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)'
            }
          }}
        />

        {/* Navigation */}
        {user && (
          <nav className="fixed top-0 left-0 w-full z-[100] nav-blur transition-all duration-300">
            <div className="studio-container flex justify-between items-center h-24">
              <Link to="/" className="text-3xl font-black tracking-tighter hover:opacity-70 transition-opacity">
                ShopNest<span className="text-gray-400">.</span>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden lg:flex items-center space-x-10">
                <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-brand-accent transition-colors">
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
                {(user.role === 'buyer' || user.role === 'seller' || user.role === 'admin') && (
                  <Link to="/products" className="text-sm font-bold uppercase tracking-widest hover:text-brand-accent transition-colors">Marketplace</Link>
                )}
                {(user.role === 'job_seeker' || user.role === 'employee' || user.role === 'employer' || user.role === 'seller' || user.role === 'admin') && (
                  <Link to="/jobs" className="text-sm font-bold uppercase tracking-widest hover:text-brand-accent transition-colors">Career Hub</Link>
                )}
                {(user.role === 'buyer' || user.role === 'seller' || user.role === 'admin') && (
                  <Link to="/orders" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-brand-accent transition-colors">
                    <ShoppingCart size={14} /> Orders
                  </Link>
                )}
                <Link to="/messages" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-brand-accent transition-colors">
                  <MessageSquare size={14} /> Messages
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-brand-accent transition-colors">
                    <Shield size={14} /> Admin
                  </Link>
                )}
                <button onClick={() => setAiOpen(true)} className="text-sm font-bold uppercase tracking-widest hover:text-brand-accent transition-colors">Consult AI</button>
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
                <div className={`w-8 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></div>
                <div className={`w-8 h-0.5 bg-white mt-2 transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></div>
              </button>
            </div>

            {/* Mobile Nav Overlay */}
            {mobileMenuOpen && (
              <div className="lg:hidden absolute top-24 left-0 w-full bg-[#050505]/95 backdrop-blur-2xl border-b-2 border-brand-accent/30 p-8 flex flex-col space-y-6 animate-fade-in shadow-2xl">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black uppercase text-white">Dashboard</Link>
                {(user.role === 'buyer' || user.role === 'seller' || user.role === 'admin') && (
                  <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black uppercase text-white">Marketplace</Link>
                )}
                {(user.role === 'job_seeker' || user.role === 'employee' || user.role === 'employer' || user.role === 'seller' || user.role === 'admin') && (
                  <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black uppercase text-white">Career Hub</Link>
                )}
                {(user.role === 'buyer' || user.role === 'seller' || user.role === 'admin') && (
                  <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black uppercase text-white">Orders</Link>
                )}
                <Link to="/messages" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black uppercase text-white">Messages</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black uppercase text-brand-accent">Admin Panel</Link>
                )}
                <button onClick={() => { setAiOpen(true); setMobileMenuOpen(false); }} className="text-2xl font-black uppercase text-left text-brand-accent">Consult AI</button>
                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
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
            <Route path="/orders" element={user ? <Orders user={user} /> : <Navigate to="/login" />} />
            <Route path="/messages" element={user ? <Messaging user={user} /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user ? <AdminPanel user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </main>

        {/* AI Modal */}
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
                  placeholder="Inquire about E-commerce..."
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
