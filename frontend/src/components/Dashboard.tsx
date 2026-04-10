import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, TrendingUp, Users, Package, Zap, Globe, Shield, Terminal, ArrowRight } from 'lucide-react'

interface User {
  id: string
  name?: string
  email: string
  role: string
}

function Dashboard({ user, onOpenAI }: { user: User; onOpenAI?: () => void }) {
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

  const isEmployer = user.role === 'employer' || user.role === 'admin'
  const isSeller = user.role === 'seller'

  const roleMessage: Record<string, string> = {
    buyer: "Browse products, place orders, and message sellers, all in one place.",
    seller: "List your products, manage your store, and grow your income.",
    employer: "Post jobs, find the right talent, and manage your hiring pipeline.",
    job_seeker: "Find job opportunities that match your skills and experience.",
    employee: "Collaborate within your organization and track your work.",
    admin: "Manage the platform, users, products, and everything in between.",
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-20"
    >
      {/* Hero Section */}
      <motion.section variants={itemVariants}>
        <span className="studio-label text-brand-accent">HOME / {user.role?.toUpperCase()}</span>
        <h1 className="studio-h1 text-white leading-[0.85] mb-8">
          Hey, {user.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-base md:text-2xl font-medium text-gray-400 max-w-3xl leading-snug mb-8 md:mb-12">
          {roleMessage[user.role] || "Welcome to ShopNest."}
        </p>
        <div className="flex flex-wrap gap-4">
          {(user.role === 'buyer' || user.role === 'seller' || user.role === 'admin') && (
            <button onClick={() => navigate('/products')} className="studio-button px-5 md:px-10 h-12 md:h-16 text-sm md:text-lg group">
              {user.role === 'seller' ? 'MY PRODUCTS' : 'SHOP NOW'}
              <ArrowUpRight className="ml-2 group-hover:rotate-45 transition-transform" size={18} />
            </button>
          )}
          {(user.role === 'job_seeker' || user.role === 'employee') && (
            <button onClick={() => navigate('/jobs')} className="studio-button-ghost px-5 md:px-10 h-12 md:h-16 text-sm md:text-lg group">
              FIND JOBS
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          )}
          {isEmployer && (
            <button onClick={() => navigate('/jobs')} className="studio-button px-5 md:px-10 h-12 md:h-16 text-sm md:text-lg group">
              MANAGE JOBS
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          )}
        </div>
      </motion.section>

      {/* Dynamic Stats Grid */}
      <motion.section variants={itemVariants} className="studio-grid">
        <div className="col-span-12 md:col-span-4 glass-card p-6 md:p-10 group cursor-default">
          <div className="flex justify-between items-start mb-6 md:mb-12">
            <span className="studio-label text-gray-400">Products Listed</span>
            <Package className="text-brand-accent opacity-50 group-hover:opacity-100 transition-opacity" size={24} />
          </div>
          <div className="text-5xl md:text-8xl font-black tracking-tighter text-white">12</div>
          <div className="mt-4 md:mt-8 flex items-center text-xs font-black uppercase tracking-widest text-brand-accent">
            <TrendingUp size={14} className="mr-2" />
            In Stock
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 glass-card p-6 md:p-10 group cursor-default">
          <div className="flex justify-between items-start mb-6 md:mb-12">
            <span className="studio-label text-gray-400">People Connected</span>
            <Users className="text-brand-accent opacity-50 group-hover:opacity-100 transition-opacity" size={24} />
          </div>
          <div className="text-5xl md:text-8xl font-black tracking-tighter text-white">05</div>
          <div className="mt-4 md:mt-8 flex items-center text-xs font-black uppercase tracking-widest text-[#555]">
            <Zap size={14} className="mr-2" />
            Active Users
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 glass-card p-6 md:p-10 bg-brand-accent/5 border-brand-accent/20 group cursor-default">
          <div className="flex justify-between items-start mb-6 md:mb-12">
            <span className="studio-label text-brand-accent font-black">Growth This Month</span>
            <Globe className="text-brand-accent" size={24} />
          </div>
          <div className="text-5xl md:text-8xl font-black tracking-tighter text-white">+24%</div>
          <div className="mt-4 md:mt-8 flex items-center text-xs font-black uppercase tracking-widest text-brand-accent">
            <Shield size={14} className="mr-2" />
            Verified
          </div>
        </div>
      </motion.section>

      {/* Role-Specific Operation Centers */}
      {(isEmployer || isSeller) && (
        <motion.section variants={itemVariants} className="space-y-12">
          <h3 className="text-sm font-black uppercase tracking-[0.5em] text-gray-500 border-l-4 border-brand-accent pl-6">Your Tools</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {isEmployer && (
              <div className="p-8 md:p-12 glass-card bg-gradient-to-br from-white/5 to-transparent flex justify-between items-center group cursor-pointer" onClick={() => navigate('/jobs')}>
                <div className="space-y-4">
                  <Terminal className="text-brand-accent" size={32} />
                  <h4 className="text-xl md:text-3xl font-black uppercase tracking-tighter">Job Listings</h4>
                  <p className="text-gray-400 text-sm font-medium">Post jobs and see who applied.</p>
                </div>
                <ArrowRight size={32} className="text-gray-700 group-hover:text-brand-accent group-hover:translate-x-4 transition-all" />
              </div>
            )}
            {isSeller && (
              <div className="p-8 md:p-12 glass-card bg-gradient-to-br from-white/5 to-transparent flex justify-between items-center group cursor-pointer" onClick={() => navigate('/products')}>
                <div className="space-y-4">
                  <Package className="text-brand-accent" size={32} />
                  <h4 className="text-xl md:text-3xl font-black uppercase tracking-tighter">My Products</h4>
                  <p className="text-gray-400 text-sm font-medium">List products, manage inventory, and grow your store.</p>
                </div>
                <ArrowRight size={32} className="text-gray-700 group-hover:text-brand-accent group-hover:translate-x-4 transition-all" />
              </div>
            )}
            {user.role === 'admin' && (
              <div className="p-8 md:p-12 glass-card bg-gradient-to-br from-white/5 to-transparent flex justify-between items-center group cursor-pointer" onClick={() => navigate('/products')}>
                <div className="space-y-4">
                  <Package className="text-brand-accent" size={32} />
                  <h4 className="text-xl md:text-3xl font-black uppercase tracking-tighter">Marketplace</h4>
                  <p className="text-gray-400 text-sm font-medium">Monitor inventory levels and market distribution.</p>
                </div>
                <ArrowRight size={32} className="text-gray-700 group-hover:text-brand-accent group-hover:translate-x-4 transition-all" />
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* Value Proposition */}
      <motion.section variants={itemVariants} className="studio-grid py-16 md:py-32 border-t border-white/5">
        <div className="col-span-12 lg:col-span-6">
          <h2 className="studio-h2 text-white font-black">Why<br />ShopNest?</h2>
          <p className="text-gray-500 max-w-md mt-6 text-base md:text-xl">
            We built ShopNest to make buying, selling, and job hunting simple for everyone.
          </p>
        </div>
        <div className="col-span-12 lg:col-span-6 space-y-8 md:space-y-16">
          <div className="space-y-4 md:space-y-6">
            <div className="w-12 h-1 bg-brand-accent" />
            <h4 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">Fast Delivery</h4>
            <p className="text-gray-400 font-medium leading-relaxed">
              We connect sellers and buyers all over the country so your orders get to you quickly.
            </p>
          </div>
          <div className="space-y-4 md:space-y-6">
            <div className="w-12 h-1 bg-white/20" />
            <h4 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">Smart Job Matching</h4>
            <p className="text-gray-400 font-medium leading-relaxed">
              We match job seekers with the right jobs using smart filters and real listings.
            </p>
          </div>
        </div>
      </motion.section>

      {/* AI Navigation Feature */}
      <motion.section
        variants={itemVariants}
        className="glass-card bg-gradient-to-br from-brand-accent/5 to-transparent border-brand-accent/10 p-6 md:p-20 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-16"
      >
        <div className="max-w-2xl text-center md:text-left">
          <span className="studio-label text-brand-accent mb-4">AI Assistant</span>
          <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white mb-4 md:mb-6 leading-none">Need Help?<br />Ask AI.</h3>
          <p className="text-base md:text-xl font-medium text-gray-400 leading-relaxed">
            Use our AI assistant to find products, check prices, get job tips, and more.
          </p>
        </div>
        <button onClick={onOpenAI} className="studio-button px-6 md:px-12 h-14 md:h-20 text-base md:text-xl w-full md:w-auto shrink-0 font-black">
          TRY AI ASSISTANT
        </button>
      </motion.section>

      <footer className="pt-12 pb-24 md:pt-32 md:pb-48 border-t border-white/5 relative overflow-hidden">
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-accent/5 blur-[120px] rounded-full" />
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-16 relative z-10">
          <div className="text-[12rem] font-black tracking-tighter text-white opacity-[0.03] uppercase select-none leading-none absolute -top-8 -left-4 pointer-events-none hidden md:block">
            ShopNest
          </div>
          <div className="text-3xl md:text-6xl font-black text-white tracking-tighter relative">
            ShopNest<span className="text-brand-accent">.</span>
          </div>
          <div className="space-y-8 max-w-md">
            <div className="space-y-4">
              <h5 className="font-black uppercase text-xs tracking-[0.3em] text-gray-500">About ShopNest</h5>
              <p className="text-base text-gray-400 font-medium leading-relaxed">
                ShopNest is your all-in-one platform for shopping, selling, and finding jobs.
              </p>
            </div>
            <div className="flex space-x-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
              <span className="hover:text-white cursor-pointer transition-colors">Status</span>
              <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  )
}

export default Dashboard
