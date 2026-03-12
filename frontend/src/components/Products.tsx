import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { ShoppingCart, Plus, Minus, X, CreditCard, ArrowRight, Package, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import API_URL from '../config'

interface Product {
  id: string
  title: string
  description: string
  price: string
  image: string
  category: string
  stock: number
  seller?: { name: string }
}

interface CartItem extends Product {
  quantity: number
}

function Products({ user }: { user: any }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: 10
  })

  useEffect(() => {
    fetchProducts()
    const savedCart = localStorage.getItem('shopnest_cart')
    if (savedCart) setCart(JSON.parse(savedCart))
  }, [])

  useEffect(() => {
    localStorage.setItem('shopnest_cart', JSON.stringify(cart))
  }, [cart])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`)
      const data = await res.json()
      if (data.success) setProducts(data.products)
    } catch (err) {
      toast.error('Inventory fetch failed.')
    }
    setLoading(false)
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProduct, sellerId: user.id })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Asset listed successfully.')
        setShowAddForm(false)
        fetchProducts()
      }
    } catch (err) {
      toast.error('Listing failure.')
    }
  }

  const handleSeed = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/products/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId: user.id })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Warehouse populated.')
        fetchProducts()
      }
    } catch (err) {
      toast.error('Seeding failure.')
    }
    setLoading(false)
  }

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id)
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    toast.success(`${product.title} added to deployment.`, {
      style: { background: '#00ff88', color: '#000', fontWeight: 'bold' }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    }))
  }

  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)

  const handleCheckout = async () => {
    setCheckoutLoading(true)
    try {
      // Use orders/checkout to save order to DB + create Stripe session
      const res = await fetch(`${API_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          items: cart
        })
      })
      const data = await res.json()
      if (data.success && data.url) {
        // Clear cart before redirect
        setCart([])
        localStorage.removeItem('shopnest_cart')
        window.location.href = data.url
      } else {
        toast.error(data.message || 'Gateway connection failed.')
      }
    } catch (err) {
      toast.error('Secure checkout restricted.')
    }
    setCheckoutLoading(false)
  }

  return (
    <div className="space-y-24">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 pt-20">
        <div className="max-w-2xl">
          <span className="studio-label">Ecosystem / Marketplace</span>
          <h1 className="studio-h1 mb-4">The Global<br />Inventory Hub.</h1>
          <p className="text-xl font-medium text-gray-400">Discover premium assets curated from verified sellers across the ShopNest ecosystem.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCart(true)}
            className="studio-button-ghost h-20 px-8 flex items-center gap-4 relative group"
          >
            <ShoppingCart size={24} className="group-hover:text-brand-accent transition-colors" />
            <span className="uppercase tracking-widest font-black">Cart</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-accent text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
                {cart.length}
              </span>
            )}
          </button>
          {(user.role === 'seller' || user.role === 'admin') && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="studio-button h-20 px-12 text-lg uppercase tracking-widest flex items-center gap-3"
            >
              {showAddForm ? 'CANCEL LISTING' : <><Plus size={20} /> NEW PRODUCT</>}
            </button>
          )}
        </div>
      </header>

      {showAddForm && (
        <section className="glass-card p-12 animate-slide-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 blur-3xl -z-10" />
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-12">Asset Registration</h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-6 space-y-8">
              <div>
                <label className="studio-label text-gray-400">Product Name</label>
                <input type="text" required value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} className="studio-input" placeholder="e.g. Studio Monitor Pro" />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="studio-label text-gray-400">Valuation (USD)</label>
                  <input type="number" required value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="studio-input" placeholder="00.00" />
                </div>
                <div>
                  <label className="studio-label text-gray-400">Category</label>
                  <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="studio-input cursor-pointer appearance-none bg-transparent">
                    <option>Electronics</option>
                    <option>Fashion</option>
                    <option>Home</option>
                    <option>Business Tools</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6 space-y-8">
              <div>
                <label className="studio-label text-gray-400">Market Description</label>
                <textarea rows={5} required value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} className="studio-input resize-none" placeholder="Provide detailed specifications..." />
              </div>
              <button type="submit" className="studio-button w-full h-20 text-xl font-black uppercase">PUBLISH TO MARKET</button>
            </div>
          </form>
        </section>
      )}

      <div className="grid grid-cols-12 gap-8">
        {products.map(product => (
          <div key={product.id} className="col-span-12 md:col-span-6 lg:col-span-4 glass-card group flex flex-col p-6 hover:bg-white/[0.02] transition-colors border-white/5">
            <div className="relative aspect-square mb-8 overflow-hidden rounded-2xl bg-white/5">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-accent">
                {product.category}
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start gap-4 mb-2">
                <h4 className="text-2xl font-black uppercase leading-none tracking-tighter">{product.title}</h4>
                <p className="text-xl font-black tracking-tighter text-brand-accent">${product.price}</p>
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-6">
                Origin: <span className="text-gray-300">{product.seller?.name || 'ShopNest Verified'}</span>
              </p>
              <p className="text-sm text-gray-400 font-medium leading-relaxed flex-1 mb-8 line-clamp-2">
                {product.description}
              </p>
              <button
                onClick={() => addToCart(product)}
                className="studio-button w-full h-16 flex items-center justify-center gap-3 group/btn"
              >
                <Plus size={18} className="group-hover/btn:rotate-90 transition-transform" />
                <span className="uppercase text-xs tracking-widest font-black">Add to Cart</span>
              </button>
            </div>
          </div>
        ))}

        {products.length === 0 && !loading && (
          <div className="col-span-12 py-40 text-center glass-card border-dashed flex flex-col items-center justify-center space-y-8">
            <Package size={64} className="text-gray-800" />
            <div className="space-y-4">
              <h3 className="text-4xl font-black tracking-tighter opacity-10 uppercase">Empty Warehouse</h3>
              <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Inventory list is currently zero.</p>
            </div>
            {user.role === 'seller' && (
              <button
                onClick={handleSeed}
                className="studio-button-ghost px-10 h-14 uppercase text-[10px] tracking-widest font-black"
              >
                POPULATE SAMPLE LOGISTICS
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cart Drawer Overlay */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#050505] border-l border-white/10 z-[201] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <ShoppingCart size={24} className="text-brand-accent" />
                  <h3 className="text-2xl font-black uppercase tracking-tighter leading-none pt-1">Unit Deployment</h3>
                </div>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <Package size={48} className="text-gray-800" />
                    <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No units active in deployment.</p>
                    <button onClick={() => setShowCart(false)} className="studio-button-ghost px-8 h-12 uppercase text-[10px] tracking-widest font-black">Return to Market</button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-6 items-center">
                      <div className="w-20 h-20 rounded-xl bg-white/5 overflow-hidden shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-black uppercase tracking-tight mb-1">{item.title}</h4>
                        <p className="text-brand-accent font-black text-xs">${item.price}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-brand-accent"><Minus size={14} /></button>
                          <span className="text-xs font-black">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-brand-accent"><Plus size={14} /></button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                  ))
                )
                }
              </div>

              {cart.length > 0 && (
                <div className="p-8 border-t border-white/10 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">Subtotal Estimation</span>
                    <span className="text-3xl font-black tracking-tighter text-white">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="studio-button w-full h-20 flex items-center justify-center gap-4 text-xl"
                  >
                    {checkoutLoading ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>
                        <CreditCard size={24} />
                        <span className="font-black uppercase tracking-tighter">Initialize Checkout</span>
                        <ArrowRight size={24} />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest text-center">
                    Secure transaction powered by Stripe Gateway
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Products
