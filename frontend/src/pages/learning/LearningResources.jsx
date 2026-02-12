import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'

const LearningResources = () => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [showAiAssistant, setShowAiAssistant] = useState(false)
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
    setLoading(true)
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

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) {
      toast.error('Please enter a question or topic')
      return
    }

    setAiLoading(true)
    try {
      const response = await api.post('/api/ai/learning-assistant', {
        query: aiQuery,
        context: 'learning_resources'
      })
      setAiResponse(response.data.response)
    } catch (error) {
      toast.error('Error getting AI response')
      console.error('AI Error:', error)
    } finally {
      setAiLoading(false)
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Learning Center</h1>
              <p className="text-gray-600">Resources to help you grow your business and skills</p>
            </div>
            
            {/* AI Assistant Toggle */}
            <button
              onClick={() => setShowAiAssistant(!showAiAssistant)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 9.143L12 21l-6.364-8.857M12 3l6.364 9.143L12 21" />
              </svg>
              <span className="hidden sm:inline">AI Assistant</span>
            </button>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search resources..."
              className="input w-full"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <select
              className="input w-full"
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
              className="input w-full"
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select
              className="input w-full"
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

        {/* AI Assistant Panel */}
        {showAiAssistant && (
          <div className="mb-8">
            <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 9.143L12 21l-6.364-8.857M12 3l6.364 9.143L12 21" />
                  </svg>
                  AI Learning Assistant
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask me about learning resources, business topics, or skill development..."
                      className="input flex-1"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAiQuery()}
                    />
                    <button
                      onClick={handleAiQuery}
                      disabled={aiLoading}
                      className="btn btn-primary px-6"
                    >
                      {aiLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          <span>Thinking...</span>
                        </div>
                      ) : (
                        'Ask AI'
                      )}
                    </button>
                  </div>
                  
                  {aiResponse && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          AI
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 whitespace-pre-wrap">{aiResponse}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : resources.length === 0 ? (
          <div className="card text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4 17.774 5.168 19.246 7.5 19.246c1.747 0 3.332-.477 4.5-1.253M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4 17.774 5.168 19.246 7.5 19.246c1.747 0 3.332-.477 4.5-1.253" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No learning resources found</h3>
            <p className="text-gray-600 mb-4">
              {filters.category || filters.difficulty || filters.resourceType || filters.search
                ? 'No resources match your current filters. Try adjusting your search criteria.'
                : 'No learning resources available yet. Check back soon for new content!'
              }
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setFilters({ ...filters, search: '', category: '', type: '', location: '', experienceLevel: '' })}
                className="btn btn-outline"
              >
                Clear All Filters
              </button>
              <button
                onClick={() => setShowAiAssistant(true)}
                className="btn btn-primary"
              >
                Ask AI for Recommendations
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resources.map((resource) => (
              <Link
                key={resource.id}
                to={`/learning/${resource.id}`}
                className="card hover:shadow-lg transition-shadow group"
              >
                {resource.thumbnail && (
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img
                      src={resource.thumbnail}
                      alt={resource.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
                      {resource.category.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                      {resource.resourceType}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {resource.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{resource.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {resource.viewCount || 0} views
                      </span>
                      {resource.duration && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3l3 3v4M12 8l-3-3m6 0l-3 3" />
                          </svg>
                          {resource.duration} min
                        </span>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-primary-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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

export default LearningResources
