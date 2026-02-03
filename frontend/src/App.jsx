import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import ScrollToTop from './components/ScrollToTop'

// Pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import SellerDashboard from './pages/seller/Dashboard'
import SellerProducts from './pages/seller/Products'
import SellerOrders from './pages/seller/Orders'
import SellerAnalytics from './pages/seller/Analytics'
import AdminDashboard from './pages/admin/Dashboard'
import CustomerProducts from './pages/customer/Products'
import Cart from './pages/customer/Cart'
// import Checkout from './pages/customer/Checkout'
import Orders from './pages/customer/Orders'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import JobList from './pages/jobs/JobList'
import JobDetail from './pages/jobs/JobDetail'
import PostJob from './pages/jobs/PostJob'
import RecommendedJobs from './pages/jobs/RecommendedJobs'
import EmployerDashboard from './pages/jobs/EmployerDashboard'
import JobSeekerDashboard from './pages/jobs/JobSeekerDashboard'
import Messages from './pages/messages/Messages'
import Notifications from './pages/notifications/Notifications'
import LearningResources from './pages/learning/LearningResources'
import LearningResourceDetail from './pages/learning/LearningResourceDetail'
import Profile from './pages/profile/Profile'

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<PrivateRoute><CustomerProducts /></PrivateRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/learning" element={<LearningResources />} />
            <Route path="/learning/:id" element={<LearningResourceDetail />} />
            
            {/* Customer Routes */}
            <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
            {/* <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} /> */}
            <Route path="/my-orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
            
            {/* Employee Routes */}
            <Route path="/jobs/recommended" element={<PrivateRoute role="employee"><RecommendedJobs /></PrivateRoute>} />
            <Route path="/jobs/seeker-dashboard" element={<PrivateRoute role="employee"><JobSeekerDashboard /></PrivateRoute>} />
            
            {/* Employer Routes */}
            <Route path="/jobs/post" element={<PrivateRoute role="employer"><PostJob /></PrivateRoute>} />
            <Route path="/jobs/employer-dashboard" element={<PrivateRoute role="employer"><EmployerDashboard /></PrivateRoute>} />
            
            {/* Seller Routes */}
            <Route path="/seller/dashboard" element={<PrivateRoute role="seller"><SellerDashboard /></PrivateRoute>} />
            <Route path="/seller/products" element={<PrivateRoute role="seller"><SellerProducts /></PrivateRoute>} />
            <Route path="/seller/orders" element={<PrivateRoute role="seller"><SellerOrders /></PrivateRoute>} />
            <Route path="/seller/analytics" element={<PrivateRoute role="seller"><SellerAnalytics /></PrivateRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

