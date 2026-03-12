import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageSquare, User as UserIcon, Inbox } from 'lucide-react'
import toast from 'react-hot-toast'
import API_URL from '../config'

interface User { id: string; name?: string; email: string; role: string }

interface Conversation {
    partnerId: string
    partner: { id: string; name: string; picture?: string }
    lastMessage: string
    lastMessageTime: string
    unreadCount: number
}

interface Message {
    id: string
    senderId: string
    receiverId: string
    content: string
    createdAt: string
    sender: { name: string; picture?: string }
    receiver: { name: string; picture?: string }
}

function Messaging({ user }: { user: User }) {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeConversation, setActiveConversation] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sendingTo, setSendingTo] = useState('')
    const [newMessageModal, setNewMessageModal] = useState(false)
    const [recipientId, setRecipientId] = useState('')
    const [recipientEmail, setRecipientEmail] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => { fetchConversations() }, [user.id])
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

    const fetchConversations = async () => {
        try {
            const res = await fetch(`${API_URL}/api/messages/inbox/${user.id}`)
            const data = await res.json()
            if (data.success) setConversations(data.conversations)
        } catch {
            toast.error('Failed to load conversations')
        } finally {
            setLoading(false)
        }
    }

    const openConversation = async (partnerId: string, partnerName: string) => {
        setActiveConversation(partnerId)
        setSendingTo(partnerName)
        try {
            const res = await fetch(`${API_URL}/api/messages/conversation/${user.id}/${partnerId}`)
            const data = await res.json()
            if (data.success) setMessages(data.messages)
        } catch {
            toast.error('Failed to load messages')
        }
        fetchConversations() // refresh unread
    }

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !activeConversation) return
        try {
            const res = await fetch(`${API_URL}/api/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senderId: user.id, receiverId: activeConversation, content: newMessage.trim() })
            })
            const data = await res.json()
            if (data.success) {
                setMessages(prev => [...prev, data.message])
                setNewMessage('')
                fetchConversations()
            }
        } catch {
            toast.error('Failed to send message')
        }
    }

    const startNewConversation = async () => {
        if (!recipientId.trim()) return toast.error('Please enter a recipient User ID')
        await openConversation(recipientId, recipientEmail || recipientId)
        setNewMessageModal(false)
        setRecipientId('')
        setRecipientEmail('')
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex justify-between items-start pt-15 mt-10">
                <div>
                    <span className="studio-label text-brand-accent">COMMUNICATIONS</span>
                    <h1 className="studio-h1 text-white leading-tight">Messages</h1>
                </div>
                <button onClick={() => setNewMessageModal(true)} className="studio-button px-8 flex items-center gap-2">
                    <Send size={16} /> New Message
                </button>
            </div>

            <div className="grid md:grid-cols-[320px_1fr] gap-6 h-[calc(100vh-280px)] min-h-[500px]">
                {/* Conversations sidebar */}
                <div className="glass-card overflow-y-auto custom-scrollbar">
                    <div className="p-6 border-b border-white/5">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-500">Conversations</p>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-600 text-sm animate-pulse">Loading...</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center space-y-4">
                            <Inbox className="mx-auto text-white/10" size={40} />
                            <p className="text-gray-600 text-sm">No conversations yet</p>
                        </div>
                    ) : (
                        <div>
                            {conversations.map(conv => (
                                <div
                                    key={conv.partnerId}
                                    onClick={() => openConversation(conv.partnerId, conv.partner?.name || conv.partnerId)}
                                    className={`p-5 border-b border-white/5 cursor-pointer hover:bg-white/3 transition-colors ${activeConversation === conv.partnerId ? 'bg-brand-accent/5 border-l-2 border-l-brand-accent' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                            {conv.partner?.picture
                                                ? <img src={conv.partner.picture} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                : <UserIcon size={18} className="text-gray-400" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <p className="text-white font-bold text-sm truncate">{conv.partner?.name || 'User'}</p>
                                                {conv.unreadCount > 0 && (
                                                    <span className="bg-brand-accent text-black text-xs font-black px-2 py-0.5 rounded-full ml-2 shrink-0">{conv.unreadCount}</span>
                                                )}
                                            </div>
                                            <p className="text-gray-500 text-xs truncate mt-0.5">{conv.lastMessage}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Chat area */}
                <div className="glass-card flex flex-col">
                    {!activeConversation ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <MessageSquare className="mx-auto text-white/10" size={56} />
                                <p className="text-gray-600 font-medium">Select a conversation or start a new one</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-6 border-b border-white/5 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                    <UserIcon size={18} className="text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-white font-black">{sendingTo}</p>
                                    <p className="text-gray-500 text-xs uppercase tracking-widest">Active conversation</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                {messages.map(msg => {
                                    const isMine = msg.senderId === user.id
                                    return (
                                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${isMine ? 'bg-brand-accent text-black rounded-tr-sm' : 'bg-white/5 border border-white/5 text-white rounded-tl-sm'}`}>
                                                <p className="text-sm font-medium">{msg.content}</p>
                                                <p className={`text-xs mt-1.5 ${isMine ? 'text-black/50' : 'text-gray-500'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={sendMessage} className="p-6 border-t border-white/5 flex gap-4">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white placeholder:text-gray-600 outline-none focus:border-brand-accent transition-colors"
                                />
                                <button type="submit" className="studio-button px-6">
                                    <Send size={18} />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            {/* New Message Modal */}
            <AnimatePresence>
                {newMessageModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card p-10 w-full max-w-md space-y-8">
                            <h3 className="text-2xl font-black text-white">New Conversation</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Recipient User ID</label>
                                    <input
                                        type="text"
                                        value={recipientId}
                                        onChange={e => setRecipientId(e.target.value)}
                                        placeholder="Paste User ID here..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white placeholder:text-gray-600 outline-none focus:border-brand-accent transition-colors font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Name (optional)</label>
                                    <input
                                        type="text"
                                        value={recipientEmail}
                                        onChange={e => setRecipientEmail(e.target.value)}
                                        placeholder="Display name..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white placeholder:text-gray-600 outline-none focus:border-brand-accent transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={startNewConversation} className="studio-button flex-1">Start Chat</button>
                                <button onClick={() => setNewMessageModal(false)} className="studio-button-ghost flex-1">Cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default Messaging
