import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp, ShoppingBag, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import API_URL from '../config'

interface User { id: string; name?: string; email: string; role: string }

interface OrderItem {
    id: string
    quantity: number
    price: number
    productId?: string
    product: { title: string; image: string; price: number }
}

interface Order {
    id: string
    totalAmount: number
    status: string
    createdAt: string
    shippingAddress?: string
    items: OrderItem[]
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    paid: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    processing: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    shipped: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
    delivered: 'text-green-400 border-green-400/30 bg-green-400/10',
    cancelled: 'text-red-400 border-red-400/30 bg-red-400/10'
}

const STATUS_ICONS: Record<string, React.ElementType> = {
    pending: Clock,
    paid: CheckCircle,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle
}

function Orders({ user }: { user: User }) {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
    const [reviewModal, setReviewModal] = useState<{ productId: string; title: string } | null>(null)
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')

    useEffect(() => {
        fetchOrders()
        // Check for success param on mount
        const params = new URLSearchParams(window.location.search)
        if (params.get('status') === 'success') {
            toast.success('Payment successful! Your order has been placed.')
        } else if (params.get('status') === 'cancel') {
            toast.error('Payment was cancelled.')
        }
    }, [user.id])

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/api/orders/user/${user.id}`)
            const data = await res.json()
            if (data.success) setOrders(data.orders)
        } catch {
            toast.error('Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    const cancelOrder = async (orderId: string) => {
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, { method: 'POST' })
            const data = await res.json()
            if (data.success) {
                toast.success('Order cancelled')
                fetchOrders()
            } else {
                toast.error(data.message)
            }
        } catch {
            toast.error('Failed to cancel order')
        }
    }

    const submitReview = async () => {
        if (!reviewModal) return
        try {
            const res = await fetch(`${API_URL}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment, userId: user.id, productId: reviewModal.productId, type: 'product' })
            })
            const data = await res.json()
            if (data.success) {
                toast.success('Review submitted!')
                setReviewModal(null)
                setRating(5)
                setComment('')
            } else {
                toast.error(data.message)
            }
        } catch {
            toast.error('Failed to submit review')
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-white/20 text-xl font-black uppercase tracking-widest animate-pulse">Loading orders...</div>
        </div>
    )

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div>
                <span className="studio-label text-brand-accent">MY ORDERS</span>
                <h1 className="studio-h1 text-white leading-tight">Order History</h1>
                <p className="text-gray-400 text-lg mt-2">Track your purchases and order status</p>
            </div>

            {orders.length === 0 ? (
                <div className="glass-card p-20 text-center space-y-6">
                    <ShoppingBag className="mx-auto text-white/10" size={64} />
                    <h3 className="text-3xl font-black text-white/20 uppercase">No orders yet</h3>
                    <p className="text-gray-600">Visit the marketplace to make your first purchase.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => {
                        const StatusIcon = STATUS_ICONS[order.status] || Package
                        const isExpanded = expandedOrder === order.id
                        return (
                            <motion.div key={order.id} layout className="glass-card overflow-hidden">
                                <div
                                    className="p-8 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-white/2 transition-colors"
                                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                >
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-500">Order ID</p>
                                        <p className="font-mono text-white text-sm">{order.id.substring(0, 18)}...</p>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-500">Date</p>
                                        <p className="text-white font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-500">Total</p>
                                        <p className="text-white font-black text-xl">${parseFloat(String(order.totalAmount)).toFixed(2)}</p>
                                    </div>

                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-black uppercase tracking-wider ${STATUS_COLORS[order.status]}`}>
                                        <StatusIcon size={14} />
                                        {order.status}
                                    </div>

                                    {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-white/5"
                                        >
                                            <div className="p-8 space-y-6">
                                                {order.items?.length > 0 ? (
                                                    <div className="space-y-4">
                                                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Items</h4>
                                                        {order.items.map(item => (
                                                            <div key={item.id} className="flex items-center gap-6 p-4 bg-white/3 rounded-xl">
                                                                {item.product?.image && (
                                                                    <img src={item.product.image} alt={item.product?.title} className="w-16 h-16 rounded-lg object-cover" />
                                                                )}
                                                                <div className="flex-1">
                                                                    <p className="text-white font-bold">{item.product?.title || 'Product'}</p>
                                                                    <p className="text-gray-400 text-sm">Qty: {item.quantity} × ${parseFloat(String(item.price)).toFixed(2)}</p>
                                                                </div>
                                                                {order.status === 'delivered' && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setReviewModal({ productId: item.productId || item.id, title: item.product?.title || '' }) }}
                                                                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-accent border border-brand-accent/30 px-4 py-2 rounded-full hover:bg-brand-accent/10 transition-colors"
                                                                    >
                                                                        <Star size={12} /> Review
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-600 text-sm">No item details found.</p>
                                                )}

                                                {order.shippingAddress && (
                                                    <div>
                                                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Shipping Address</h4>
                                                        <p className="text-gray-300">{order.shippingAddress}</p>
                                                    </div>
                                                )}

                                                {['pending', 'paid', 'processing'].includes(order.status) && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); cancelOrder(order.id) }}
                                                        className="text-xs font-black uppercase tracking-widest text-red-400 border border-red-400/30 px-6 py-2 rounded-full hover:bg-red-400/10 transition-colors"
                                                    >
                                                        Cancel Order
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* Review Modal */}
            <AnimatePresence>
                {reviewModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card p-10 w-full max-w-lg space-y-8">
                            <div>
                                <h3 className="text-2xl font-black text-white">Leave a Review</h3>
                                <p className="text-gray-400 text-sm mt-1">{reviewModal.title}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Rating</label>
                                <div className="flex gap-3">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star} onClick={() => setRating(star)}>
                                            <Star size={28} className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Comment (optional)</label>
                                <textarea
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    rows={4}
                                    placeholder="Share your experience..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 outline-none focus:border-brand-accent transition-colors resize-none"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button onClick={submitReview} className="studio-button flex-1">Submit Review</button>
                                <button onClick={() => setReviewModal(null)} className="studio-button-ghost flex-1">Cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default Orders
