import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Package, Briefcase, FileText, ShoppingCart, Star, DollarSign, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import API_URL from '../config'

interface User { id: string; name?: string; email: string; role: string }

interface Stats {
    totalUsers: number
    totalProducts: number
    totalJobs: number
    totalApplications: number
    totalOrders: number
    totalReviews: number
    totalRevenue: number
    usersByRole: { role: string; count: string }[]
    ordersByStatus: { status: string; count: string }[]
}

interface AdminUser {
    id: string
    name: string
    email: string
    role: string
    isVerified: boolean
    createdAt: string
}

const ROLES = ['buyer', 'seller', 'job_seeker', 'employer', 'employee', 'admin']

function AdminPanel({ user }: { user: User }) {
    const [stats, setStats] = useState<Stats | null>(null)
    const [users, setUsers] = useState<AdminUser[]>([])
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'orders'>('overview')
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('')

    useEffect(() => { fetchStats(); fetchUsers() }, [])

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/stats`)
            const data = await res.json()
            if (data.success) setStats(data.stats)
        } catch {
            toast.error('Failed to load stats')
        } finally {
            setLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams()
            if (searchQuery) params.append('search', searchQuery)
            if (roleFilter) params.append('role', roleFilter)
            const res = await fetch(`${API_URL}/api/admin/users?${params}`)
            const data = await res.json()
            if (data.success) setUsers(data.users)
        } catch {
            toast.error('Failed to load users')
        }
    }

    const updateUserRole = async (userId: string, newRole: string) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            })
            const data = await res.json()
            if (data.success) {
                toast.success('User role updated')
                fetchUsers()
            } else toast.error(data.message)
        } catch {
            toast.error('Failed to update role')
        }
    }

    const deleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return
        try {
            const res = await fetch(`${API_URL}/api/admin/users/${userId}`, { method: 'DELETE' })
            const data = await res.json()
            if (data.success) { toast.success('User deleted'); fetchUsers() }
            else toast.error(data.message)
        } catch {
            toast.error('Failed to delete user')
        }
    }

    if (user.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                    <p className="text-red-400 text-xl font-black uppercase tracking-widest">Access Denied</p>
                    <p className="text-gray-500">Admin privileges required.</p>
                </div>
            </div>
        )
    }

    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users, color: 'text-blue-400' },
        { label: 'Products', value: stats?.totalProducts ?? '—', icon: Package, color: 'text-purple-400' },
        { label: 'Jobs Posted', value: stats?.totalJobs ?? '—', icon: Briefcase, color: 'text-orange-400' },
        { label: 'Applications', value: stats?.totalApplications ?? '—', icon: FileText, color: 'text-yellow-400' },
        { label: 'Orders', value: stats?.totalOrders ?? '—', icon: ShoppingCart, color: 'text-green-400' },
        { label: 'Reviews', value: stats?.totalReviews ?? '—', icon: Star, color: 'text-pink-400' },
        { label: 'Revenue (USD)', value: stats ? `$${stats.totalRevenue.toLocaleString()}` : '—', icon: DollarSign, color: 'text-brand-accent' },
    ]

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div>
                <span className="studio-label text-brand-accent">ADMINISTRATION</span>
                <h1 className="studio-h1 text-white leading-tight">Admin Dashboard</h1>
                <p className="text-gray-400 mt-2">Platform analytics and management</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/3 rounded-xl p-1 w-fit">
                {(['overview', 'users', 'orders'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); if (tab === 'users') fetchUsers() }}
                        className={`px-8 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-brand-accent text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-12">
                    {loading ? (
                        <div className="text-gray-600 animate-pulse text-center py-20 font-black uppercase tracking-widest">Loading analytics...</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {statCards.map((card, i) => (
                                    <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-8 space-y-4">
                                        <card.icon className={card.color} size={24} />
                                        <div className="text-4xl font-black text-white">{card.value}</div>
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-500">{card.label}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {stats && (
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="glass-card p-8 space-y-6">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Users by Role</h3>
                                        {stats.usersByRole.map(r => (
                                            <div key={r.role} className="flex justify-between items-center">
                                                <span className="text-gray-300 font-medium capitalize">{r.role.replace('_', ' ')}</span>
                                                <span className="text-white font-black text-lg">{r.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="glass-card p-8 space-y-6">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Orders by Status</h3>
                                        {stats.ordersByStatus.map(o => (
                                            <div key={o.status} className="flex justify-between items-center">
                                                <span className="text-gray-300 font-medium capitalize">{o.status}</span>
                                                <span className="text-white font-black text-lg">{o.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="space-y-6">
                    <div className="flex flex-wrap gap-4">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchUsers()}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white placeholder:text-gray-600 outline-none focus:border-brand-accent transition-colors"
                        />
                        <select
                            value={roleFilter}
                            onChange={e => { setRoleFilter(e.target.value); fetchUsers() }}
                            className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none"
                        >
                            <option value="">All Roles</option>
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button onClick={fetchUsers} className="studio-button px-8">Search</button>
                    </div>

                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-gray-500">Name</th>
                                        <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-gray-500">Email</th>
                                        <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-gray-500">Role</th>
                                        <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-gray-500">Verified</th>
                                        <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-gray-500">Joined</th>
                                        <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                            <td className="p-4 text-white font-medium">{u.name}</td>
                                            <td className="p-4 text-gray-400 text-sm">{u.email}</td>
                                            <td className="p-4">
                                                <select
                                                    value={u.role}
                                                    onChange={e => updateUserRole(u.id, e.target.value)}
                                                    disabled={u.id === user.id}
                                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white text-sm outline-none hover:border-brand-accent transition-colors"
                                                >
                                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs font-black uppercase tracking-wide px-3 py-1 rounded-full ${u.isVerified ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                                    {u.isVerified ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                {u.id !== user.id && (
                                                    <button onClick={() => deleteUser(u.id)} className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-400/10">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && (
                                <div className="p-12 text-center text-gray-600 font-medium">No users found.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Orders tab - placeholder */}
            {activeTab === 'orders' && (
                <AdminOrders />
            )}
        </motion.div>
    )
}

function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${API_URL}/api/admin/orders`)
            .then(r => r.json())
            .then(data => { if (data.success) setOrders(data.orders) })
            .catch(() => toast.error('Failed to load orders'))
            .finally(() => setLoading(false))
    }, [])

    const updateStatus = async (orderId: string, status: string) => {
        const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        })
        const data = await res.json()
        if (data.success) {
            toast.success('Order status updated')
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
        } else toast.error(data.message)
    }

    const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']

    if (loading) return <div className="text-gray-600 animate-pulse text-center py-20 font-black uppercase tracking-widest">Loading orders...</div>

    return (
        <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-gray-500">Order ID</th>
                            <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-gray-500">Buyer</th>
                            <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-gray-500">Amount</th>
                            <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-gray-500">Status</th>
                            <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-gray-500">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                <td className="p-4 font-mono text-white text-xs">{o.id.substring(0, 16)}...</td>
                                <td className="p-4 text-gray-300">{o.buyer?.name || o.buyer?.email || '—'}</td>
                                <td className="p-4 text-white font-black">${parseFloat(o.totalAmount).toFixed(2)}</td>
                                <td className="p-4">
                                    <select
                                        value={o.status}
                                        onChange={e => updateStatus(o.id, e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white text-sm outline-none"
                                    >
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
                                <td className="p-4 text-gray-500 text-sm">{new Date(o.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && <div className="p-12 text-center text-gray-600">No orders yet.</div>}
            </div>
        </div>
    )
}

export default AdminPanel
