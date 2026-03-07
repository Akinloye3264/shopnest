import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, TrendingUp, Users, Package, Zap, Globe, Shield, Terminal, ArrowRight } from 'lucide-react'

interface User {
  id: string
  name?: string
  email: string
  role: string
}

function Dashboard({ user }: { user: User }) {
  const navigate = useNavigate()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const isEmployer = user.role === 'seller' || user.role === 'employee' || user.role === 'admin'

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-32"
    >
      {/* Hero Section */}
      <motion.section variants={itemVariants} className="pt-20">
        <span className="studio-label text-brand-accent">CORE SYSTEMS / {user.role?.toUpperCase()}</span>
        <h1 className="studio-h1 text-white leading-[0.85] mb-8">
          Accelerating
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20"> digital</span><br />
          evolution.
        </h1>
        <p className="text-2xl font-medium text-gray-400 max-w-3xl leading-snug mb-12">
          {user.role === 'employee'
            ? "Your command center for talent acquisition and ecosystem growth. Manage listings and monitor incoming talent flows."
            : "ShopNest leverages high-performance architecture and AI-driven intelligence to accelerate your presence across the modern marketplace."
          }
        </p>
        <div className="flex flex-wrap gap-4">
          {(user.role === 'buyer' || user.role === 'seller' || user.role === 'admin') && (
            <button onClick={() => navigate('/products')} className="studio-button px-10 h-16 text-lg group">
              MARKETPLACE ACCESS
              <ArrowUpRight className="ml-2 group-hover:rotate-45 transition-transform" size={20} />
            </button>
          )}
          {(user.role === 'job_seeker' || isEmployer) && (
            <button onClick={() => navigate('/jobs')} className="studio-button-ghost px-10 h-16 text-lg group">
              {isEmployer ? 'RECRUITMENT TERMINAL' : 'CAREER HUB'}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          )}
        </div>
      </motion.section>

      {/* Dynamic Stats Grid */}
      <motion.section variants={itemVariants} className="studio-grid">
        <div className="col-span-12 md:col-span-4 glass-card p-10 group cursor-default">
          <div className="flex justify-between items-start mb-12">
            <span className="studio-label text-gray-400">Inventory Logic</span>
            <Package className="text-brand-accent opacity-50 group-hover:opacity-100 transition-opacity" size={24} />
          </div>
          <div className="text-8xl font-black tracking-tighter text-white">12</div>
          <div className="mt-8 flex items-center text-xs font-black uppercase tracking-widest text-brand-accent">
            <TrendingUp size={14} className="mr-2" />
            Sync Optimized
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 glass-card p-10 group cursor-default">
          <div className="flex justify-between items-start mb-12">
            <span className="studio-label text-gray-400">Target Matches</span>
            <Users className="text-brand-accent opacity-50 group-hover:opacity-100 transition-opacity" size={24} />
          </div>
          <div className="text-8xl font-black tracking-tighter text-white">05</div>
          <div className="mt-8 flex items-center text-xs font-black uppercase tracking-widest text-[#555]">
            <Zap size={14} className="mr-2" />
            AI Processed
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 glass-card p-10 bg-brand-accent/5 border-brand-accent/20 group cursor-default">
          <div className="flex justify-between items-start mb-12">
            <span className="studio-label text-brand-accent font-black">Ecosystem Growth</span>
            <Globe className="text-brand-accent" size={24} />
          </div>
          <div className="text-8xl font-black tracking-tighter text-white">+24%</div>
          <div className="mt-8 flex items-center text-xs font-black uppercase tracking-widest text-brand-accent">
            <Shield size={14} className="mr-2" />
            Verified Metric
          </div>
        </div>
      </motion.section>

      {/* Role-Specific Operation Centers */}
      {isEmployer && (
        <motion.section variants={itemVariants} className="space-y-12">
          <h3 className="text-sm font-black uppercase tracking-[0.5em] text-gray-500 border-l-4 border-brand-accent pl-6">Employer Operation Center</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-12 glass-card bg-gradient-to-br from-white/5 to-transparent flex justify-between items-center group cursor-pointer" onClick={() => navigate('/jobs')}>
              <div className="space-y-4">
                <Terminal className="text-brand-accent" size={32} />
                <h4 className="text-3xl font-black uppercase tracking-tighter">Recruitment Hub</h4>
                <p className="text-gray-400 text-sm font-medium">Manage active listings and incoming talent.</p>
              </div>
              <ArrowRight size={32} className="text-gray-700 group-hover:text-brand-accent group-hover:translate-x-4 transition-all" />
            </div>
            {user.role === 'seller' && (
              <div className="p-12 glass-card bg-gradient-to-br from-white/5 to-transparent flex justify-between items-center group cursor-pointer" onClick={() => navigate('/products')}>
                <div className="space-y-4">
                  <Package className="text-brand-accent" size={32} />
                  <h4 className="text-3xl font-black uppercase tracking-tighter">Asset Control</h4>
                  <p className="text-gray-400 text-sm font-medium">Monitor inventory levels and market distribution.</p>
                </div>
                <ArrowRight size={32} className="text-gray-700 group-hover:text-brand-accent group-hover:translate-x-4 transition-all" />
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* Value Proposition */}
      <motion.section variants={itemVariants} className="studio-grid py-32 border-t border-white/5">
        <div className="col-span-12 lg:col-span-6">
          <h2 className="studio-h2 text-white font-black">Engineering<br />Trust & Scale.</h2>
          <p className="text-gray-500 max-w-md mt-6 text-xl">
            We don't just provide a platform; we provide a foundation for long-term digital evolution.
          </p>
        </div>
        <div className="col-span-12 lg:col-span-6 space-y-16">
          <div className="space-y-6">
            <div className="w-12 h-1 bg-brand-accent" />
            <h4 className="text-2xl font-black uppercase tracking-tight text-white">Nationwide Logistics</h4>
            <p className="text-gray-400 font-medium leading-relaxed">
              Our infrastructure bridges the gap between local production and national demand, optimized for low-latency distribution.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-1 bg-white/20" />
            <h4 className="text-2xl font-black uppercase tracking-tight text-white">Matchmaking Intelligence</h4>
            <p className="text-gray-400 font-medium leading-relaxed">
              Connecting specific talent with high-impact opportunities through advanced data modeling and ecosystem transparency.
            </p>
          </div>
        </div>
      </motion.section>

      {/* AI Navigation Feature */}
      <motion.section
        variants={itemVariants}
        className="glass-card bg-gradient-to-br from-brand-accent/5 to-transparent border-brand-accent/10 p-20 flex flex-col md:flex-row justify-between items-center gap-16"
      >
        <div className="max-w-2xl text-center md:text-left">
          <span className="studio-label text-brand-accent mb-4">Autonomous Intelligence</span>
          <h3 className="text-5xl font-black tracking-tighter uppercase text-white mb-6 leading-none">Context-Aware<br />Business Logic.</h3>
          <p className="text-xl font-medium text-gray-400 leading-relaxed">
            Integrate our AI assistant into your daily operations to automate product vetting, revenue forecasting, and talent acquisition.
          </p>
        </div>
        <button className="studio-button px-12 h-20 text-xl shrink-0 font-black">
          DEPLOY AI AUDIT
        </button>
      </motion.section>

      <footer className="pt-32 pb-48 border-t border-white/5 relative overflow-hidden">
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-accent/5 blur-[120px] rounded-full" />
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 relative z-10">
          <div className="text-[12rem] font-black tracking-tighter text-white opacity-[0.03] uppercase select-none leading-none absolute -top-8 -left-4 pointer-events-none">
            ShopNest
          </div>
          <div className="text-6xl font-black text-white tracking-tighter relative">
            ShopNest<span className="text-brand-accent">.</span>
          </div>
          <div className="space-y-8 max-w-md">
            <div className="space-y-4">
              <h5 className="font-black uppercase text-xs tracking-[0.3em] text-gray-500">System Information</h5>
              <p className="text-base text-gray-400 font-medium leading-relaxed">
                Operating at the intersection of commerce and intelligence. Built for organizations who demand high-performance infrastructure.
              </p>
            </div>
            <div className="flex space-x-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
              <span className="hover:text-white cursor-pointer transition-colors">System Status</span>
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Protocol</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terminals</span>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  )
}

export default Dashboard
