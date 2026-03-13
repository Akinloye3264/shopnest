import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User as UserIcon, Mail, Phone, Lock, Eye, EyeOff, Save, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import API_URL from '../config'

interface User {
  id: string
  name?: string
  email: string
  role: string
  picture?: string
}

function Profile({ user, onUpdate }: { user: User; onUpdate: (updated: User) => void }) {
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isGoogleUser, setIsGoogleUser] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/auth/profile/${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setName(data.user.name || '')
          setEmail(data.user.email)
          setPhone(data.user.phone || '')
          setIsGoogleUser(!!data.user.googleId)
        }
      })
      .catch(() => {})
  }, [user.id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const body: Record<string, string> = { name, email, phone }
      if (newPassword) {
        body.currentPassword = currentPassword
        body.newPassword = newPassword
      }

      const res = await fetch(`${API_URL}/api/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Profile updated!')
        const updated = { ...user, name: data.user.name, email: data.user.email }
        localStorage.setItem('user', JSON.stringify(updated))
        onUpdate(updated)
        setCurrentPassword('')
        setNewPassword('')
      } else {
        toast.error(data.message || 'Update failed')
      }
    } catch {
      toast.error('Connection error')
    }
    setLoading(false)
  }

  const roleLabel: Record<string, string> = {
    buyer: 'Buyer',
    seller: 'Seller',
    job_seeker: 'Job Seeker',
    employer: 'Employer',
    employee: 'Employee',
    admin: 'Admin'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-10"
    >
      <div>
        <span className="studio-label text-brand-accent">ACCOUNT / PROFILE</span>
        <h1 className="studio-h1 leading-tight text-white">Your Profile</h1>
        <p className="text-gray-400 font-medium">Update your name, email, phone number or password.</p>
      </div>

      {/* Avatar + role badge */}
      <div className="glass-card p-8 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-brand-accent/10 border-2 border-brand-accent/30 flex items-center justify-center overflow-hidden shrink-0">
          {user.picture
            ? <img src={user.picture} alt="avatar" className="w-full h-full object-cover" />
            : <UserIcon size={36} className="text-brand-accent" />
          }
        </div>
        <div>
          <p className="text-2xl font-black text-white">{name || user.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/30 text-brand-accent">
              {roleLabel[user.role] || user.role}
            </span>
            {isGoogleUser && (
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                Google Account
              </span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass-card p-10 space-y-8">
        {/* Name */}
        <div className="space-y-2">
          <label className="studio-label">Full Name</label>
          <div className="relative group">
            <UserIcon className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-accent transition-colors" size={18} />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="studio-input studio-input-with-icon font-medium"
              placeholder="Your full name"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="studio-label">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-accent transition-colors" size={18} />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`studio-input studio-input-with-icon font-medium ${isGoogleUser ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="your@email.com"
              readOnly={isGoogleUser}
            />
          </div>
          {isGoogleUser && <p className="text-xs text-gray-500 ml-1">Email is managed by Google and can't be changed here.</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="studio-label">Phone Number</label>
          <div className="relative group">
            <Phone className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-accent transition-colors" size={18} />
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="studio-input studio-input-with-icon font-medium"
              placeholder="+234 000 000 0000"
            />
          </div>
        </div>

        {/* Password change — only for non-Google */}
        {!isGoogleUser && (
          <div className="space-y-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-brand-accent" />
              <p className="text-sm font-black uppercase tracking-widest text-gray-400">Change Password</p>
            </div>
            <p className="text-xs text-gray-500">Leave these blank if you don't want to change your password.</p>

            <div className="space-y-2">
              <label className="studio-label">Current Password</label>
              <div className="relative group">
                <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-accent transition-colors" size={18} />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="studio-input studio-input-with-icon pr-14 font-medium"
                  placeholder="Your current password"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="studio-label">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-accent transition-colors" size={18} />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="studio-input studio-input-with-icon pr-14 font-medium"
                  placeholder="New password"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} className="studio-button w-full h-14 flex items-center justify-center gap-3 text-sm font-black">
          <Save size={16} />
          {loading ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </form>
    </motion.div>
  )
}

export default Profile
