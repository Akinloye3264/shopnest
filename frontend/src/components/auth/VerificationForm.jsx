import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const VerificationForm = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [verificationMethod, setVerificationMethod] = useState('email')
  const [target, setTarget] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Get verification details from location state or localStorage
    const state = location.state || {}
    const storedData = JSON.parse(localStorage.getItem('verificationData') || '{}')
    
    const method = state.verificationMethod || storedData.verificationMethod || 'email'
    const email = state.email || storedData.email
    const phone = state.phone || storedData.phone
    
    setVerificationMethod(method)
    setTarget(method === 'email' ? email : phone)

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [location.state])

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData.split(''))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpCode = otp.join('')
    
    if (otpCode.length !== 6) {
      toast.error('Please enter all 6 digits')
      return
    }

    setLoading(true)

    try {
      // Check if this is login verification or registration verification
      const storedData = JSON.parse(localStorage.getItem('verificationData') || '{}')
      const isLoginVerification = storedData.isLoginVerification

      let response
      if (isLoginVerification) {
        // Login verification
        response = await api.post('/auth/verify-login-otp', {
          email: storedData.email,
          otp: otpCode
        })
      } else {
        // Email/phone verification
        const endpoint = verificationMethod === 'email' ? '/verify-email-otp' : '/verify-phone-otp'
        response = await api.post(endpoint, { otp: otpCode })
      }

      if (response.data.success) {
        toast.success('Verification successful!')
        
        if (isLoginVerification && response.data.token) {
          // Store token and user data
          localStorage.setItem('token', response.data.token)
          localStorage.setItem('user', JSON.stringify(response.data.user))
          localStorage.removeItem('verificationData')
          
          // Redirect based on user role
          const user = response.data.user
          if (user.role === 'customer' || user.role === 'buyer') {
            navigate('/products')
          } else if (user.role === 'seller') {
            navigate('/seller/dashboard')
          } else if (user.role === 'employee' || user.role === 'job_seeker') {
            navigate('/jobs/seeker-dashboard')
          } else if (user.role === 'employer' || user.role === 'recruiter') {
            navigate('/jobs/employer-dashboard')
          } else if (user.role === 'admin') {
            navigate('/admin/dashboard')
          } else {
            navigate('/dashboard')
          }
        } else {
          // Registration verification complete
          localStorage.removeItem('verificationData')
          navigate('/login', { 
            state: { 
              message: 'Email verified successfully! Please login to continue.' 
            } 
          })
        }
      }
    } catch (error) {
      console.error('Verification error:', error)
      const message = error.response?.data?.message || 'Verification failed'
      toast.error(message)
      
      // Clear OTP on error
      setOtp(['', '', '', '', '', ''])
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (timeLeft > 0) return

    setResending(true)

    try {
      const storedData = JSON.parse(localStorage.getItem('verificationData') || '{}')
      const isLoginVerification = storedData.isLoginVerification

      if (isLoginVerification) {
        // Resend login OTP
        await api.post('/auth/login', {
          email: storedData.email,
          password: storedData.password,
          verificationMethod: verificationMethod
        })
      } else {
        // Resend verification OTP
        const endpoint = verificationMethod === 'email' ? '/send-email-otp' : '/send-phone-otp'
        await api.post(endpoint, verificationMethod === 'email' ? { email: target } : { phone: target })
      }

      toast.success(`Verification code sent to your ${verificationMethod}`)
      setTimeLeft(600) // Reset timer to 10 minutes
      setOtp(['', '', '', '', '', ''])
    } catch (error) {
      console.error('Resend error:', error)
      const message = error.response?.data?.message || 'Failed to resend code'
      toast.error(message)
    } finally {
      setResending(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-gray-900">
            Verify Your {verificationMethod === 'email' ? 'Email' : 'Phone Number'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit code to {target}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Enter verification code
              </label>
              <div className="flex justify-center space-x-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            {timeLeft > 0 && (
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Code expires in {formatTime(timeLeft)}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>

            {/* Resend Code */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={timeLeft > 0 || resending}
                className="text-sm text-primary-600 hover:text-primary-500 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {resending ? 'Sending...' : timeLeft > 0 ? `Resend code in ${formatTime(timeLeft)}` : "Didn't receive the code? Resend"}
              </button>
            </div>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerificationForm
