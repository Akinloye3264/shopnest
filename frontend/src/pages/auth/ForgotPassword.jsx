import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/api/auth/forgotpassword', { email })
      toast.success(response.data.message || 'Password reset email sent')
      setSent(true)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-display font-bold text-primary-600">ShopNest</span>
          </Link>
          <h2 className="mt-6 text-3xl font-display font-bold text-gray-900">
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we'll send you a link to reset your password
          </p>
        </div>

        <div className="card">
          {!sent ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary py-3"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>

              <div className="text-center">
                <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  Back to login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Check your email</h3>
              <p className="text-sm text-gray-600">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-xs text-gray-500">
                The link will expire in 10 minutes. Please check your spam folder if you don't see it.
              </p>
              <Link to="/login" className="block btn btn-primary mt-4">
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

