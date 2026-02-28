import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

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
    window.location.href = 'http://localhost:5001/api/google-auth/google'
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()
      if (data.requiresVerification) {
        setStep('verify')
        toast.success('Verification code sent to your email!')
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
      const response = await fetch('http://localhost:5001/api/auth/verify-login', {
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
      const response = await fetch('http://localhost:5001/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, context: 'login' })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('New verification code sent!')
      } else {
        toast.error(data.message || 'Failed to resend code.')
      }
    } catch {
      toast.error('Network failure.')
    }
    setResending(false)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Visual Side */}
      <div className="lg:w-1/2 p-8 lg:p-20 bg-black flex flex-col justify-between text-white overflow-hidden relative">
        <div className="z-10">
          <Link to="/" className="text-4xl font-black tracking-tighter">ShopNest<span className="text-gray-500">.</span></Link>
        </div>
        <div className="z-10 mt-20 lg:mt-0">
          <h1 className="text-7xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] uppercase mb-12">Scale<br />Now.</h1>
          <p className="text-xl font-medium text-gray-400 max-w-md leading-relaxed">
            The infrastructure for modern digital commerce and talent acquisition.
          </p>
        </div>
        <div className="z-10 flex space-x-8 text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mt-12 lg:mt-0">
          <span>MARKETPLACE</span>
          <span>RECRUITMENT</span>
          <span>AI SYSTEMS</span>
        </div>
        {/* Background Graphic */}
        <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-indigo-500 opacity-10 blur-[200px] select-none pointer-events-none"></div>
      </div>

      {/* Form Side */}
      <div className="lg:w-1/2 p-8 lg:p-40 flex flex-col justify-center bg-white relative">
        <div className="max-w-md w-full mx-auto">
          {step === 'credentials' ? (
            <>
              <div className="mb-20">
                <h2 className="text-5xl font-black tracking-tighter uppercase mb-2">Login!</h2>
                <p className="text-gray-400 font-medium">Please enter your credentials.</p>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-10">
                <div className="group">
                  <label className="studio-label group-focus-within:text-black transition-colors">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="studio-input"
                    placeholder="example@gmail.com"
                  />
                </div>

                <div className="group">
                  <label className="studio-label group-focus-within:text-black transition-colors">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="studio-input pr-14"
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

                <button type="submit" disabled={loading} className="studio-button w-full h-16 text-lg">
                  {loading ? 'PROCESSING...' : 'LOGIN'}
                </button>
              </form>

              <div className="mt-12 text-center">
                <div className="relative flex items-center justify-center mb-10">
                  <div className="absolute w-full border-t border-gray-100"></div>
                </div>

                <button onClick={handleGoogleLogin} className="studio-button-ghost w-full h-16 flex items-center justify-center space-x-4">
                  <span className="text-[10px] font-black uppercase tracking-widest">Sign in with Google Account</span>
                </button>
              </div>

              <p className="mt-16 text-center text-xs font-black uppercase tracking-widest text-gray-300">
                NO ACCOUNT? <Link to="/register" className="text-black hover:underline underline-offset-4 decoration-2">Create Account</Link>
              </p>
            </>
          ) : (
            <>
              <div className="mb-16">
                <button
                  onClick={() => { setStep('credentials'); setOtp('') }}
                  className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-8 block"
                >
                  ← Back
                </button>
                <h2 className="text-5xl font-black tracking-tighter uppercase mb-2">Verify.</h2>
                <p className="text-gray-400 font-medium">
                  We sent a 6-digit code to <strong className="text-black">{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-10">
                <div className="group">
                  <label className="studio-label group-focus-within:text-black transition-colors">Verification Code</label>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="studio-input text-center text-3xl font-black tracking-[0.5em]"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <button type="submit" disabled={loading || otp.length !== 6} className="studio-button w-full h-16 text-lg">
                  {loading ? 'VERIFYING...' : 'VERIFY & LOGIN'}
                </button>
              </form>

              <div className="mt-10 text-center">
                <p className="text-xs text-gray-400 mb-4">Didn't receive a code?</p>
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

        {/* Support Link */}
        <div className="absolute bottom-10 left-0 w-full text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">ShopNest @ 2026</span>
        </div>
      </div>
    </div>
  )
}

export default Login
