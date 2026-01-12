import Navbar from '../../components/Navbar'

const SellerAnalytics = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">View your sales and performance metrics</p>
        </div>
        <div className="card">
          <p className="text-gray-600">Analytics dashboard coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default SellerAnalytics

