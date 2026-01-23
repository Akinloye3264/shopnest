import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../utils/api'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const conversationWith = searchParams.get('conversationWith')
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchConversations()
    if (conversationWith) {
      setSelectedConversation(parseInt(conversationWith))
      fetchMessages(parseInt(conversationWith))
    }
  }, [conversationWith])

  const fetchConversations = async () => {
    try {
      const response = await api.get('/api/messages/conversations')
      setConversations(response.data.data || [])
    } catch (error) {
      toast.error('Error fetching conversations')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (userId) => {
    try {
      const response = await api.get(`/api/messages?conversationWith=${userId}`)
      setMessages(response.data.data || [])
      
      // Mark messages as read
      const unreadIds = response.data.data
        .filter(m => !m.isRead && m.receiverId === user.id)
        .map(m => m.id)
      
      if (unreadIds.length > 0) {
        await Promise.all(
          unreadIds.map(id => api.patch(`/api/messages/${id}/read`))
        )
      }
    } catch (error) {
      toast.error('Error fetching messages')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      const response = await api.post('/api/messages', {
        receiverId: selectedConversation,
        content: newMessage
      })

      if (response.data.success) {
        setNewMessage('')
        fetchMessages(selectedConversation)
        fetchConversations() // Refresh to update unread counts
      }
    } catch (error) {
      toast.error('Error sending message')
    } finally {
      setSending(false)
    }
  }

  const selectConversation = (partnerId) => {
    setSelectedConversation(partnerId)
    setSearchParams({ conversationWith: partnerId })
    fetchMessages(partnerId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Messages</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversations</h2>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : conversations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No conversations yet</p>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.partner.id}
                      onClick={() => selectConversation(conv.partner.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedConversation === conv.partner.id
                          ? 'bg-primary-50 border-2 border-primary-500'
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {conv.partner.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{conv.partner.name}</p>
                            {conv.latestMessage && (
                              <p className="text-sm text-gray-500 truncate max-w-[150px]">
                                {conv.latestMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="bg-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="card flex flex-col h-[600px]">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.senderId === user.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === user.id ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="btn btn-primary"
                  >
                    Send
                  </button>
                </form>
              </div>
            ) : (
              <div className="card text-center py-12">
                <p className="text-gray-500">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Messages
