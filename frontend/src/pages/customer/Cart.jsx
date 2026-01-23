import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'

const Cart = () => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role === 'customer') {
      fetchCart()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchCart = async () => {
    try {
      const response = await api.get('/api/cart')
      if (response.data.success) {
        setCart(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast.error('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await api.patch(`/api/cart/${productId}`, { quantity })
      if (response.data.success) {
        setCart(response.data.data)
        toast.success('Cart updated')
        fetchCart() // Refresh to get enriched data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update cart')
    }
  }

  const removeItem = async (productId) => {
    try {
      const response = await api.delete(`/api/cart/${productId}`)
      if (response.data.success) {
        setCart(response.data.data)
        toast.success('Item removed from cart')
        fetchCart() // Refresh
      }
    } catch (error) {
      toast.error('Failed to remove item')
    }
  }

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return
    
    try {
      const response = await api.delete('/api/cart')
      if (response.data.success) {
        setCart({ items: [], total: 0 })
        toast.success('Cart cleared')
      }
    } catch (error) {
      toast.error('Failed to clear cart')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  if (!user || user.role !== 'customer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center">
            <p className="text-gray-600">Please login as a customer to view your cart.</p>
            <Link to="/login" className="btn btn-primary mt-4">
              Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    )
  }

  const items = cart?.items || []
  const total = cart?.total || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="card p-4">
                  <div className="flex gap-4">
                    {item.product?.image && (
                      <img
                        src={item.product.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-primary-600 font-bold">{formatCurrency(item.price)}</p>
                      {item.product?.sellerEmail && (
                        <p className="text-sm text-gray-500">Seller: {item.product.sellerEmail}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="btn btn-sm btn-ghost"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="btn btn-sm btn-ghost"
                            disabled={item.quantity >= (item.product?.stock || 0)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={clearCart}
                className="btn btn-ghost text-red-600"
              >
                Clear Cart
              </button>
            </div>

            <div className="md:col-span-1">
              <div className="card p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatCurrency(0)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className="btn btn-primary w-full"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/checkout', { state: { items, total } })
                  }}
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
