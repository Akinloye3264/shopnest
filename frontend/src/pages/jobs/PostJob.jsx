import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'

const PostJob = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'task',
    location: '',
    salary: '',
    salaryType: 'task-based',
    requiredSkills: [],
    isRemote: false,
    experienceLevel: 'any',
    tags: [],
    applicationDeadline: '',
    maxApplications: ''
  })
  const [skillInput, setSkillInput] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, skillInput.trim()]
      })
      setSkillInput('')
    }
  }

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter(s => s !== skill)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/api/jobs', {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        maxApplications: formData.maxApplications ? parseInt(formData.maxApplications) : null
      })

      if (response.data.success) {
        toast.success('Job posted successfully!')
        navigate('/jobs')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error posting job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Post a Job Opportunity</h1>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                required
                className="input w-full"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., E-commerce Store Manager"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                name="description"
                required
                rows="8"
                className="input w-full"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the job responsibilities, requirements, and benefits..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  required
                  className="input w-full"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="marketing">Marketing</option>
                  <option value="customer-service">Customer Service</option>
                  <option value="sales">Sales</option>
                  <option value="digital-skills">Digital Skills</option>
                  <option value="business-management">Business Management</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type *
                </label>
                <select
                  name="type"
                  required
                  className="input w-full"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="task">Task</option>
                  <option value="gig">Gig</option>
                  <option value="part-time">Part-time</option>
                  <option value="full-time">Full-time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  className="input w-full"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Lagos, Nigeria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  name="experienceLevel"
                  className="input w-full"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                >
                  <option value="any">Any Level</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary/Compensation
                </label>
                <input
                  type="number"
                  name="salary"
                  className="input w-full"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Type
                </label>
                <select
                  name="salaryType"
                  className="input w-full"
                  value={formData.salaryType}
                  onChange={handleChange}
                >
                  <option value="task-based">Task-based</option>
                  <option value="fixed">Fixed</option>
                  <option value="hourly">Hourly</option>
                  <option value="commission">Commission</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="input flex-1"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill and press Enter"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="btn btn-outline"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  name="applicationDeadline"
                  className="input w-full"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Applications
                </label>
                <input
                  type="number"
                  name="maxApplications"
                  className="input w-full"
                  value={formData.maxApplications}
                  onChange={handleChange}
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isRemote"
                id="isRemote"
                className="h-4 w-4 text-primary-600"
                checked={formData.isRemote}
                onChange={handleChange}
              />
              <label htmlFor="isRemote" className="ml-2 text-sm text-gray-700">
                This is a remote position
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="btn btn-ghost flex-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={loading}
              >
                {loading ? 'Posting...' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PostJob
