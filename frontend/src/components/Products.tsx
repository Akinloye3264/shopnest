import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

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

function Products({ user }: { user: any }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: 10
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/products')
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
      const res = await fetch('http://localhost:5001/api/products', {
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

  return (
    <div className="space-y-24">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
        <div className="max-w-2xl pt-20">
          <span className="studio-label">Ecosystem / Marketplace</span>
          <h1 className="studio-h1 mb-4">The Global<br />Inventory Hub.</h1>
          <p className="text-xl font-medium text-gray-400">Discover premium assets curated from verified sellers across the ShopNest ecosystem.</p>
        </div>
        {user.role === 'seller' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="studio-button h-20 px-12 text-lg uppercase tracking-widest"
          >
            {showAddForm ? 'CANCEL LISTING' : 'NEW PRODUCT'}
          </button>
        )}
      </header>

      {showAddForm && (
        <section className="studio-card bg-gray-50 border-none animate-slide-up">
          <span className="studio-label mb-8">Asset Registration</span>
          <form onSubmit={handleAddProduct} className="studio-grid">
            <div className="col-span-12 lg:col-span-6 space-y-10">
              <div className="group">
                <label className="studio-label">Product Name</label>
                <input type="text" required value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} className="studio-input" placeholder="e.g. Studio Monitor Pro" />
              </div>
              <div className="group">
                <label className="studio-label">Asset Valuation (USD)</label>
                <input type="number" required value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="studio-input" placeholder="00.00" />
              </div>
              <div className="group">
                <label className="studio-label">Category</label>
                <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="studio-input cursor-pointer appearance-none bg-white">
                  <option>Electronics</option>
                  <option>Fashion</option>
                  <option>Home</option>
                  <option>Business Tools</option>
                </select>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6 flex flex-col justify-between space-y-10">
              <div className="group h-full flex flex-col">
                <label className="studio-label">Market Description</label>
                <textarea rows={8} required value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} className="studio-input flex-1 resize-none" placeholder="Provide detailed specifications..." />
              </div>
              <button type="submit" className="studio-button w-full h-20 text-xl tracking-tighter">PUBLISH TO MARKET</button>
            </div>
          </form>
        </section>
      )}

      <div className="studio-grid">
        {products.map(product => (
          <div key={product.id} className="col-span-12 md:col-span-6 lg:col-span-4 studio-card group flex flex-col">
            <div className="relative h-96 mb-12 overflow-hidden rounded-xl bg-gray-100">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute top-6 left-6 bg-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-black">
                {product.category}
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start gap-4 mb-2">
                <h4 className="text-2xl font-black uppercase leading-[0.9] tracking-tighter">{product.title}</h4>
                <p className="text-2xl font-black tracking-tighter">${product.price}</p>
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-10">
                Seller: {product.seller?.name || 'Authorized Outlet'}
              </p>
              <p className="text-gray-500 font-medium leading-relaxed flex-1 mb-12 line-clamp-3">
                {product.description}
              </p>
              <div className="pt-8 border-t border-gray-100 flex justify-between items-center mt-auto">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Ready for Shipment</span>
                <button className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-8">Acquire Asset</button>
              </div>
            </div>
          </div>
        ))}

        {products.length === 0 && !loading && (
          <div className="col-span-12 py-60 text-center">
            <h3 className="text-6xl font-black tracking-tighter opacity-10 uppercase">Empty Warehouse</h3>
            <p className="text-gray-300 font-black uppercase tracking-widest mt-4">Inventory list is currently zero.</p>
          </div>
        )}
      </div>

      <footer className="py-40 text-center border-t border-gray-100">
        <div className="max-w-xl mx-auto space-y-8">
          <h3 className="text-4xl font-black tracking-tighter uppercase">Join the Marketplace.</h3>
          <p className="text-gray-400 font-medium leading-relaxed">ShopNest simplifies the lifecycle of a product. From listing to logistics, we handle the infrastructure so you can handle the sales.</p>
          <button className="studio-button-ghost px-16 h-16 uppercase text-xs tracking-widest">Read Commerce Docs</button>
        </div>
      </footer>
    </div>
  )
}

export default Products
