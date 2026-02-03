import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const JobList = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiJobsAvailable, setApiJobsAvailable] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    location: '',
    search: '',
    experienceLevel: '',
    source: 'all' // 'all' | 'platform' | 'apijobs'
  })
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleApply = (job) => {
    if (!user) {
      // Store the job they're trying to apply for
      localStorage.setItem('pendingJobApplication', JSON.stringify(job))
      navigate('/login', { state: { from: '/jobs', message: 'Please sign in to apply for jobs' } })
      return
    }

    if (user.role === 'employer') {
      toast.error('Employers cannot apply for jobs')
      return
    }

    if (user.role !== 'employee') {
      toast.error('Please register as a job seeker to apply for jobs')
      return
    }

    // For external API jobs, open in new tab
    if (job.externalSource === 'apijobs' && job.externalUrl) {
      window.open(job.externalUrl, '_blank')
      return
    }

    // For platform jobs, navigate to job detail page
    navigate(`/jobs/${job.id}`)
  }

  useEffect(() => {
    fetchJobs()
  }, [filters])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const platformParams = { status: 'active', ...filters }
      const apiJobsParams = {
        search: filters.search || undefined,
        location: filters.location || undefined,
        category: filters.category || undefined
      }
      Object.keys(platformParams).forEach(key => {
        if (!platformParams[key] || key === 'source') delete platformParams[key]
      })
      Object.keys(apiJobsParams).forEach(key => {
        if (!apiJobsParams[key]) delete apiJobsParams[key]
      })

      const fetches = []

      if (filters.source === 'all' || filters.source === 'platform') {
        fetches.push(
          api.get('/api/jobs', { params: platformParams }).then(r => ({ source: 'platform', ...r.data }))
        )
      }
      if (filters.source === 'all' || filters.source === 'apijobs') {
        fetches.push(
          api.get('/api/jobs/apijobs', { params: apiJobsParams })
            .then(r => ({ source: 'apijobs', ...r.data }))
            .catch(err => {
              if (err.response?.status === 503 || err.response?.status === 502) {
                setApiJobsAvailable(false)
                return { source: 'apijobs', data: [], count: 0 }
              }
              throw err
            })
        )
      }

      if (fetches.length === 0) {
        setJobs([])
        setLoading(false)
        return
      }

      const results = await Promise.all(fetches)
      const platformJobs = results.find(r => r.source === 'platform')?.data || []
      const apiJobs = results.find(r => r.source === 'apijobs')?.data || []

      // Platform filters (type, experienceLevel) don't apply to API Jobs; we filter client-side for "all"
      let combined = []
      if (filters.source === 'all') {
        combined = [...platformJobs, ...apiJobs]
        // Sort by date, newest first
        combined.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      } else if (filters.source === 'platform') {
        combined = platformJobs
      } else {
        combined = apiJobs
      }

      setJobs(combined)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching jobs')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'Negotiable'
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  const JobCard = ({ job }) => {
    const isExternal = job.externalSource === 'apijobs' && job.externalUrl
    const Wrapper = isExternal ? 'a' : Link
    const wrapperProps = isExternal
      ? { href: job.externalUrl, target: '_blank', rel: 'noopener noreferrer' }
      : { to: `/jobs/${job.id}` }

    return (
      <Wrapper
        {...wrapperProps}
        className="card hover:shadow-lg transition-shadow block"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
              {job.externalSource === 'apijobs' && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs font-medium">
                  API Jobs
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                {job.type}
              </span>
              {job.category && (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                  {job.category}
                </span>
              )}
              {job.isRemote && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Remote
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              {job.location && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </span>
              )}
              {job.salary && (
                <span className="flex items-center font-semibold text-primary-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatCurrency(job.salary)} {job.salaryType && `(${job.salaryType})`}
                </span>
              )}
            </div>
          </div>
          <div className="ml-4 text-right">
            {job.employer && (
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                  {(job.employer.name || 'E').charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{job.employer.storeName || job.employer.name}</p>
                </div>
              </div>
            )}
            <span className="text-xs text-gray-500">
              {job.created_at ? new Date(job.created_at).toLocaleDateString() : ''}
            </span>
            {isExternal && (
              <span className="block mt-1 text-xs text-primary-600">View on API Jobs →</span>
            )}
            
            {/* Apply Button */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleApply(job)
              }}
              className="mt-3 w-full btn btn-primary text-sm py-2 px-4 hover:bg-primary-700 transition-colors"
            >
              {isExternal ? 'Apply Externally' : 'Apply Now'}
            </button>
          </div>
        </div>
      </Wrapper>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">Job Opportunities</h1>

          {/* Source filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm font-medium text-gray-700">Source:</span>
            {['all', 'platform', 'apijobs'].map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setFilters(f => ({ ...f, source: src }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.source === src
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {src === 'all' ? 'All' : src === 'platform' ? 'ShopNest' : 'API Jobs'}
              </button>
            ))}
            {!apiJobsAvailable && filters.source !== 'platform' && (
              <span className="text-xs text-amber-600 self-center">API Jobs unavailable</span>
            )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search jobs..."
              className="input"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <select
              className="input"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              <option value="ecommerce">E-commerce</option>
              <option value="marketing">Marketing</option>
              <option value="customer-service">Customer Service</option>
              <option value="sales">Sales</option>
              <option value="digital-skills">Digital Skills</option>
              <option value="it-jobs">IT Jobs</option>
            </select>
            <select
              className="input"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
              <option value="task">Task</option>
              <option value="gig">Gig</option>
            </select>
            <input
              type="text"
              placeholder="Location"
              className="input"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
            <select
              className="input"
              value={filters.experienceLevel}
              onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
            >
              <option value="">All Levels</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
            </select>
          </div>

          {user?.role === 'employee' && (
            <Link
              to="/jobs/recommended"
              className="inline-block btn btn-primary mb-4"
            >
              View Recommended Jobs
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="card text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-4">
                {filters.source === 'apijobs' 
                  ? 'No external jobs available. Try switching to "ShopNest" or "All" sources.'
                  : filters.source === 'platform'
                  ? 'No jobs posted on ShopNest yet. Try switching to "API Jobs" for external opportunities.'
                  : 'No jobs found with your current filters. Try adjusting your search criteria.'
                }
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setFilters({ ...filters, search: '', category: '', type: '', location: '', experienceLevel: '' })}
                  className="btn btn-outline"
                >
                  Clear Filters
                </button>
                {filters.source !== 'all' && (
                  <button
                    onClick={() => setFilters({ ...filters, source: 'all' })}
                    className="btn btn-primary ml-2"
                  >
                    Show All Sources
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobList
