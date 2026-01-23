import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    fetchSellers()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/admin/dashboard')
      setStats(response.data.data)
    } catch (error) {
      toast.error('Error fetching dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchSellers = async () => {
    try {
      const response = await api.get('/api/admin/sellers')
      setSellers(response.data.data)
    } catch (error) {
      console.error('Error fetching sellers:', error)
    }
  }

  const handleApprove = async (sellerId) => {
    try {
      await api.patch(`/api/admin/sellers/${sellerId}/approve`)
      toast.success('Seller approved successfully')
      fetchSellers()
    } catch (error) {
      toast.error('Error approving seller')
    }
  }

  const handleSuspend = async (sellerId) => {
    try {
      await api.patch(`/api/admin/sellers/${sellerId}/suspend`)
      toast.success('Seller suspended successfully')
      fetchSellers()
    } catch (error) {
      toast.error('Error suspending seller')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Platform overview and management</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <p className="text-sm text-gray-600 mb-2">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.users?.total || 0}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {stats?.users?.sellers || 0} sellers, {stats?.users?.customers || 0} customers
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600 mb-2">Total Stores</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.stores || 0}</p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600 mb-2">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.products || 0}</p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-primary-600">{formatCurrency(stats?.revenue || 0)}</p>
                <p className="text-sm text-gray-500 mt-2">{stats?.orders || 0} orders</p>
              </div>
            </div>

            {/* Sellers Table */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sellers</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sellers.map((seller) => (
                      <tr key={seller.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{seller.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{seller.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{seller.storeName || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          {seller.isSuspended ? (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Suspended</span>
                          ) : seller.isApproved ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Approved</span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            {!seller.isApproved && (
                              <button
                                onClick={() => handleApprove(seller.id)}
                                className="text-green-600 hover:text-green-800 font-medium"
                              >
                                Approve
                              </button>
                            )}
                            {!seller.isSuspended && (
                              <button
                                onClick={() => handleSuspend(seller.id)}
                                className="text-red-600 hover:text-red-800 font-medium"
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard

