import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'

const CustomerProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestData, setRequestData] = useState({ productName: '', description: '', phone: '', image: '' })
  const [requesting, setRequesting] = useState(false)
  const [noResults, setNoResults] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [search, category])

  const fetchProducts = async () => {
    try {
      const params = {}
      if (search) params.search = search
      if (category) params.category = category
      const response = await api.get('/api/products', { params })
      if (response.data.success) {
        setProducts(response.data.data || [])
        setNoResults(response.data.noResults || false)
        if (response.data.noResults && search) {
          setRequestData({ ...requestData, productName: search })
        }
      } else {
        console.error('Error fetching products:', response.data.message)
        setProducts([])
        setNoResults(false)
      }
    } catch (error) {
      console.error('Error fetching products:', error.response?.data || error.message)
      setProducts([])
      toast.error('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  const categories = [
    'All Categories',
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports & Outdoors',
    'Books',
    'Toys & Games',
    'Health & Beauty',
    'Food & Beverages'
  ]

  const handleProductRequest = async (e) => {
    e.preventDefault()
    setRequesting(true)
    try {
      const response = await api.post('/api/product-requests', requestData)
      if (response.data.success) {
        toast.success('Product request submitted! All sellers have been notified.')
        setShowRequestModal(false)
        setRequestData({ productName: '', description: '', phone: '', image: '' })
        setSearch('')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request')
    } finally {
      setRequesting(false)
    }
  }

  const addToCart = async (productId) => {
    if (!user || user.role !== 'customer') {
      toast.error('Please login as a customer to add items to cart')
      return
    }

    try {
      const response = await api.post('/api/cart', { productId, quantity: 1 })
      if (response.data.success) {
        toast.success('Item added to cart!')
        // Navigate to cart page
        navigate('/cart')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">Browse Products</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search products..."
              className="input flex-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="input md:w-64"
              value={category}
              onChange={(e) => setCategory(e.target.value === 'All Categories' ? '' : e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">
              {noResults && search 
                ? `No products found for "${search}". Can't find what you're looking for?`
                : 'No products found.'}
            </p>
            {noResults && search && (
              <button
                onClick={() => setShowRequestModal(true)}
                className="btn btn-primary"
              >
                Request This Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`} className="card hover:shadow-lg transition-shadow">
                {product.images && product.images[0] && (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xl font-bold text-primary-600">{formatCurrency(product.price)}</span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-gray-500 line-through">{formatCurrency(product.compareAtPrice)}</span>
                  )}
                </div>
                {user?.role === 'customer' && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      addToCart(product.id)
                    }}
                    className="btn btn-primary w-full mt-2"
                  >
                    Add to Cart
                  </button>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Product Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Request a Product</h2>
              <form onSubmit={handleProductRequest}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      className="input w-full"
                      value={requestData.productName}
                      onChange={(e) => setRequestData({ ...requestData, productName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      className="input w-full"
                      rows="3"
                      value={requestData.description}
                      onChange={(e) => setRequestData({ ...requestData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Phone Number *
                    </label>
                    <input
                      type="tel"
                      className="input w-full"
                      value={requestData.phone}
                      onChange={(e) => setRequestData({ ...requestData, phone: e.target.value })}
                      required
                      placeholder="e.g., +234 123 456 7890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      className="input w-full"
                      value={requestData.image}
                      onChange={(e) => setRequestData({ ...requestData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestModal(false)
                      setRequestData({ productName: '', description: '', phone: '', image: '' })
                    }}
                    className="btn btn-ghost flex-1"
                    disabled={requesting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={requesting}
                  >
                    {requesting ? 'Submitting...' : 'Submit Request'}
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

export default CustomerProducts

