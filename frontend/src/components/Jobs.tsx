import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  salary: string
  type: string
}

function Jobs({ user }: { user: any }) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [externalJobs, setExternalJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showPostForm, setShowPostForm] = useState(false)
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    type: 'Full-time',
    salary: ''
  })

  useEffect(() => {
    fetchJobs()
    fetchExternalJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/jobs')
      const data = await res.json()
      if (data.success) setJobs(data.jobs)
    } catch (err) {
      toast.error('Local job fetch failed.')
    }
  }

  const fetchExternalJobs = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/ai/external-jobs?search=business')
      const data = await res.json()
      if (data.success) setExternalJobs(data.jobs)
    } catch (err) {
      console.log('Global pool offline.')
    }
    setLoading(false)
  }

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:5001/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newJob, employerId: user.id })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Opportunity published.')
        setShowPostForm(false)
        fetchJobs()
      }
    } catch (err) {
      toast.error('Posting failure.')
    }
  }

  const applyForJob = async (jobId: string) => {
    try {
      const res = await fetch(`http://localhost:5001/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      const data = await res.json()
      if (data.success) toast.success('Application transmitted.')
    } catch (err) {
      toast.error('Application failed.')
    }
  }

  return (
    <div className="space-y-32">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
        <div className="max-w-3xl pt-20">
          <span className="studio-label">System / Recruitment</span>
          <h1 className="studio-h1">Global Talent<br />Search Portal.</h1>
          <p className="text-xl font-medium text-gray-400">ShopNest bridges the gap between high-scale ventures and elite ecosystem talent.</p>
        </div>
        {user.role === 'seller' && (
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="studio-button h-20 px-12 text-lg uppercase tracking-widest"
          >
            {showPostForm ? 'CANCEL POSTING' : 'PUBLISH CAREER'}
          </button>
        )}
      </header>

      {showPostForm && (
        <section className="studio-card animate-slide-up bg-black text-white border-none">
          <span className="studio-label text-white/50 mb-12">Career Specification</span>
          <form onSubmit={handlePostJob} className="studio-grid">
            <div className="col-span-12 lg:col-span-6 space-y-12">
              <div>
                <label className="studio-label text-white/30">Job Title</label>
                <input type="text" required value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} className="studio-input bg-white/10 border-white/10 text-white focus:bg-white/20" />
              </div>
              <div>
                <label className="studio-label text-white/30">Company Designation</label>
                <input type="text" required value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} className="studio-input bg-white/10 border-white/10 text-white focus:bg-white/20" />
              </div>
              <div>
                <label className="studio-label text-white/30">Geographic Location</label>
                <input type="text" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} className="studio-input bg-white/10 border-white/10 text-white focus:bg-white/20" />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6 flex flex-col justify-between">
              <div>
                <label className="studio-label text-white/30">Description & Requirements</label>
                <textarea rows={6} required value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} className="studio-input bg-white/10 border-white/10 text-white focus:bg-white/20 resize-none" />
              </div>
              <button type="submit" className="studio-button bg-white text-black hover:bg-gray-200 w-full h-20 text-xl tracking-tighter mt-12">ACTIVATE LISTING</button>
            </div>
          </form>
        </section>
      )}

      <div className="studio-grid">
        {/* Local Jobs Pool */}
        <div className="col-span-12 lg:col-span-8 space-y-12">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-300">ShopNest Network Opportunities</h3>
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="studio-card p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group">
                <div>
                  <h4 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">{job.title}</h4>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{job.company} • {job.location}</p>
                </div>
                <button onClick={() => applyForJob(job.id)} className="studio-button-ghost uppercase text-[10px] tracking-[0.3em] font-black px-12 h-14 w-full md:w-auto">Transmit Profile</button>
              </div>
            ))}
            {jobs.length === 0 && <div className="p-20 text-center studio-card border-dashed">No ecosystem listings currently available.</div>}
          </div>

          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-300 mt-32">Global Market Integration (Adzuna)</h3>
          <div className="studio-grid">
            {externalJobs.map((job, i) => (
              <div key={i} className="col-span-12 md:col-span-6 studio-card flex flex-col p-12">
                <div className="flex justify-between items-start mb-8 gap-4">
                  <h4 className="text-xl font-black uppercase leading-[0.9] tracking-tighter">{job.title.replace(/<\/?[^>]+(>|$)/g, "")}</h4>
                  <span className="shrink-0 bg-gray-100 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{job.location.display_name}</span>
                </div>
                <p className="text-sm text-gray-500 font-medium leading-relaxed flex-1 mb-12 uppercase">{job.description.substring(0, 180)}...</p>
                <a href={job.redirect_url} target="_blank" className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-8 self-start">Access External Node</a>
              </div>
            ))}
          </div>
        </div>

        {/* Career Sidebar */}
        <aside className="col-span-12 lg:col-span-4 space-y-12">
          <div className="studio-card bg-black text-white p-12">
            <span className="studio-label text-white/30">AI Career Strategist</span>
            <h3 className="text-3xl font-black tracking-tighter uppercase mt-4 mb-8 leading-none">Profile<br />Optimization.</h3>
            <p className="text-sm font-medium opacity-50 leading-relaxed mb-12">
              WE RECOMMEND INJECTING "STRATEGIC OPERATIONS" AND "SUSTAINABILITY LOGISTICS" INTO YOUR CAREER NARRATIVE. GLOBAL DEMAND FOR THESE SKILLS HAS SURGED BY 40% IN THE LAST QUARTER.
            </p>
            <button className="studio-button bg-white text-black w-full h-16 text-xs tracking-widest uppercase">AUDIT RESUME</button>
          </div>

          <div className="studio-card p-12">
            <span className="studio-label mb-8">Ecosystem Skills</span>
            <div className="flex flex-wrap gap-3">
              {['Project Management', 'E-commerce Ops', 'AI Strategy', 'Revenue Systems', 'Scaling'].map(skill => (
                <span key={skill} className="px-6 py-3 bg-gray-50 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">{skill}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <footer className="pt-40 pb-60 border-t border-gray-100">
        <div className="max-w-2xl">
          <h3 className="text-6xl font-black tracking-tighter uppercase mb-8 leading-none">Work for the<br />Future.</h3>
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
