import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface AuthCallbackProps {
  onLogin: (user: any) => void
}

function AuthCallback({ onLogin }: AuthCallbackProps) {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      const userStr = urlParams.get('user')

      if (token && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr))

          // Store in localStorage
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          localStorage.setItem('userRole', user.role)

          // Update App state directly
          onLogin(user)

          // Navigate to dashboard
          navigate('/dashboard')
        } catch (error) {
          console.error('Error parsing user data:', error)
          navigate('/login')
        }
      } else {
        // Check for error in URL
        const error = urlParams.get('error')
        if (error) {
          console.error('OAuth error:', error)
          navigate('/login')
        } else {
          navigate('/login')
        }
      }
    }

    handleCallback()
  }, [navigate, onLogin])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white relative">
      <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-secondary blur-[120px] rounded-full"></div>
      </div>
      <div className="text-center radiant-card p-12 bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary mx-auto mb-8"></div>
        <h2 className="text-2xl font-black uppercase tracking-tight">Authenticating...</h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-4">Connecting to ShopNest ecosystem</p>
      </div>
    </div>
  )
}

export default AuthCallback
