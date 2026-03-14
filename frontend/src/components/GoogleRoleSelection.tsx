import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ShoppingCart, Store, Briefcase, Building2, Users, ArrowRight } from 'lucide-react'
import API_URL from '../config'

interface GoogleRoleSelectionProps {
  onLogin: (user: any) => void
}

const roles = [
  {
    value: 'buyer',
    label: 'Commerce',
    sublabel: 'Buyer',
    description: 'Shop products and place orders',
    icon: ShoppingCart,
  },
  {
    value: 'seller',
    label: 'Enterprise',
    sublabel: 'Seller',
    description: 'List and sell your products',
    icon: Store,
  },
  {
    value: 'job_seeker',
    label: 'Talent',
    sublabel: 'Job Seeker',
    description: 'Find job opportunities',
    icon: Briefcase,
  },
  {
    value: 'employer',
    label: 'Organization',
    sublabel: 'Employer',
    description: 'Post jobs and hire talent',
    icon: Building2,
  },
  {
    value: 'employee',
    label: 'Team Member',
    sublabel: 'Employee',
    description: 'Collaborate within your organization',
    icon: Users,
  },
]

function GoogleRoleSelection({ onLogin }: GoogleRoleSelectionProps) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    if (!selected || !token) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/api/google-auth/complete-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, role: selected }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('userRole', data.user.role)
      onLogin(data.user)
      navigate('/dashboard')
    } catch {
      setError('Connection failed. Please try again.')
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-400 font-bold uppercase tracking-widest text-sm">Invalid or missing setup link.</p>
          <button onClick={() => navigate('/register')} className="studio-button mt-8 px-12">Back to Register</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-secondary blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-xl">
        <div className="radiant-card p-12">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">One quick thing</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
              How will you use ShopNest?
            </p>
          </div>

          <div className="space-y-3 mb-10">
            {roles.map(({ value, label, sublabel, description, icon: Icon }) => {
              const active = selected === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelected(value)}
                  className={`w-full flex items-center gap-5 px-6 py-5 rounded-2xl border-2 transition-all text-left
                    ${active
                      ? 'border-brand-accent bg-brand-accent/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30 hover:text-white'
                    }`}
                >
                  <div className={`p-3 rounded-xl ${active ? 'bg-brand-accent text-black' : 'bg-white/10'}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-black uppercase tracking-tight text-base">{label}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-brand-accent' : 'text-gray-500'}`}>
                        {sublabel}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all
                    ${active ? 'border-brand-accent bg-brand-accent' : 'border-white/20'}`}
                  />
                </button>
              )
            })}
          </div>

          {error && (
            <p className="text-red-400 text-xs font-bold uppercase tracking-widest text-center mb-6">{error}</p>
          )}

          <button
            onClick={handleConfirm}
            disabled={!selected || loading}
            className="studio-button w-full h-16 text-lg group disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="mr-2">{loading ? 'Setting up...' : 'Continue'}</span>
            {!loading && <ArrowRight className="inline group-hover:translate-x-1 transition-transform" size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GoogleRoleSelection
