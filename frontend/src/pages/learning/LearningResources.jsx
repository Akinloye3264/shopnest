import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'

const LearningResources = () => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: '',
    resourceType: ''
  })

  useEffect(() => {
    fetchResources()
  }, [filters])

  const fetchResources = async () => {
    try {
      const params = { ...filters }
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key]
      })
      
      const response = await api.get('/api/learning-resources', { params })
      setResources(response.data.data || [])
    } catch (error) {
      toast.error('Error fetching learning resources')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      entrepreneurship: 'bg-purple-100 text-purple-800',
      ecommerce: 'bg-blue-100 text-blue-800',
      digital_skills: 'bg-green-100 text-green-800',
      financial_literacy: 'bg-yellow-100 text-yellow-800',
      marketing: 'bg-pink-100 text-pink-800',
      sales: 'bg-red-100 text-red-800',
      customer_service: 'bg-indigo-100 text-indigo-800',
      business_management: 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">Learning Center</h1>
          <p className="text-gray-600 mb-6">Resources to help you grow your business and skills</p>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search resources..."
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
              <option value="entrepreneurship">Entrepreneurship</option>
              <option value="ecommerce">E-commerce</option>
              <option value="digital_skills">Digital Skills</option>
              <option value="financial_literacy">Financial Literacy</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
              <option value="customer_service">Customer Service</option>
              <option value="business_management">Business Management</option>
            </select>
            <select
              className="input"
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select
              className="input"
              value={filters.resourceType}
              onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="course">Course</option>
              <option value="guide">Guide</option>
              <option value="tool">Tool</option>
              <option value="template">Template</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : resources.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No learning resources found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <Link
                key={resource.id}
                to={`/learning/${resource.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                {resource.thumbnail && (
                  <img
                    src={resource.thumbnail}
                    alt={resource.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(resource.category)}`}>
                    {resource.category.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                    {resource.resourceType}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {resource.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{resource.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{resource.viewCount} views</span>
                  {resource.duration && <span>{resource.duration} min</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LearningResources
