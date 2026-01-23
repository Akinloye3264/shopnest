import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'

const RecommendedJobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendedJobs()
  }, [])

  const fetchRecommendedJobs = async () => {
    try {
      const response = await api.get('/api/jobs/match/recommended')
      setJobs(response.data.data || [])
    } catch (error) {
      toast.error('Error fetching recommended jobs')
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
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Recommended Jobs for You</h1>
          <p className="text-gray-600">Jobs matched to your skills and profile</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No recommended jobs found.</p>
            <Link to="/jobs" className="btn btn-primary">Browse All Jobs</Link>
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
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {job.matchScore}% Match
                      </span>
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
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {job.location && (
                        <span>{job.location}</span>
                      )}
                      {job.salary && (
                        <span className="font-semibold text-primary-600">
                          {formatCurrency(job.salary)}
                        </span>
                      )}
                    </div>
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

export default RecommendedJobs
