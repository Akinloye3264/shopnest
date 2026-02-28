import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('buyer')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [resending, setResending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleGoogleSignup = () => {
    window.location.href = 'http://localhost:5001/api/google-auth/google'
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, phone: phone || undefined })
      })

      const data = await response.json()

      if (data.requiresVerification) {
        setStep('verify')
        toast.success('Verification code sent to your email!')
      } else if (data.success) {
        toast.success('Registration successful! Please login.')
        navigate('/login')
      } else {
        toast.error(data.message || 'Registration failed')
      }
    } catch (error) {
      toast.error('Connection error')
    }
    setLoading(false)
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5001/api/auth/verify-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Account verified! Please login.')
        navigate('/login')
      } else {
        toast.error(data.message || 'Verification failed')
      }
    } catch (error) {
      toast.error('Connection error')
    }
    setLoading(false)
  }

  const handleResendOTP = async () => {
    setResending(true)
    try {
      const response = await fetch('http://localhost:5001/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone: phone || undefined, context: 'register' })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('New verification code sent!')
      } else {
        toast.error(data.message || 'Failed to resend code.')
      }
    } catch {
      toast.error('Connection error')
    }
    setResending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg radiant-card p-12 bg-white">
        {step === 'form' ? (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Create Account</h1>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Join the ShopNest ecosystem</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="radiant-input"
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="radiant-input"
                  placeholder="Email Address"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Phone Number <span className="text-gray-300">(Optional — for SMS verification)</span></label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="radiant-input"
                  placeholder="+234 800 000 0000"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="radiant-input pr-14"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Your Primary Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="radiant-input appearance-none bg-white font-bold"
                >
                  <option value="buyer">Shop for Products</option>
                  <option value="seller">Sell Products & Hire</option>
                  <option value="job_seeker">Find Job Opportunities</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="radiant-button w-full h-14 text-sm font-black uppercase tracking-widest mt-4">
                {loading ? 'Processing...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative flex items-center justify-center mb-8">
                <div className="absolute w-full border-t border-gray-200"></div>
                <span className="relative bg-white px-4 text-[10px] font-black uppercase tracking-widest text-gray-300">Or</span>
              </div>

              <button onClick={handleGoogleSignup} className="w-full h-14 flex items-center justify-center space-x-3 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-black transition-all cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest">Sign up with Google Account</span>
              </button>
            </div>

            <p className="mt-10 text-center text-sm font-bold text-gray-400">
              ALREADY HAVE AN ACCOUNT? <Link to="/login" className="text-brand-primary hover:underline">SIGN IN</Link>
            </p>
          </>
        ) : (
          <>
            <div className="text-center mb-10">
              <button
                onClick={() => { setStep('form'); setOtp('') }}
                className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-6 block mx-auto"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Verify Email</h1>
              <p className="text-gray-400 font-medium text-sm mt-4">
                We sent a 6-digit code to<br />
                <strong className="text-black text-base">{email}</strong>
              </p>
              {phone && (
                <p className="text-gray-300 text-xs mt-2">Also sent via SMS to {phone}</p>
              )}
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-8">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Verification Code</label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="radiant-input text-center text-3xl font-black tracking-[0.5em]"
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
              </div>

              <button type="submit" disabled={loading || otp.length !== 6} className="radiant-button w-full h-14 text-sm font-black uppercase tracking-widest disabled:opacity-30">
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400 mb-3">Didn't receive a code?</p>
              <button
                onClick={handleResendOTP}
                disabled={resending}
                className="text-xs font-black uppercase tracking-widest text-black hover:underline underline-offset-4 decoration-2 disabled:opacity-30"
              >
                {resending ? 'SENDING...' : 'RESEND CODE'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Register
