import { useNavigate } from 'react-router-dom'

interface User {
  id: string
  name?: string
  email: string
  role: string
}

function Dashboard({ user }: { user: User }) {
  const navigate = useNavigate()

  return (
    <div className="space-y-32">
      {/* Hero Section */}
      <section className="animate-slide-up pt-18">
        <span className="studio-label">System Overview / {user.role?.toUpperCase()}</span>
        <h1 className="studio-h1">Growth-focused<br />ecosystem for<br />Modern Sellers.</h1>
        <p className="text-2xl font-medium text-gray-400 max-w-3xl leading-snug mb-12">
          ShopNest is a comprehensive infrastructure designed to accelerate small business scaling through integrated marketplace logic and AI-driven navigation.
        </p>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => navigate('/products')} className="studio-button px-10 h-16 text-lg">ENTER MARKETPLACE</button>
          <button onClick={() => navigate('/jobs')} className="studio-button-ghost px-10 h-16 text-lg">EXPLORE CAREERS</button>
        </div>
      </section>

      {/* Dynamic Stats Grid */}
      <section className="studio-grid">
        <div className="col-span-12 md:col-span-4 studio-card">
          <span className="studio-label text-gray-300">Active Listings</span>
          <div className="text-8xl font-black tracking-tighter mt-4">12</div>
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mt-8">Real-time DB Sync Active</p>
        </div>
        <div className="col-span-12 md:col-span-4 studio-card">
          <span className="studio-label text-gray-300">Job Matches</span>
          <div className="text-8xl font-black tracking-tighter mt-4">05</div>
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mt-8">Based on profile logic</p>
        </div>
        <div className="col-span-12 md:col-span-4 studio-card bg-black text-white">
          <span className="studio-label text-white/50">Market Growth</span>
          <div className="text-8xl font-black tracking-tighter mt-4">+24%</div>
          <p className="text-sm font-bold uppercase tracking-widest text-white/30 mt-8">Ecosystem Analytics</p>
        </div>
      </section>

      {/* Extended Content: Values & Mission */}
      <section className="studio-grid py-20 border-t border-gray-100">
        <div className="col-span-12 lg:col-span-6">
          <h2 className="studio-h2">Empowering<br />Local Sellers.</h2>
        </div>
        <div className="col-span-12 lg:col-span-6 space-y-12">
          <div className="space-y-4">
            <h4 className="text-xl font-black uppercase">Infrastructure for Scale</h4>
            <p className="text-gray-500 font-medium leading-relaxed">
              We provide the digital plumbing required for small businesses to reach national audiences. Our marketplace is optimized for conversion and built on high-performance architecture.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xl font-black uppercase">Career Acceleration</h4>
            <p className="text-gray-500 font-medium leading-relaxed">
              Connecting talent with opportunity. Our recruitment system is more than just a list; it's a matchmaking engine powered by ecosystem data.
            </p>
          </div>
        </div>
      </section>

      {/* NEW: Platform Stats Deep Dive */}
      <section className="studio-grid py-32 border-t border-gray-100">
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <span className="studio-label">Network Verification</span>
          <h3 className="text-4xl font-black uppercase tracking-tighter">Verified Sellers.</h3>
          <p className="text-gray-400 font-medium leading-relaxed">Every participant in the ShopNest ecosystem undergoes a rigorous identity verification process to ensure market integrity.</p>
        </div>
        <div className="col-span-12 lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { l: 'Registered Users', v: '24K' },
            { l: 'Daily Transactions', v: '1.2K' },
            { l: 'Market Listings', v: '85K' },
            { l: 'Trust Score', v: '99.8%' }
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-gray-300">{stat.l}</p>
              <p className="text-3xl font-black tracking-tighter italic">{stat.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NEW: Ecosystem Partners / Trust Grid (Text Only) */}
      <section className="py-20 border-y border-gray-100 overflow-hidden">
        <div className="flex space-x-20 animate-marquee whitespace-nowrap">
          {['STRATEGIC ASSETS', 'GLOBAL LOGISTICS', 'FINTECH CORE', 'AI RESEARCH', 'RECRUITMENT HUB', 'MARKET ANALYTICS'].map((p, i) => (
            <span key={i} className="text-4xl font-black tracking-[0.3em] text-gray-100 uppercase select-none">{p}</span>
          ))}
          {/* Duplicate for seamless marquee effect */}
          {['STRATEGIC ASSETS', 'GLOBAL LOGISTICS', 'FINTECH CORE', 'AI RESEARCH', 'RECRUITMENT HUB', 'MARKET ANALYTICS'].map((p, i) => (
            <span key={i + 10} className="text-4xl font-black tracking-[0.3em] text-gray-100 uppercase select-none">{p}</span>
          ))}
        </div>
      </section>

      {/* Featured Insight Card */}
      <section className="studio-card bg-[#f1f1f1] border-none p-20 flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="max-w-xl text-center md:text-left">
          <h3 className="text-4xl font-black tracking-tighter uppercase mb-4">AI Navigation.</h3>
          <p className="text-lg font-medium text-gray-500">
            Our autonomous assistant helps you navigate complex business workflows, from initial product listing to advanced revenue tracking.
          </p>
        </div>
        <button className="studio-button px-12 h-20 text-xl shrink-0">GET FULL AUDIT</button>
      </section>

      {/* Role specific section */}
      {user.role === 'seller' && (
        <section className="pb-20">
          <div className="flex justify-between items-end mb-12">
            <h2 className="studio-h2 mb-0">Seller Hub.</h2>
            <Link to="/products" className="text-sm font-black uppercase tracking-widest underline decoration-2 underline-offset-8">Manage All</Link>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-12 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-black transition-colors" onClick={() => navigate('/products')}>
              <span className="text-5xl font-black mb-4">+</span>
              <p className="font-black text-xs uppercase tracking-[0.2em]">New Listing</p>
            </div>
          </div>
        </section>
      )}

      {/* Footer Branding */}
      <footer className="pt-20 pb-40 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="text-8xl font-black tracking-tighter opacity-10 uppercase select-none">ShopNest</div>
          <div className="space-y-4 max-w-sm">
            <h5 className="font-black uppercase text-xs tracking-widest">Digital Economy</h5>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">Built for sellers who demand more. Scaling small businesses through intelligence and design.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

import { Link } from 'react-router-dom'
export default Dashboard
