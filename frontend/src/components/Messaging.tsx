import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageSquare, User as UserIcon, Star, X, Loader2, Search, Inbox } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
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

interface SellerReview {
    id: string
    rating: number
    comment: string
    reviewer: { name: string; picture?: string }
    createdAt: string
}

function Messaging({ user }: { user: User }) {
    const [searchParams] = useSearchParams()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeConversation, setActiveConversation] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sendingTo, setSendingTo] = useState('')
    const [sendingToPicture, setSendingToPicture] = useState<string | undefined>()

    // Buyer seller search (inline in sidebar)
    const [sellerSearch, setSellerSearch] = useState('')
    const [sellerResults, setSellerResults] = useState<any[]>([])
    const [sellerSearchLoading, setSellerSearchLoading] = useState(false)
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Seller rating state
    const [canRateSeller, setCanRateSeller] = useState(false)
    const [showRateModal, setShowRateModal] = useState(false)
    const [showSellerReviews, setShowSellerReviews] = useState(false)
    const [sellerRating, setSellerRating] = useState(5)
    const [sellerComment, setSellerComment] = useState('')
    const [ratingSubmitting, setRatingSubmitting] = useState(false)
    const [sellerReviews, setSellerReviews] = useState<SellerReview[]>([])
    const [sellerAvgRating, setSellerAvgRating] = useState(0)
    const [reviewsLoading, setReviewsLoading] = useState(false)
    const [alreadyRated, setAlreadyRated] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const isBuyer = user.role === 'buyer'

    useEffect(() => { fetchConversations() }, [user.id])
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

    // Auto-open when coming from product page
    useEffect(() => {
        const sellerId = searchParams.get('sellerId')
        const sellerName = searchParams.get('sellerName')
        if (sellerId && sellerId !== user.id) {
            openConversation(sellerId, sellerName || 'Seller')
        }
    }, [searchParams])

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

    const openConversation = async (partnerId: string, partnerName: string, partnerPicture?: string) => {
        setActiveConversation(partnerId)
        setSendingTo(partnerName)
        setSendingToPicture(partnerPicture)
        setCanRateSeller(false)
        setSellerResults([])
        setSellerSearch('')
        try {
            const res = await fetch(`${API_URL}/api/messages/conversation/${user.id}/${partnerId}`)
            const data = await res.json()
            if (data.success) setMessages(data.messages)
        } catch {
            toast.error('Failed to load messages')
        }
        fetchConversations()
        if (isBuyer) checkCompletedTransaction(partnerId)
    }

    // Buyer: search sellers inline
    const handleSellerSearch = (q: string) => {
        setSellerSearch(q)
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
        if (q.length < 2) { setSellerResults([]); return }
        setSellerSearchLoading(true)
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/search?q=${encodeURIComponent(q)}&role=seller&exclude=${user.id}`)
                const data = await res.json()
                if (data.success) setSellerResults(data.users)
            } catch {}
            setSellerSearchLoading(false)
        }, 300)
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

    const checkCompletedTransaction = async (sellerId: string) => {
        try {
            const res = await fetch(`${API_URL}/api/orders/check-seller/${user.id}/${sellerId}`)
            const data = await res.json()
            setCanRateSeller(data.success && data.hasTransaction)
            if (data.success && data.hasTransaction) fetchSellerReviews(sellerId)
        } catch {
            setCanRateSeller(false)
        }
    }

    const fetchSellerReviews = async (sellerId: string) => {
        setReviewsLoading(true)
        try {
            const res = await fetch(`${API_URL}/api/reviews/seller/${sellerId}`)
            const data = await res.json()
            if (data.success) {
                setSellerReviews(data.reviews)
                setSellerAvgRating(data.averageRating)
                setAlreadyRated(data.reviews.some((r: any) => r.userId === user.id))
            }
        } catch {}
        setReviewsLoading(false)
    }

    const handleSubmitSellerRating = async () => {
        if (!activeConversation) return
        setRatingSubmitting(true)
        try {
            const res = await fetch(`${API_URL}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating: sellerRating,
                    comment: sellerComment,
                    userId: user.id,
                    productId: activeConversation,
                    type: 'seller'
                })
            })
            const data = await res.json()
            if (data.success) {
                toast.success('Seller rated!')
                setShowRateModal(false)
                setSellerComment('')
                setSellerRating(5)
                fetchSellerReviews(activeConversation)
            } else {
                toast.error(data.message || 'Failed to submit rating')
            }
        } catch {
            toast.error('Failed to submit rating')
        }
        setRatingSubmitting(false)
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Header — role-differentiated */}
            <div>
                <span className="studio-label text-brand-accent">
                    {isBuyer ? 'MESSAGES / SELLERS' : 'MESSAGES / BUYER INBOX'}
                </span>
                <h1 className="studio-h1 text-white leading-tight">
                    {isBuyer ? 'Message a Seller' : 'Buyer Messages'}
                </h1>
                <p className="text-gray-400 text-base mt-1">
                    {isBuyer
                        ? 'Search for a seller by name and start a conversation.'
                        : 'View and respond to messages from your buyers.'
                    }
                </p>
            </div>

            <div className="grid md:grid-cols-[300px_1fr] gap-5 h-[calc(100vh-340px)] md:h-[calc(100vh-300px)] min-h-[420px]">

                {/* ── SIDEBAR ── */}
                <div className="glass-card flex flex-col overflow-hidden">

                    {isBuyer ? (
                        /* BUYER sidebar: search sellers + conversations */
                        <>
                            <div className="p-4 border-b border-white/5 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Find a Seller</p>
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={sellerSearch}
                                        onChange={e => handleSellerSearch(e.target.value)}
                                        placeholder="Type seller name..."
                                        className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none focus:border-brand-accent transition-colors"
                                    />
                                    {sellerSearchLoading
                                        ? <Loader2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 animate-spin" />
                                        : sellerSearch && <button onClick={() => { setSellerSearch(''); setSellerResults([]) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"><X size={12} /></button>
                                    }
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {/* Seller search results */}
                                {sellerSearch.length >= 2 ? (
                                    sellerResults.length > 0 ? (
                                        <div>
                                            <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-gray-600">Sellers found</p>
                                            {sellerResults.map(s => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => openConversation(s.id, s.name, s.picture)}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 text-left ${activeConversation === s.id ? 'bg-brand-accent/5 border-l-2 border-l-brand-accent' : ''}`}
                                                >
                                                    <div className="w-9 h-9 rounded-full bg-brand-accent/20 flex items-center justify-center shrink-0 overflow-hidden">
                                                        {s.picture
                                                            ? <img src={s.picture} alt={s.name} className="w-9 h-9 object-cover" />
                                                            : <span className="text-brand-accent font-black text-sm">{s.name?.[0]?.toUpperCase()}</span>
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-bold text-sm truncate">{s.name}</p>
                                                        <p className="text-gray-500 text-xs truncate">{s.email}</p>
                                                    </div>
                                                    <Send size={12} className="text-brand-accent shrink-0" />
                                                </button>
                                            ))}
                                        </div>
                                    ) : !sellerSearchLoading ? (
                                        <div className="p-6 text-center">
                                            <p className="text-gray-600 text-xs uppercase tracking-widest">No sellers found</p>
                                        </div>
                                    ) : null
                                ) : (
                                    /* Show existing conversations when not searching */
                                    <>
                                        {conversations.length > 0 && (
                                            <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-gray-600">Recent conversations</p>
                                        )}
                                        {loading ? (
                                            <div className="p-6 text-center text-gray-600 text-xs animate-pulse">Loading...</div>
                                        ) : conversations.length === 0 ? (
                                            <div className="p-6 text-center space-y-3">
                                                <MessageSquare className="mx-auto text-white/10" size={32} />
                                                <p className="text-gray-600 text-xs uppercase tracking-widest">Search for a seller above to start chatting</p>
                                            </div>
                                        ) : conversations.map(conv => (
                                            <button
                                                key={conv.partnerId}
                                                onClick={() => openConversation(conv.partnerId, conv.partner?.name || conv.partnerId, conv.partner?.picture)}
                                                className={`w-full flex items-center gap-3 px-4 py-4 border-b border-white/5 hover:bg-white/5 transition-colors text-left ${activeConversation === conv.partnerId ? 'bg-brand-accent/5 border-l-2 border-l-brand-accent' : ''}`}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                                    {conv.partner?.picture
                                                        ? <img src={conv.partner.picture} alt="" className="w-10 h-10 object-cover rounded-full" />
                                                        : <UserIcon size={16} className="text-gray-400" />
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center gap-2">
                                                        <p className="text-white font-bold text-sm truncate">{conv.partner?.name || 'Seller'}</p>
                                                        {conv.unreadCount > 0 && (
                                                            <span className="bg-brand-accent text-black text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">{conv.unreadCount}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-500 text-xs truncate mt-0.5">{conv.lastMessage}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        /* SELLER sidebar: buyer inbox only */
                        <>
                            <div className="p-5 border-b border-white/5 flex items-center gap-3">
                                <Inbox size={16} className="text-brand-accent" />
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Buyer Inbox</p>
                                {conversations.length > 0 && (
                                    <span className="ml-auto bg-brand-accent/10 text-brand-accent text-[10px] font-black px-2 py-0.5 rounded-full border border-brand-accent/20">
                                        {conversations.length}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {loading ? (
                                    <div className="p-6 text-center text-gray-600 text-xs animate-pulse">Loading messages...</div>
                                ) : conversations.length === 0 ? (
                                    <div className="p-8 text-center space-y-3">
                                        <Inbox className="mx-auto text-white/10" size={36} />
                                        <p className="text-gray-600 text-xs uppercase tracking-widest">No buyer messages yet</p>
                                        <p className="text-gray-700 text-[10px]">Buyers will appear here when they message you</p>
                                    </div>
                                ) : conversations.map(conv => (
                                    <button
                                        key={conv.partnerId}
                                        onClick={() => openConversation(conv.partnerId, conv.partner?.name || conv.partnerId, conv.partner?.picture)}
                                        className={`w-full flex items-center gap-3 px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-colors text-left ${activeConversation === conv.partnerId ? 'bg-brand-accent/5 border-l-2 border-l-brand-accent' : ''}`}
                                    >
                                        <div className="relative">
                                            <div className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                                                {conv.partner?.picture
                                                    ? <img src={conv.partner.picture} alt="" className="w-11 h-11 object-cover rounded-full" />
                                                    : <UserIcon size={18} className="text-gray-400" />
                                                }
                                            </div>
                                            {conv.unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-brand-accent text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{conv.unreadCount}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline gap-2">
                                                <p className="text-white font-bold text-sm truncate">{conv.partner?.name || 'Buyer'}</p>
                                                {conv.lastMessageTime && (
                                                    <p className="text-gray-600 text-[10px] shrink-0">
                                                        {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-gray-500 text-xs truncate mt-0.5">{conv.lastMessage || 'No messages yet'}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* ── CHAT AREA ── */}
                <div className="glass-card flex flex-col overflow-hidden">
                    {!activeConversation ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center space-y-4 px-8">
                                <MessageSquare className="mx-auto text-white/10" size={56} />
                                <p className="text-gray-600 font-medium text-sm">
                                    {isBuyer
                                        ? 'Search for a seller on the left to start chatting'
                                        : 'Select a buyer conversation to view messages'
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Chat header */}
                            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                                    {sendingToPicture
                                        ? <img src={sendingToPicture} alt={sendingTo} className="w-10 h-10 object-cover rounded-full" />
                                        : <UserIcon size={18} className="text-gray-400" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-black truncate">{sendingTo}</p>
                                    <p className="text-gray-500 text-xs uppercase tracking-widest">
                                        {isBuyer ? 'Seller' : 'Buyer'}
                                    </p>
                                </div>

                                {/* Rate seller button — buyers only, after completed transaction */}
                                {isBuyer && canRateSeller && (
                                    <div className="flex items-center gap-3 shrink-0">
                                        {sellerAvgRating > 0 && (
                                            <button onClick={() => setShowSellerReviews(true)}
                                                className="hidden sm:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-accent transition-colors">
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(i => (
                                                        <Star key={i} size={10} className={i <= Math.round(sellerAvgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
                                                    ))}
                                                </div>
                                                <span>{sellerAvgRating.toFixed(1)}</span>
                                            </button>
                                        )}
                                        <button onClick={() => setShowRateModal(true)}
                                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border border-brand-accent/30 text-brand-accent rounded-full hover:bg-brand-accent/10 transition-colors">
                                            <Star size={11} />
                                            {alreadyRated ? 'Re-rate' : 'Rate Seller'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
                                {messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-700 text-sm text-center">
                                            {isBuyer ? `Start the conversation with ${sendingTo}` : `No messages yet from ${sendingTo}`}
                                        </p>
                                    </div>
                                ) : messages.map(msg => {
                                    const isMine = msg.senderId === user.id
                                    return (
                                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                            {!isMine && (
                                                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center shrink-0 mr-2 self-end overflow-hidden">
                                                    {sendingToPicture
                                                        ? <img src={sendingToPicture} alt="" className="w-7 h-7 object-cover rounded-full" />
                                                        : <UserIcon size={12} className="text-gray-500" />
                                                    }
                                                </div>
                                            )}
                                            <div className={`max-w-[68%] rounded-2xl px-4 py-3 ${isMine ? 'bg-brand-accent text-black rounded-tr-sm' : 'bg-white/5 border border-white/5 text-white rounded-tl-sm'}`}>
                                                <p className="text-sm font-medium">{msg.content}</p>
                                                <p className={`text-[10px] mt-1 ${isMine ? 'text-black/50' : 'text-gray-500'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={sendMessage} className="px-5 py-4 border-t border-white/5 flex gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder={isBuyer ? `Message ${sendingTo}...` : `Reply to ${sendingTo}...`}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border-brand-accent transition-colors"
                                />
                                <button type="submit" disabled={!newMessage.trim()} className="studio-button px-5 py-3 disabled:opacity-40">
                                    <Send size={16} />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            {/* Rate Seller Modal */}
            <AnimatePresence>
                {showRateModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowRateModal(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg glass-card p-8 z-[201] shadow-2xl mx-4">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-brand-accent mb-1">Rate Seller</p>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">{sendingTo}</h3>
                                    <p className="text-xs text-gray-500 mt-1">Based on your completed transaction</p>
                                </div>
                                <button onClick={() => setShowRateModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="mb-6">
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Your Rating</p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <button key={i} type="button" onClick={() => setSellerRating(i)}>
                                            <Star size={36} className={i <= sellerRating ? 'text-yellow-400 fill-yellow-400 transition-colors' : 'text-gray-600 transition-colors'} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-8">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-3">
                                    Review <span className="text-gray-600 normal-case font-medium">(optional)</span>
                                </label>
                                <textarea rows={4} value={sellerComment} onChange={e => setSellerComment(e.target.value)}
                                    placeholder="How was your experience with this seller?"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 outline-none focus:border-brand-accent transition-colors resize-none" />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowRateModal(false)} className="studio-button-ghost flex-1 h-12 text-xs uppercase tracking-widest font-black">Cancel</button>
                                <button onClick={handleSubmitSellerRating} disabled={ratingSubmitting}
                                    className="studio-button flex-1 h-12 text-xs uppercase tracking-widest font-black flex items-center justify-center gap-2">
                                    {ratingSubmitting ? <Loader2 size={16} className="animate-spin" /> : <><Star size={14} /> Submit Rating</>}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* View Seller Reviews Modal */}
            <AnimatePresence>
                {showSellerReviews && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowSellerReviews(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] glass-card p-8 z-[201] shadow-2xl mx-4 flex flex-col">
                            <div className="flex justify-between items-start mb-6 shrink-0">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-brand-accent mb-1">Seller Reviews</p>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">{sendingTo}</h3>
                                    {sellerReviews.length > 0 && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <Star key={i} size={16} className={i <= Math.round(sellerAvgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
                                                ))}
                                            </div>
                                            <span className="text-sm font-black text-brand-accent">{sellerAvgRating.toFixed(1)}</span>
                                            <span className="text-xs text-gray-500">({sellerReviews.length} {sellerReviews.length === 1 ? 'review' : 'reviews'})</span>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => setShowSellerReviews(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="overflow-y-auto flex-1 space-y-4 custom-scrollbar">
                                {reviewsLoading ? (
                                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-accent" size={32} /></div>
                                ) : sellerReviews.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Star size={40} className="text-gray-800 mx-auto mb-4" />
                                        <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No reviews yet.</p>
                                    </div>
                                ) : sellerReviews.map(review => (
                                    <div key={review.id} className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                        <div className="flex items-center gap-3 mb-3">
                                            {review.reviewer?.picture
                                                ? <img src={review.reviewer.picture} alt={review.reviewer.name} className="w-8 h-8 rounded-full object-cover" />
                                                : <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-black text-xs">{review.reviewer?.name?.[0]?.toUpperCase() || '?'}</div>
                                            }
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-wide">{review.reviewer?.name || 'Anonymous'}</p>
                                                <p className="text-[10px] text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="ml-auto flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <Star key={i} size={12} className={i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
                                                ))}
                                            </div>
                                        </div>
                                        {review.comment && <p className="text-sm text-gray-400 leading-relaxed">{review.comment}</p>}
                                    </div>
                                ))}
                            </div>
                            <div className="pt-6 mt-6 border-t border-white/10 shrink-0">
                                <button onClick={() => { setShowSellerReviews(false); setShowRateModal(true) }}
                                    className="studio-button w-full h-12 text-xs uppercase tracking-widest font-black flex items-center justify-center gap-2">
                                    <Star size={14} /> Write a Review
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default Messaging
