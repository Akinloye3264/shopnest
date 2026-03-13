import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowLeft, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import API_URL from '../config'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email')
  const [resending, setResending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      if (data.success) {
        setStep('verify')
        toast.success('Reset code sent to your email!')
      } else {
        toast.error(data.message || 'Failed to send reset code')
      }
    } catch (error) {
      toast.error('Network failure')
    }
    setLoading(false)
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length === 6) {
      setStep('reset')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Password reset successfully!')
        navigate('/login')
      } else {
        toast.error(data.message || 'Failed to reset password')
      }
    } catch (error) {
      toast.error('Network failure')
    }
    setLoading(false)
  }

  const handleResendOTP = async () => {
    setResending(true)
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('New code sent!')
      } else {
        toast.error(data.message || 'Failed to resend')
      }
    } catch {
      toast.error('Network failure')
    }
    setResending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 'email' && (
          <motion.div
            key="email-form"
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
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Reset Password</h2>
              <p className="text-gray-400 font-medium">Enter your email to receive a reset code</p>
            </div>

            <form onSubmit={handleRequestReset} className="space-y-6">
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

              <button type="submit" disabled={loading} className="studio-button w-full h-16 text-lg group">
                <span className="mr-2">{loading ? 'SENDING...' : 'SEND RESET CODE'}</span>
                {!loading && <ArrowRight className="inline group-hover:translate-x-1 transition-transform" size={20} />}
              </button>
            </form>

            <p className="mt-10 text-center text-xs font-black uppercase tracking-widest text-gray-500">
              Remember password? <Link to="/login" className="text-white hover:text-brand-accent hover:underline underline-offset-4 transition-all">Sign In</Link>
            </p>
          </motion.div>
        )}

        {step === 'verify' && (
          <motion.div
            key="verify-form"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="w-full max-w-lg glass-card p-12 text-center"
          >
            <ShieldCheck className="mx-auto text-brand-accent mb-6" size={64} />
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Enter Code</h2>
            <p className="text-gray-400 font-medium mb-10">
              We've sent a 6-digit code to <br />
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

              <button type="submit" disabled={otp.length !== 6} className="studio-button w-full h-16 text-lg">
                CONTINUE
              </button>
            </form>

            <div className="mt-10 pt-10 border-t border-white/5">
              <div className="flex justify-center space-x-8">
                <button
                  onClick={() => { setStep('email'); setOtp('') }}
                  className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white flex items-center"
                >
                  <ArrowLeft size={14} className="mr-2" /> Change Email
                </button>
                <button
                  onClick={handleResendOTP}
                  disabled={resending}
                  className="text-xs font-black uppercase tracking-widest text-brand-accent hover:underline disabled:opacity-30"
                >
                  {resending ? 'SENDING...' : 'RESEND CODE'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'reset' && (
          <motion.div
            key="reset-form"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="w-full max-w-lg glass-card p-8 lg:p-12 relative overflow-hidden"
          >
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">New Password</h2>
              <p className="text-gray-400 font-medium">Enter your new password</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="studio-label ml-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-accent transition-colors" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="studio-input studio-input-with-icon pr-14 font-medium"
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="studio-button w-full h-16 text-lg group">
                <span className="mr-2">{loading ? 'RESETTING...' : 'RESET PASSWORD'}</span>
                {!loading && <ArrowRight className="inline group-hover:translate-x-1 transition-transform" size={20} />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ForgotPassword
