import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, ShieldCheck, Github } from 'lucide-react'
import API_URL from '../config'

interface LoginProps {
  onLogin: (user: any) => void
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'credentials' | 'verify'>('credentials')
  const [resending, setResending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/google-auth/google`
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()
      if (data.requiresVerification) {
        setStep('verify')
        toast.success('Verification code sent!')
      } else if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onLogin(data.user)
        toast.success('Access granted.')
        navigate('/dashboard')
      } else {
        toast.error(data.message || 'Authentication failed.')
      }
    } catch (error) {
      toast.error('Network failure.')
    }
    setLoading(false)
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })
      const data = await response.json()
      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onLogin(data.user)
        toast.success('Access granted.')
        navigate('/dashboard')
      } else {
        toast.error(data.message || 'Verification failed.')
      }
    } catch (error) {
      toast.error('Network failure.')
    }
    setLoading(false)
  }

  const handleResendOTP = async () => {
    setResending(true)
    try {
      const response = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, context: 'login' })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('New code sent!')
      } else {
        toast.error(data.message || 'Failed to resend.')
      }
    } catch {
      toast.error('Network failure.')
    }
    setResending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 'credentials' ? (
          <motion.div
            key="login-form"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            className="w-full max-w-lg glass-card p-8 lg:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 blur-3xl -z-10" />

            <div className="text-center mb-10">
              <Link to="/" className="text-3xl font-black tracking-tighter block mb-6">
                ShopNest<span className="text-brand-accent">.</span>
              </Link>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Welcome Back</h2>
              <p className="text-gray-400 font-medium">Enter your credentials to scale up.</p>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="studio-label ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-accent transition-colors" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="studio-input studio-input-with-icon font-medium"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="studio-label ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-accent transition-colors" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="studio-input studio-input-with-icon pr-14 font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="studio-button w-full h-16 text-lg group">
                <span className="mr-2">{loading ? 'PROCESSING...' : 'ACCESS PORTAL'}</span>
                {!loading && <ArrowRight className="inline group-hover:translate-x-1 transition-transform" size={20} />}
              </button>
            </form>

            <div className="mt-10">
              <div className="relative flex items-center justify-center mb-8">
                <div className="absolute w-full border-t border-white/5"></div>
                <span className="relative bg-[#0a0a0a]/50 backdrop-blur-md px-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Secure Gateways</span>
              </div>

              <button onClick={handleGoogleLogin} className="studio-button-ghost w-full h-16 flex items-center justify-center space-x-3 group">
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span className="text-xs font-black uppercase tracking-widest group-hover:text-brand-accent transition-colors">Continue with Google</span>
              </button>
            </div>

            <p className="mt-10 text-center text-xs font-black uppercase tracking-widest text-gray-500">
              No account? <Link to="/register" className="text-white hover:text-brand-accent hover:underline underline-offset-4 transition-all">Create Identity</Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="verify-form"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="w-full max-w-lg glass-card p-12 text-center"
          >
            <ShieldCheck className="mx-auto text-brand-accent mb-6" size={64} />
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Security Layer</h2>
            <p className="text-gray-400 font-medium mb-10">
              We've dispatched a 6-digit code to <br />
              <strong className="text-white text-lg">{email}</strong>
            </p>

            <form onSubmit={handleVerifyOTP} className="space-y-8">
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="studio-input text-center text-5xl font-black tracking-[0.5em] h-24"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />

              <button type="submit" disabled={loading || otp.length !== 6} className="studio-button w-full h-16 text-lg">
                {loading ? 'VERIFYING...' : 'AUTHORIZE LOGIN'}
              </button>
            </form>

            <div className="mt-10 pt-10 border-t border-white/5">
              <p className="text-xs text-gray-500 mb-4 font-bold uppercase tracking-widest">Protocol failed?</p>
              <div className="flex justify-center space-x-8">
                <button
                  onClick={() => { setStep('credentials'); setOtp('') }}
                  className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white flex items-center"
                >
                  <ArrowLeft size={14} className="mr-2" /> Change Details
                </button>
                <button
                  onClick={handleResendOTP}
                  disabled={resending}
                  className="text-xs font-black uppercase tracking-widest text-brand-accent hover:underline disabled:opacity-30"
                >
                  {resending ? 'RETRANSMITTING...' : 'RESEND CODE'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Login
