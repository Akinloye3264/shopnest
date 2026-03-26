import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { Search, Briefcase, Users, Plus, ExternalLink, Loader2, Upload, FileText, CheckCircle, X, ListChecks, Pencil, Trash2 } from 'lucide-react'
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
  const [myJobs, setMyJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPostForm, setShowPostForm] = useState(false)
  const isActualEmployer = user.role === 'employer' || user.role === 'admin'
  const [view, setView] = useState<'listings' | 'applications' | 'my-jobs'>(isActualEmployer ? 'my-jobs' : 'listings')
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    type: 'Full-time',
    salary: ''
  })

  const [editingJob, setEditingJob] = useState<any | null>(null)
  const [editJob, setEditJob] = useState({ title: '', company: '', location: '', description: '', type: 'Full-time', salary: '' })

  // Audit Resume States
  const [auditFile, setAuditFile] = useState<File | null>(null)
  const [auditFocus, setAuditFocus] = useState('')
  const [auditSalary, setAuditSalary] = useState('')
  const [auditProcessing, setAuditProcessing] = useState(false)
  const [auditResult, setAuditResult] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchExternalJobs()
    if (user.role === 'seller' || user.role === 'employee' || user.role === 'admin' || user.role === 'employer') {
      fetchApplications()
      fetchMyJobs()
    }
  }, [])

  const fetchExternalJobs = async (query = 'software') => {
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

  const fetchMyJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/jobs?employerId=${user.id}`)
      const data = await res.json()
      if (data.success) setMyJobs(data.jobs)
    } catch (err) {
      console.log('Failed to fetch my jobs.')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    fetchExternalJobs(searchTerm || 'software')
    if (searchTerm) {
      toast.success(`Looking for "${searchTerm}" Job...`, {
        style: { background: '#00ff88', color: '#000', fontWeight: 'bold' }
      })
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Delete this job listing?')) return
    try {
      const res = await fetch(`${API_URL}/api/jobs/${jobId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Job deleted.')
        fetchMyJobs()
      } else {
        toast.error(data.message || 'Failed to delete job.')
      }
    } catch {
      toast.error('Failed to delete job.')
    }
  }

  const openEditJob = (job: any) => {
    setEditingJob(job)
    setEditJob({ title: job.title, company: job.company, location: job.location || '', description: job.description, type: job.type || 'Full-time', salary: job.salary || '' })
  }

  const handleEditJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingJob) return
    try {
      const res = await fetch(`${API_URL}/api/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editJob)
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Job updated.')
        setEditingJob(null)
        fetchMyJobs()
      } else {
        toast.error(data.message || 'Failed to update job.')
      }
    } catch {
      toast.error('Failed to update job.')
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
        fetchMyJobs()
        setView('my-jobs')
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

  const isEmployer = user.role === 'seller' || user.role === 'employee' || user.role === 'admin' || user.role === 'employer'

  return (
    <div className="space-y-16">
      <header>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-8">
          <div className="max-w-3xl">
            <span className="studio-label">System / {isActualEmployer ? 'Hiring' : 'Recruitment'}</span>
            <h1 className="studio-h1">{isActualEmployer ? <>Hiring<br />Management.</> : <>Global Talent<br />Search Portal.</>}</h1>
            <p className="text-base md:text-xl font-medium text-gray-400">
              {isActualEmployer
                ? 'Post jobs, review applicants, and manage your listings from one place.'
                : 'ShopNest bridges the gap between high-scale ventures and elite ecosystem talent.'
              }
            </p>
          </div>
          {isActualEmployer && (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setView('my-jobs')}
                className={`studio-button-ghost h-12 px-5 text-xs uppercase tracking-widest flex items-center gap-2 ${view === 'my-jobs' ? 'border-brand-accent text-brand-accent' : ''}`}
              >
                <ListChecks size={16} /> My Jobs
              </button>
              <button
                onClick={() => setView(view === 'applications' ? 'my-jobs' : 'applications')}
                className={`studio-button-ghost h-12 px-5 text-xs uppercase tracking-widest flex items-center gap-2 ${view === 'applications' ? 'border-brand-accent text-brand-accent' : ''}`}
              >
                <Users size={16} /> {view === 'applications' ? 'My Jobs' : 'View Applicants'}
              </button>
              <button
                onClick={() => setShowPostForm(!showPostForm)}
                className="studio-button h-12 px-5 text-xs uppercase tracking-widest flex items-center gap-2"
              >
                {showPostForm ? 'Cancel' : <><Plus size={16} /> Post a Job</>}
              </button>
            </div>
          )}
        </div>

        {view === 'listings' && !isActualEmployer && (
          <form onSubmit={handleSearch} className="flex gap-2 max-w-4xl mx-auto group">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-accent transition-colors" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search jobs..."
                className="studio-input pl-14 h-14 text-base font-black bg-white/5 border-white/10 text-white focus:bg-white/10 w-full"
              />
            </div>
            <button type="submit" className="studio-button h-14 px-6 text-sm shrink-0">SEARCH</button>
          </form>
        )}
      </header>

      {showPostForm && (
        <section className="glass-card p-6 md:p-12 animate-slide-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 blur-3xl -z-10" />
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-12">Career Specification</h2>
          <form onSubmit={handlePostJob} className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-6 space-y-8">
              <div>
                <label className="studio-label text-gray-400">Job Title</label>
                <input type="text" required value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} className="studio-input" placeholder="e.g. Senior Logic Architect" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="studio-label text-gray-400">Company</label>
                  <input type="text" required value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} className="studio-input" />
                </div>
                <div>
                  <label className="studio-label text-gray-400">Location</label>
                  <input type="text" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} className="studio-input" placeholder="Remote / Global" />
                </div>
                <div>
                  <label className="studio-label text-gray-400">Job URL</label>
                  <input type="text" value={newJob.url} onChange={e => setNewJob({ ...newJob, url: e.target.value })} className="studio-input" placeholder="https://example.com/job" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {externalJobs.map((job, i) => (
                <a
                  key={i}
                  href={job.redirect_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-5 md:p-8 flex flex-col hover:bg-white/5 hover:border-brand-accent/30 transition-all border-white/5 overflow-hidden cursor-pointer group"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <h4 className="flex-1 min-w-0 text-sm md:text-base font-black uppercase leading-tight tracking-tighter line-clamp-2 group-hover:text-brand-accent transition-colors">{job.title}</h4>
                    <span className="shrink-0 bg-brand-accent/10 text-brand-accent px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest max-w-[100px] truncate">{job.type || 'Full-time'}</span>
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{job.company} · {job.location}</p>
                  {job.salary && job.salary !== 'Competitive' && (
                    <p className="text-xs text-brand-accent font-black uppercase tracking-widest mb-3">{job.salary}</p>
                  )}
                  <p className="text-sm text-gray-400 font-medium leading-relaxed flex-1 mb-4 line-clamp-3">
                    {job.description.substring(0, 180)}...
                  </p>
                  {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.tags.slice(0, 4).map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-500 border border-white/10">{tag}</span>
                      ))}
                    </div>
                  )}
                  <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#00ff88] group-hover:text-white transition-colors self-start underline decoration-2 underline-offset-8">
                    Apply Now <ExternalLink size={14} />
                  </span>
                </a>
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
            <div className="glass-card p-5 md:p-8 bg-brand-accent/5 border-brand-accent/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <span className="studio-label text-brand-accent mb-4">Autonomous Strategist</span>
              <h3 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mt-4 mb-6 leading-[0.85]">Audit<br />Resume.</h3>

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
      ) : view === 'my-jobs' ? (
        <div className="space-y-12 animate-fade-in">
          <h3 className="text-xs font-black uppercase tracking-[0.5em] text-gray-500 border-l-4 border-brand-accent pl-6">My Job Listings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {myJobs.map((job) => (
              <div key={job.id} className="glass-card p-6 md:p-10 flex flex-col hover:bg-white/5 transition-all border-white/5 overflow-hidden">
                <div className="flex items-start gap-3 mb-4">
                  <h4 className="flex-1 min-w-0 text-lg md:text-xl font-black uppercase leading-tight tracking-tighter line-clamp-2">{job.title}</h4>
                  <span className="shrink-0 bg-brand-accent/10 text-brand-accent px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{job.type}</span>
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{job.company} · {job.location}</p>
                {job.salary && (
                  <p className="text-xs text-brand-accent font-black uppercase tracking-widest mb-6">{job.salary}</p>
                )}
                <p className="text-sm text-gray-400 font-medium leading-relaxed flex-1 mb-4">
                  {job.description.length > 200 ? job.description.substring(0, 200) + '...' : job.description}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditJob(job)}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border border-white/10 text-gray-400 rounded-full hover:border-brand-accent hover:text-brand-accent transition-colors"
                    >
                      <Pencil size={11} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border border-white/10 text-gray-400 rounded-full hover:border-red-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {myJobs.length === 0 && (
              <div className="col-span-full py-40 text-center glass-card border-dashed opacity-50">
                <Briefcase size={64} className="mx-auto mb-8 text-gray-600" />
                <h4 className="text-2xl font-black uppercase tracking-tighter">No Jobs Posted Yet</h4>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-4">Use "Publish Career" to post your first listing.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-12 animate-fade-in">
          <h3 className="text-xs font-black uppercase tracking-[0.5em] text-gray-500 border-l-4 border-brand-accent pl-6">Active Applicant Tracking</h3>
          <div className="grid grid-cols-1 gap-6">
            {applications.map(app => (
              <div key={app.id} className="glass-card p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 overflow-hidden">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter truncate">{app.applicant.name}</h4>
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

      {/* Edit Job Modal */}
      <AnimatePresence>
        {editingJob && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditingJob(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300]"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card p-6 md:p-10 z-[301] shadow-2xl mx-4"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <span className="studio-label text-brand-accent">Edit Listing</span>
                  <h2 className="text-2xl font-black tracking-tighter uppercase mt-1">Update Job</h2>
                </div>
                <button onClick={() => setEditingJob(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleEditJob} className="space-y-6">
                <div>
                  <label className="studio-label text-gray-400">Job Title</label>
                  <input type="text" required value={editJob.title} onChange={e => setEditJob({ ...editJob, title: e.target.value })} className="studio-input" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="studio-label text-gray-400">Company</label>
                    <input type="text" required value={editJob.company} onChange={e => setEditJob({ ...editJob, company: e.target.value })} className="studio-input" />
                  </div>
                  <div>
                    <label className="studio-label text-gray-400">Location</label>
                    <input type="text" value={editJob.location} onChange={e => setEditJob({ ...editJob, location: e.target.value })} className="studio-input" placeholder="Remote / Global" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="studio-label text-gray-400">Type</label>
                    <select value={editJob.type} onChange={e => setEditJob({ ...editJob, type: e.target.value })} className="studio-input cursor-pointer" style={{ background: '#111' }}>
                      {['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="studio-label text-gray-400">Salary (optional)</label>
                    <input type="text" value={editJob.salary} onChange={e => setEditJob({ ...editJob, salary: e.target.value })} className="studio-input" placeholder="e.g. $60,000/yr" />
                  </div>
                </div>
                <div>
                  <label className="studio-label text-gray-400">Description</label>
                  <textarea rows={5} required value={editJob.description} onChange={e => setEditJob({ ...editJob, description: e.target.value })} className="studio-input resize-none" />
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setEditingJob(null)} className="studio-button-ghost flex-1 h-12 text-xs uppercase tracking-widest font-black">Cancel</button>
                  <button type="submit" className="studio-button flex-1 h-12 text-xs uppercase tracking-widest font-black">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[85vh] overflow-y-auto glass-card p-6 md:p-12 z-[301] shadow-2xl border-brand-accent/30 flex flex-col mx-4"
            >
              <div className="flex justify-between items-center mb-12 shrink-0">
                <div>
                  <span className="studio-label text-brand-accent">Autonomous HR Audit Complete</span>
                  <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase mt-2">Strategic Report</h2>
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

      <footer className="pt-16 pb-24 md:pt-40 md:pb-60 border-t border-white/5">
        <div className="max-w-2xl">
          <h3 className="text-3xl md:text-6xl font-black tracking-tighter uppercase mb-6 md:mb-8 leading-none text-white">Work for the<br />Future.</h3>
          <p className="text-base md:text-xl font-medium text-gray-400 mb-8 md:mb-12">ShopNest connects talent with the infrastructure of tomorrow. Build your career on a platform designed for scale.</p>
        </div>
      </footer>
    </div>
  )
}

export default Jobs
