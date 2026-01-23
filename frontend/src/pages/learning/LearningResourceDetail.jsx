import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../utils/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'

const LearningResourceDetail = () => {
  const { id } = useParams()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResource()
  }, [id])

  const fetchResource = async () => {
    try {
      const response = await api.get(`/api/learning-resources/${id}`)
      setResource(response.data.data)
    } catch (error) {
      toast.error('Error fetching learning resource')
    } finally {
      setLoading(false)
    }
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

  if (!resource) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <p className="text-gray-600">Resource not found</p>
            <Link to="/learning" className="btn btn-primary mt-4">Back to Learning Center</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/learning" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← Back to Learning Center
        </Link>

        <div className="card">
          {resource.thumbnail && (
            <img
              src={resource.thumbnail}
              alt={resource.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
              {resource.category.replace('_', ' ')}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
              {resource.resourceType}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {resource.difficulty}
            </span>
            {resource.duration && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {resource.duration} min
              </span>
            )}
          </div>

          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">{resource.title}</h1>
          <p className="text-gray-600 mb-6">{resource.description}</p>

          <div className="prose max-w-none mb-6">
            <div className="whitespace-pre-wrap text-gray-700">{resource.content}</div>
          </div>

          {resource.url && (
            <div className="mt-6">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                View Resource
              </a>
            </div>
          )}

          {resource.tags && resource.tags.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-2">Tags:</p>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LearningResourceDetail
