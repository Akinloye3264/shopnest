import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navbar />
      
      {/* Hero Section with Animation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6 animate-fade-in">
            Empower Your Business with
            <span className="text-primary-600 animate-pulse"> ShopNest</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in-delay">
            Your all-in-one platform for e-commerce, job opportunities, and business growth. Perfect for entrepreneurs, job seekers, and recruiters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-primary text-lg px-8 py-3 transform hover:scale-105 transition-transform duration-200">
                  Get Started Free
                </Link>
                <Link to="/products" className="btn btn-outline text-lg px-8 py-3 transform hover:scale-105 transition-transform duration-200">
                  Browse Products
                </Link>
                <Link to="/jobs" className="btn btn-outline text-lg px-8 py-3 transform hover:scale-105 transition-transform duration-200">
                  Find Jobs
                </Link>
              </>
            ) : (
              <>
                {user.role === 'seller' || user.role === 'employer' ? (
                  <Link to="/seller/dashboard" className="btn btn-primary text-lg px-8 py-3 transform hover:scale-105 transition-transform duration-200">
                    Go to Dashboard
                  </Link>
                ) : user.role === 'employee' ? (
                  <Link to="/jobs" className="btn btn-primary text-lg px-8 py-3 transform hover:scale-105 transition-transform duration-200">
                    Browse Jobs
                  </Link>
                ) : (
                  <Link to="/products" className="btn btn-primary text-lg px-8 py-3 transform hover:scale-105 transition-transform duration-200">
                    Shop Now
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section with Animation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            All-in-one platform designed for businesses, job seekers, and entrepreneurs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* E-commerce Features */}
          <div className="card text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Store Setup</h3>
            <p className="text-gray-600">
              Create your online shop in minutes with our simple setup process
            </p>
          </div>

          <div className="card text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
              <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sales Analytics</h3>
            <p className="text-gray-600">
              Track your sales with daily, weekly, and monthly analytics
            </p>
          </div>

          <div className="card text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Seamless Payments</h3>
            <p className="text-gray-600">
              Accept payments via Paystack and Flutterwave with multiple options
            </p>
          </div>

          {/* Job Features */}
          <div className="card text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Job Opportunities</h3>
            <p className="text-gray-600">
              Find jobs or recruit talent with our intelligent job matching system
            </p>
          </div>

          <div className="card text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Job Matching</h3>
            <p className="text-gray-600">
              Get matched to jobs based on your skills and experience
            </p>
          </div>

          <div className="card text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">In-App Messaging</h3>
            <p className="text-gray-600">
              Communicate directly with employers, employees, and customers
            </p>
          </div>

          {/* Learning & Growth */}
          <div className="card text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Learning Center</h3>
            <p className="text-gray-600">
              Access resources on entrepreneurship, digital skills, and financial literacy
            </p>
          </div>

          <div className="card text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Notifications</h3>
            <p className="text-gray-600">
              Stay updated on job applications, orders, messages, and more
            </p>
          </div>

          <div className="card text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
              <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Marketing Tools</h3>
            <p className="text-gray-600">
              Create discount codes and feature products to boost sales
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white rounded-2xl shadow-lg my-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            About ShopNest
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            ShopNest is a comprehensive job-centric e-commerce platform designed to empower businesses, job seekers, and entrepreneurs in emerging markets.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Job Opportunities & Recruitment</h3>
                <p className="text-gray-600">
                  Connect job seekers with employers through our intelligent matching system. Post jobs, apply for positions, and track applications all in one place.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Task-Based Income Generation</h3>
                <p className="text-gray-600">
                  Youth can earn income through task-based payments and commissions. No startup capital required for unemployed graduates to access opportunities.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">E-Commerce Marketplace</h3>
                <p className="text-gray-600">
                  Complete marketplace functionality with product listings, category browsing, search filters, secure transactions, and order tracking.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Learning & Development</h3>
                <p className="text-gray-600">
                  Access entrepreneurship resources, digital skills training, financial literacy content, and market insights to grow your business.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Communication Hub</h3>
                <p className="text-gray-600">
                  In-app messaging system for direct communication between buyers, sellers, job seekers, and employers. Real-time notifications keep you updated.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
                <p className="text-gray-600">
                  Your data and transactions are protected with industry-standard security measures. Built for reliability and scalability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Animation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-12 text-center text-white transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of entrepreneurs, job seekers, and businesses already on ShopNest
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3 inline-block transform hover:scale-105 transition-transform duration-200">
                Get Started Free
              </Link>
              <Link to="/jobs" className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3 inline-block transform hover:scale-105 transition-transform duration-200">
                Explore Jobs
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
