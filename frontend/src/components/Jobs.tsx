import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { Search, Briefcase, Users, Plus, ExternalLink, Loader2, Upload, FileText, CheckCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import API_URL from '../config'

interface Application {
  id: string
  status: string
  job: { title: string; company: string }
  applicant: { name: string; email: string }
  createdAt: string
}

function Jobs({ user }: { user: any }) {
  const [externalJobs, setExternalJobs] = useState<any[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPostForm, setShowPostForm] = useState(false)
  const [view, setView] = useState<'listings' | 'applications'>('listings')
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    type: 'Full-time',
    salary: ''
  })

  // Audit Resume States
  const [auditFile, setAuditFile] = useState<File | null>(null)
  const [auditFocus, setAuditFocus] = useState('')
  const [auditSalary, setAuditSalary] = useState('')
  const [auditProcessing, setAuditProcessing] = useState(false)
  const [auditResult, setAuditResult] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchExternalJobs()
    if (user.role === 'seller' || user.role === 'employee' || user.role === 'admin') {
      fetchApplications()
    }
  }, [])

  const fetchExternalJobs = async (query = 'software business design') => {
    try {
      const res = await fetch(`${API_URL}/api/ai/external-jobs?search=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (data.success) setExternalJobs(data.jobs)
    } catch (err) {
      console.log('Global pool offline.')
    }
    setLoading(false)
  }

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/jobs/employer/${user.id}/applications`)
      const data = await res.json()
      if (data.success) setApplications(data.applications)
    } catch (err) {
      console.log('Failed to fetch applications.')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    fetchExternalJobs(searchTerm || 'software business design')
    if (searchTerm) {
      toast.success(`Querying global clusters for "${searchTerm}"...`, {
        style: { background: '#00ff88', color: '#000', fontWeight: 'bold' }
      })
    }
  }

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newJob, employerId: user.id })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Opportunity published.')
        setShowPostForm(false)
      }
    } catch (err) {
      toast.error('Posting failure.')
    }
  }

  const handleAuditResume = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auditFile) return toast.error('Select a PDF resume.')

    setAuditProcessing(true)
    const formData = new FormData()
    formData.append('resume', auditFile)
    formData.append('focus', auditFocus)
    formData.append('salary', auditSalary)

    try {
      const res = await fetch(`${API_URL}/api/ai/audit-resume`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.success) {
        setAuditResult(data.audit)
        toast.success('Audit Transmission Complete.')
      } else {
        toast.error(data.message || 'Audit failed.')
      }
    } catch (err) {
      toast.error('Audit Service Error.')
    }
    setAuditProcessing(false)
  }

  const isEmployer = user.role === 'seller' || user.role === 'employee' || user.role === 'admin'

  return (
    <div className="space-y-16">
      <header className="pt-20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-12">
          <div className="max-w-3xl">
            <span className="studio-label">System / Recruitment</span>
            <h1 className="studio-h1">Global Talent<br />Search Portal.</h1>
            <p className="text-xl font-medium text-gray-400">ShopNest bridges the gap between high-scale ventures and elite ecosystem talent.</p>
          </div>
          {isEmployer && (
            <div className="flex gap-4">
              <button
                onClick={() => setView(view === 'listings' ? 'applications' : 'listings')}
                className="studio-button-ghost h-20 px-8 uppercase tracking-widest flex items-center gap-3"
              >
                {view === 'listings' ? <Users size={20} /> : <Briefcase size={20} />}
                {view === 'listings' ? 'View Applicants' : 'View Listings'}
              </button>
              <button
                onClick={() => setShowPostForm(!showPostForm)}
                className="studio-button h-20 px-8 uppercase tracking-widest flex items-center gap-3"
              >
                {showPostForm ? 'Cancel' : <><Plus size={20} /> Publish Career</>}
              </button>
            </div>
          )}
        </div>

        {view === 'listings' && (
          <form onSubmit={handleSearch} className="relative max-w-4xl mx-auto group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-accent transition-colors" size={24} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, technology, or company..."
              className="studio-input pl-20 h-24 text-2xl font-black bg-white/5 border-white/10 text-white focus:bg-white/10"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 studio-button h-16 px-10">SEARCH</button>
          </form>
        )}
      </header>

      {showPostForm && (
        <section className="glass-card p-12 animate-slide-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 blur-3xl -z-10" />
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-12">Career Specification</h2>
          <form onSubmit={handlePostJob} className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-6 space-y-8">
              <div>
                <label className="studio-label text-gray-400">Job Title</label>
                <input type="text" required value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} className="studio-input" placeholder="e.g. Senior Logic Architect" />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="studio-label text-gray-400">Company</label>
                  <input type="text" required value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} className="studio-input" />
                </div>
                <div>
                  <label className="studio-label text-gray-400">Location</label>
                  <input type="text" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} className="studio-input" placeholder="Remote / Global" />
                </div>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6 space-y-8">
              <div>
                <label className="studio-label text-gray-400">Job Description</label>
                <textarea rows={5} required value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} className="studio-input resize-none" />
              </div>
              <button type="submit" className="studio-button w-full h-20 text-xl font-black uppercase">ACTIVATE LISTING</button>
            </div>
          </form>
        </section>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="text-brand-accent animate-spin" size={48} />
        </div>
      )}

      {!loading && view === 'listings' ? (
        <div className="grid grid-cols-12 gap-12">
          {/* Global Opportunities Pool */}
          <div className="col-span-12 lg:col-span-8 space-y-12">
            <h3 className="text-xs font-black uppercase tracking-[0.5em] text-gray-500 border-l-4 border-brand-accent pl-6 text-white">Global Opportunities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {externalJobs.map((job, i) => (
                <div key={i} className="glass-card p-10 flex flex-col hover:bg-white/5 transition-all border-white/5">
                  <div className="flex justify-between items-start mb-8 gap-4">
                    <h4 className="text-2xl font-black uppercase leading-[0.9] tracking-tighter">{job.title}</h4>
                    <span className="shrink-0 bg-brand-accent/10 text-brand-accent px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{job.location}</span>
                  </div>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed flex-1 mb-12 uppercase opacity-80 font-bold">
                    {job.description.substring(0, 180)}...
                  </p>
                  <a href={job.redirect_url} target="_blank" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#00ff88] hover:text-white transition-colors self-start underline decoration-2 underline-offset-8">
                    Access External Node <ExternalLink size={14} />
                  </a>
                </div>
              ))}
              {externalJobs.length === 0 && (
                <div className="col-span-full py-20 text-center glass-card border-dashed opacity-50">
                  <Search size={48} className="mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Search for active global market opportunities.</p>
                </div>
              )}
            </div>
          </div>

          {/* Career Sidebar */}
          <aside className="col-span-12 lg:col-span-4 space-y-8">
            <div className="glass-card p-10 bg-brand-accent/5 border-brand-accent/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <span className="studio-label text-brand-accent mb-4">Autonomous Strategist</span>
              <h3 className="text-4xl font-black tracking-tighter uppercase mt-4 mb-10 leading-[0.85]">Audit<br />Resume.</h3>

              <form onSubmit={handleAuditResume} className="space-y-6">
                <div className="space-y-4">
                  <label className="studio-label text-[10px] text-gray-500">Target Focus</label>
                  <input
                    type="text"
                    value={auditFocus}
                    onChange={e => setAuditFocus(e.target.value)}
                    placeholder="e.g. Senior Logic Architect"
                    className="studio-input h-14 text-sm"
                  />

                  <label className="studio-label text-[10px] text-gray-500">Starting Salary (USD)</label>
                  <input
                    type="text"
                    value={auditSalary}
                    onChange={e => setAuditSalary(e.target.value)}
                    placeholder="000,000 / Year"
                    className="studio-input h-14 text-sm"
                  />

                  <label className="studio-label text-[10px] text-gray-500">PDF Documentation</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center cursor-pointer hover:border-brand-accent/40 transition-colors bg-black/20"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf"
                      onChange={e => setAuditFile(e.target.files?.[0] || null)}
                    />
                    {auditFile ? (
                      <div className="flex items-center justify-center gap-3 text-brand-accent font-black text-[10px] uppercase">
                        <FileText size={18} /> {auditFile.name.slice(0, 20)}...
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={24} className="text-gray-600" />
                        <span className="text-[10px] font-black uppercase text-gray-500">Select PDF Profile</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={auditProcessing}
                  className="studio-button w-full h-16 text-[10px] tracking-widest uppercase flex items-center justify-center gap-3"
                >
                  {auditProcessing ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle size={18} /> INITIALIZE AUDIT</>}
                </button>
              </form>
            </div>

            <div className="glass-card p-10">
              <span className="studio-label mb-8">Ecosystem Skills</span>
              <div className="flex flex-wrap gap-3">
                {['Project Management', 'E-commerce Ops', 'AI Strategy', 'Revenue Systems', 'Scaling'].map(skill => (
                  <span key={skill} className="px-6 py-3 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">{skill}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="space-y-12 animate-fade-in">
          <h3 className="text-xs font-black uppercase tracking-[0.5em] text-gray-500 border-l-4 border-brand-accent pl-6">Active Applicant Tracking</h3>
          <div className="grid grid-cols-1 gap-6">
            {applications.map(app => (
              <div key={app.id} className="glass-card p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-3xl font-black uppercase tracking-tighter">{app.applicant.name}</h4>
                    <span className="bg-brand-accent/20 text-brand-accent px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{app.status}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Applying for: <span className="text-white">{app.job.title}</span></p>
                  <p className="text-xs text-gray-500 mt-2">{app.applicant.email} • Sent {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button className="studio-button flex-1 md:flex-none px-10 h-14 text-[10px] font-black uppercase">Review Profile</button>
                  <button className="studio-button-ghost flex-1 md:flex-none px-10 h-14 text-[10px] font-black uppercase">Schedule Sync</button>
                </div>
              </div>
            ))}
            {applications.length === 0 && (
              <div className="py-40 text-center glass-card border-dashed opacity-50">
                <Users size={64} className="mx-auto mb-8 text-gray-600" />
                <h4 className="text-2xl font-black uppercase tracking-tighter">No Active Applicants</h4>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-4">Broadcast your listings to attract talent.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit Result Modal */}
      <AnimatePresence>
        {auditResult && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAuditResult(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[300]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[85vh] overflow-y-auto glass-card p-12 z-[301] shadow-2xl border-brand-accent/30 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12 shrink-0">
                <div>
                  <span className="studio-label text-brand-accent">Autonomous HR Audit Complete</span>
                  <h2 className="text-4xl font-black tracking-tighter uppercase mt-2">Strategic Report</h2>
                </div>
                <button onClick={() => setAuditResult(null)} className="p-3 hover:bg-white/10 rounded-full transition-colors text-white">
                  <X size={32} />
                </button>
              </div>

              <div className="prose prose-invert max-w-none text-gray-300 font-medium leading-relaxed ai-response-bubble overflow-hidden flex-1">
                {auditResult.split('\n').map((line, i) => {
                  if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.')) {
                    return <h4 key={i} className="text-xl font-black uppercase tracking-tight text-white mt-8 mb-4">{line}</h4>
                  }
                  return <p key={i} className="mb-2">{line}</p>
                })}
              </div>

              <div className="pt-12 mt-12 border-t border-white/10 flex justify-end shrink-0">
                <button
                  onClick={() => setAuditResult(null)}
                  className="studio-button px-12 h-16 uppercase text-xs tracking-widest"
                >
                  Acknowledge Report
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <footer className="pt-40 pb-60 border-t border-white/5">
        <div className="max-w-2xl">
          <h3 className="text-6xl font-black tracking-tighter uppercase mb-8 leading-none text-white">Work for the<br />Future.</h3>
          <p className="text-xl font-medium text-gray-400 mb-12">ShopNest connects talent with the infrastructure of tomorrow. Build your career on a platform designed for scale.</p>
          <div className="flex gap-4">
            <button className="studio-button px-10 h-16">VIEW DIRECTORY</button>
            <button className="studio-button-ghost px-10 h-16">RECRUITMENT API</button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Jobs
