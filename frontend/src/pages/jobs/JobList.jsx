import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const JobList = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    location: '',
    search: '',
    experienceLevel: ''
  })
  const { user } = useAuth()

  useEffect(() => {
    fetchJobs()
  }, [filters])

  const fetchJobs = async () => {
    try {
      const params = { status: 'active', ...filters }
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key]
      })
      
      const response = await api.get('/api/jobs', { params })
      setJobs(response.data.data || [])
    } catch (error) {
      toast.error('Error fetching jobs')
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">Job Opportunities</h1>
          
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No jobs found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
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
                    <div className="flex items-center gap-4 text-sm text-gray-600">
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
                          {job.employer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{job.employer.storeName || job.employer.name}</p>
                        </div>
                      </div>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobList
