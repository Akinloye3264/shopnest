import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, Briefcase } from 'lucide-react'
import API_URL from '../config'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('buyer')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [resending, setResending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [googleId, setGoogleId] = useState('')
  const [picture, setPicture] = useState('')
  const [statusMsg, setStatusMsg] = useState('CREATE IDENTITY')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const isGoogleFlow = Boolean(googleId)

  // Pre-warm server on page load
  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(() => console.log('✓ Server pre-warmed'))
      .catch(() => {})
  }, [])

  // Google OAuth Pre-fill — fixed: useEffect not useState
  useEffect(() => {
    const emailParam = searchParams.get('email')
    const nameParam = searchParams.get('name')
    const gidParam = searchParams.get('googleId')
    const picParam = searchParams.get('picture')
    if (emailParam) setEmail(emailParam)
    if (nameParam) setName(nameParam)
    if (gidParam) setGoogleId(gidParam)
    if (picParam) setPicture(picParam)
  }, [searchParams])

  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/api/google-auth/google`
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatusMsg(isGoogleFlow ? 'CREATING ACCOUNT...' : 'Validating Credentials...')

    const statusTimers = [
      setTimeout(() => setStatusMsg('CREATING ACCOUNT...'), 5000),
      setTimeout(() => setStatusMsg('ALMOST THERE...'), 15000)
    ]

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password: isGoogleFlow ? undefined : password,
          role,
          googleId: googleId || undefined,
          picture: picture || undefined
        })
      })

      const data = await response.json()

      if (data.googleSignup && data.token) {
        // Google signup: account created, auto-login immediately
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        toast.success('Account created! Welcome to ShopNest.')
        navigate('/dashboard')
      } else if (data.requiresVerification) {
        setStep('verify')
        setStatusMsg('CREATE IDENTITY')
        toast.success('Verification code sent!')
      } else if (data.success) {
        toast.success('Identity created! Please login.')
        navigate('/login')
      } else {
        setStatusMsg('CREATE IDENTITY')
        toast.error(data.message || 'Registration failed')
      }
    } catch (error) {
      setStatusMsg('CREATE IDENTITY')
      toast.error('Connection error')
    }

    statusTimers.forEach(timer => clearTimeout(timer))
    setLoading(false)
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Account verified! Please log in.')
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
      const response = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, context: 'register' })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('New code sent!')
      } else {
        toast.error(data.message || 'Failed to resend.')
      }
    } catch {
      toast.error('Connection error')
    }
    setResending(false)
  }


  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-20">
      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <motion.div
            key="register-form"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            className="w-full max-w-2xl glass-card p-8 lg:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 blur-3xl -z-10" />

            {/* Back to home */}
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-6">
              <ArrowLeft size={14} /> Go Back
            </Link>

            {/* Google Flow banner */}
            {isGoogleFlow && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-brand-accent/10 border border-brand-accent/30 flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 48 48" className="flex-shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <p className="text-xs font-black uppercase tracking-widest text-brand-accent">
                  Signing up with Google · Just pick your role
                </p>
              </div>
            )}

            <div className="text-center mb-10">
              <Link to="/" className="text-3xl font-black tracking-tighter block mb-6">
                ShopNest<span className="text-brand-accent">.</span>
              </Link>
              <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Create Identity</h1>
              <p className="text-gray-400 font-medium uppercase tracking-widest text-xs">Join the ShopNest ecosystem</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="studio-label ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-accent transition-colors" size={20} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="studio-input studio-input-with-icon font-medium"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="studio-label ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-accent transition-colors" size={20} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      readOnly={isGoogleFlow}
                      className={`studio-input studio-input-with-icon font-medium ${isGoogleFlow ? 'opacity-60 cursor-not-allowed' : ''}`}
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Password — only shown for email/password signup, hidden for Google */}
              {!isGoogleFlow && (
                <div className="space-y-2">
                  <label className="studio-label ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-accent transition-colors" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="studio-input studio-input-with-icon pr-12 font-medium"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="studio-label ml-1">Primary Intent</label>
                <div className="relative group">
                  <Briefcase className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-accent transition-colors" size={20} />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="studio-input studio-input-with-icon appearance-none font-bold cursor-pointer bg-[#0d0d0d] text-white"
                  >
                    <option value="buyer" className="bg-[#0d0d0d] text-white">COMMERCE (BUYER)</option>
                    <option value="seller" className="bg-[#0d0d0d] text-white">ENTERPRISE (SELLER)</option>
                    <option value="job_seeker" className="bg-[#0d0d0d] text-white">TALENT (JOB SEEKER)</option>
                    <option value="employer" className="bg-[#0d0d0d] text-white">ORGANIZATION (EMPLOYER)</option>
                    <option value="employee" className="bg-[#0d0d0d] text-white">TEAM MEMBER (EMPLOYEE)</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="studio-button w-full h-16 text-lg group">
                <span className="mr-2">{loading ? statusMsg : (isGoogleFlow ? 'COMPLETE SIGNUP' : 'CREATE IDENTITY')}</span>
                {!loading && <ArrowRight className="inline group-hover:translate-x-1 transition-transform" size={20} />}
              </button>
            </form>

            {/* Google button only shown for non-Google flow */}
            {!isGoogleFlow && (
              <div className="mt-8">
                <div className="relative flex items-center justify-center mb-8">
                  <div className="absolute w-full border-t border-white/5"></div>
                  <span className="relative bg-[#0a0a0a]/50 backdrop-blur-md px-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Or sign up with Google</span>
                </div>

                <button onClick={handleGoogleSignup} className="studio-button-ghost w-full h-16 flex items-center justify-center space-x-3 group">
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span className="text-xs font-black uppercase tracking-widest group-hover:text-brand-accent transition-colors">Continue with Google</span>
                </button>
              </div>
            )}

            <p className="mt-10 text-center text-xs font-black uppercase tracking-widest text-gray-500">
              Identity exists? <Link to="/login" className="text-white hover:text-brand-accent hover:underline underline-offset-4 transition-all">Authenticate</Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="verify-form"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="w-full max-w-lg glass-card p-8 md:p-12 text-center"
          >
            <ShieldCheck className="mx-auto text-brand-accent mb-6" size={64} />
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Verification</h2>
            <p className="text-gray-400 font-medium mb-3">
              A 6-digit security code has been sent to:
            </p>
            <p className="text-white font-bold text-base mb-8">{email}</p>

            <form onSubmit={handleVerifyOTP} className="space-y-8">
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="studio-input text-center text-3xl md:text-5xl font-black tracking-[0.3em] md:tracking-[0.5em] h-16 md:h-24"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />

              <button type="submit" disabled={loading || otp.length !== 6} className="studio-button w-full h-16 text-lg">
                {loading ? 'CONFIRMING...' : 'FINALIZE REGISTRATION'}
              </button>
            </form>

            <div className="mt-10 pt-10 border-t border-white/5 text-center">
              <button
                onClick={() => { setStep('form'); setOtp('') }}
                className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white flex items-center justify-center mb-4 mx-auto"
              >
                <ArrowLeft size={14} className="mr-2" /> Adjust Details
              </button>
              <button
                onClick={handleResendOTP}
                disabled={resending}
                className="text-xs font-black uppercase tracking-widest text-brand-accent hover:underline disabled:opacity-30"
              >
                {resending ? 'RETRANSMITTING...' : 'RESEND CODE'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Register
