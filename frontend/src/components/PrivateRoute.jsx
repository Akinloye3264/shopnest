import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    // Allow employers to access seller routes
    if (role === 'seller' && (user.role === 'employer' || user.role === 'seller')) {
      return children
    }
    // Allow employees to access customer routes
    if (role === 'customer' && (user.role === 'employee' || user.role === 'customer')) {
      return children
    }
    
    if (user.role === 'seller' || user.role === 'employer') {
      return <Navigate to="/seller/dashboard" replace />
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    } else if (user.role === 'employee') {
      return <Navigate to="/jobs" replace />
    } else {
      return <Navigate to="/" replace />
    }
  }

  return children
}

export default PrivateRoute

