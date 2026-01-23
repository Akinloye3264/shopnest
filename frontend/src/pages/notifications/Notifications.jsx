import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications')
      setNotifications(response.data.data || [])
      setUnreadCount(response.data.unreadCount || 0)
    } catch (error) {
      toast.error('Error fetching notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`)
      fetchNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/read-all')
      fetchNotifications()
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Error updating notifications')
    }
  }

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`)
      fetchNotifications()
    } catch (error) {
      toast.error('Error deleting notification')
    }
  }

  const getNotificationIcon = (type) => {
    const icons = {
      job_posted: '📢',
      job_application: '📝',
      job_application_status: '✅',
      new_message: '💬',
      order_update: '📦',
      product_update: '🛍️',
      system_announcement: '📢',
      task_assigned: '📋',
      payment_received: '💰',
      earning_update: '💵'
    }
    return icons[type] || '🔔'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-gray-600 mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn btn-outline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`card cursor-pointer hover:shadow-md transition-shadow ${
                  !notification.isRead ? 'bg-blue-50 border-l-4 border-primary-600' : ''
                }`}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsRead(notification.id)
                  }
                  if (notification.actionUrl) {
                    window.location.href = notification.actionUrl
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                      <p className="text-gray-700">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
