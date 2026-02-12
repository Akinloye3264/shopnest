import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Exactly like Yieldhaven */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-secondary-600 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ShopNest</span>
            </div>
          </Link>

          {/* Desktop Navigation - Role-based */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Learning Resources - Available to ALL roles */}
            <Link 
              to="/learning" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Learning
            </Link>
            
            {/* Job Seeker & Employee Navigation */}
            {(user?.role === 'employee' || user?.role === 'job_seeker') && (
              <>
                <Link 
                  to="/jobs" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Jobs
                </Link>
                <Link 
                  to="/jobs/recommended" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Recommended
                </Link>
                <Link 
                  to="/jobs/seeker-dashboard" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
              </>
            )}

            {/* Recruiter & Employer Navigation */}
            {(user?.role === 'employer' || user?.role === 'recruiter') && (
              <>
                <Link 
                  to="/jobs" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Jobs
                </Link>
                <Link 
                  to="/jobs/employer-dashboard" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/jobs/post" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Post Job
                </Link>
              </>
            )}

            {/* Buyer & Customer Navigation */}
            {(user?.role === 'customer' || user?.role === 'buyer') && (
              <>
                <Link 
                  to="/products" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Products
                </Link>
                <Link 
                  to="/cart" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Cart
                </Link>
                <Link 
                  to="/my-orders" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Orders
                </Link>
              </>
            )}

            {/* Seller Navigation */}
            {user?.role === 'seller' && (
              <>
                <Link 
                  to="/seller/dashboard" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/seller/products" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  My Products
                </Link>
                <Link 
                  to="/seller/upload-product" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Upload Product
                </Link>
              </>
            )}
            
            {/* Admin Navigation */}
            {user?.role === 'admin' && (
              <Link 
                to="/admin/dashboard" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                Admin
              </Link>
            )}
            
            {/* Common user actions */}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/messages"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Messages
                </Link>
                <Link
                  to="/notifications"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Notifications
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-secondary-600 text-white hover:bg-secondary-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button - Exactly like Yieldhaven */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu - Role-based */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Learning Resources - Available to ALL roles */}
              <Link 
                to="/learning" 
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
              >
                Learning
              </Link>
              
              {/* Job Seeker & Employee Navigation */}
              {(user?.role === 'employee' || user?.role === 'job_seeker') && (
                <>
                  <Link 
                    to="/jobs" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
                  >
                    Jobs
                  </Link>
                  <Link 
                    to="/jobs/recommended" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
                  >
                    Recommended
                  </Link>
                  <Link 
                    to="/jobs/seeker-dashboard" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
                  >
                    Dashboard
                  </Link>
                </>
              )}

              {/* Recruiter & Employer Navigation */}
              {(user?.role === 'employer' || user?.role === 'recruiter') && (
                <>
                  <Link 
                    to="/jobs" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
                  >
                    Jobs
                  </Link>
                  <Link 
                    to="/jobs/employer-dashboard" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/jobs/post" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
                  >
                    Post Job
                  </Link>
                </>
              )}

              {/* Buyer & Customer Navigation */}
              {(user?.role === 'customer' || user?.role === 'buyer') && (
                <>
                  <Link 
                    to="/products" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
                  >
                    Products
                  </Link>
                  <Link 
                    to="/cart" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
                  >
                    Cart
                  </Link>
                  <Link 
                    to="/my-orders" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
                  >
                    Orders
                  </Link>
                </>
              )}

              {/* Seller Navigation */}
              {user?.role === 'seller' && (
                <>
                  <Link 
                    to="/seller/dashboard" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/seller/products" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
                  >
                    My Products
                  </Link>
                  <Link 
                    to="/seller/upload-product" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
                  >
                    Upload Product
                  </Link>
                </>
              )}
              
              {/* Admin Navigation */}
              {user?.role === 'admin' && (
                <Link 
                  to="/admin/dashboard" 
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
                >
                  Admin
                </Link>
              )}
              
              {/* Common user actions */}
              {user ? (
                <>
                  <Link 
                    to="/messages" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
                  >
                    Messages
                  </Link>
                  <Link 
                    to="/notifications" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
                  >
                    Notifications
                  </Link>
                  <Link 
                    to="/profile" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
