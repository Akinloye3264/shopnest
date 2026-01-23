import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../utils/api'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const JobDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [matchScore, setMatchScore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resume: ''
  })
  const [showApplyModal, setShowApplyModal] = useState(false)

  useEffect(() => {
    fetchJob()
    if (user?.role === 'employee') {
      fetchMatchScore()
    }
  }, [id, user])

  const fetchJob = async () => {
    try {
      const response = await api.get(`/api/jobs/${id}`)
      setJob(response.data.data)
    } catch (error) {
      toast.error('Error fetching job details')
    } finally {
      setLoading(false)
    }
  }

  const fetchMatchScore = async () => {
    try {
      const response = await api.get(`/api/jobs/${id}/match`)
      setMatchScore(response.data.data)
    } catch (error) {
      console.error('Error fetching match score:', error)
    }
  }

  const handleApply = async (e) => {
    e.preventDefault()
    setApplying(true)

    try {
      const response = await api.post(`/api/jobs/${id}/apply`, applicationData)
      if (response.data.success) {
        toast.success('Application submitted successfully!')
        setShowApplyModal(false)
        setApplicationData({ coverLetter: '', resume: '' })
        fetchJob() // Refresh to see application status
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting application')
    } finally {
      setApplying(false)
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'Negotiable'
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <p className="text-gray-600">Job not found</p>
            <Link to="/jobs" className="btn btn-primary mt-4">Back to Jobs</Link>
          </div>
        </div>
      </div>
    )
  }

  const hasApplied = job.applications?.some(app => app.applicantId === user?.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/jobs" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← Back to Jobs
        </Link>

        <div className="card mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">{job.title}</h1>
              {job.employer && (
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    {job.employer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{job.employer.storeName || job.employer.name}</p>
                    <p className="text-sm text-gray-600">{job.employer.email}</p>
                  </div>
                </div>
              )}
            </div>
            {matchScore && (
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">{matchScore.matchScore}%</div>
                <div className="text-xs text-gray-500">Match Score</div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
              {job.type}
            </span>
            {job.category && (
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                {job.category}
              </span>
            )}
            {job.experienceLevel && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {job.experienceLevel} level
              </span>
            )}
            {job.isRemote && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Remote
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
            {job.location && (
              <div>
                <p className="text-gray-600">Location</p>
                <p className="font-semibold">{job.location}</p>
              </div>
            )}
            {job.salary && (
              <div>
                <p className="text-gray-600">Salary</p>
                <p className="font-semibold">{formatCurrency(job.salary)}</p>
                {job.salaryType && <p className="text-xs text-gray-500">{job.salaryType}</p>}
              </div>
            )}
            {job.applicationDeadline && (
              <div>
                <p className="text-gray-600">Deadline</p>
                <p className="font-semibold">{new Date(job.applicationDeadline).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <p className="text-gray-600">Applications</p>
              <p className="font-semibold">{job.currentApplications} / {job.maxApplications || '∞'}</p>
            </div>
          </div>

          {user?.role === 'employee' && !hasApplied && (
            <button
              onClick={() => setShowApplyModal(true)}
              className="btn btn-primary w-full"
            >
              Apply for this Job
            </button>
          )}

          {hasApplied && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">You have already applied for this job</p>
            </div>
          )}
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          </div>
        </div>

        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {matchScore && matchScore.matchedSkills && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Matching Skills</h2>
            <div className="flex flex-wrap gap-2">
              {matchScore.matchedSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Apply Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Apply for {job.title}</h2>
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter (Optional)
                  </label>
                  <textarea
                    className="input w-full"
                    rows="6"
                    value={applicationData.coverLetter}
                    onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                    placeholder="Tell the employer why you're a good fit for this position..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume URL (Optional)
                  </label>
                  <input
                    type="url"
                    className="input w-full"
                    value={applicationData.resume}
                    onChange={(e) => setApplicationData({ ...applicationData, resume: e.target.value })}
                    placeholder="https://example.com/resume.pdf"
                  />
                  {user?.resume && (
                    <p className="text-sm text-gray-500 mt-1">
                      Your saved resume: {user.resume}
                    </p>
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="btn btn-ghost flex-1"
                    disabled={applying}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={applying}
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobDetail
