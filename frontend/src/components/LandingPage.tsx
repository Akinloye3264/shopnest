import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Briefcase, Store, Bot, Package, MessageSquare,
  ArrowRight, ChevronDown, Users, TrendingUp, MapPin,
  Shield, Zap, CheckCircle, Menu, X
} from 'lucide-react'

const stats = [
  { value: '500+', label: 'Youth Employed', icon: Users },
  { value: '120+', label: 'Local Vendors', icon: Store },
  { value: '₦2M+', label: 'Income Generated', icon: TrendingUp },
  { value: 'Abuja', label: 'Starting From', icon: MapPin },
]

const features = [
  {
    icon: ShoppingCart,
    title: 'Digital Marketplace',
    desc: 'Browse and buy from local small businesses and youth entrepreneurs across your community — all in one place.',
  },
  {
    icon: Briefcase,
    title: 'Job & Gig Opportunities',
    desc: 'Find short-term tasks, storefront management roles, and digital gigs that fit your skills — no connections required.',
  },
  {
    icon: Store,
    title: 'Sell Your Products',
    desc: 'Start selling online with zero startup capital. List your products, manage your store, and grow your income.',
  },
  {
    icon: Bot,
    title: 'AI Learning Assistant',
    desc: 'Get guidance on e-commerce, digital skills, and business growth through our built-in AI assistant.',
  },
  {
    icon: Package,
    title: 'Order Tracking',
    desc: 'Track every order in real time. Buyers and sellers stay updated from purchase to delivery.',
  },
  {
    icon: MessageSquare,
    title: 'Direct Messaging',
    desc: 'Communicate directly with vendors, employers, or buyers — no middlemen, no delays.',
  },
]

const steps = [
  { step: '01', title: 'Create Your Account', desc: 'Sign up as a buyer, seller, or job seeker in under 2 minutes.', icon: CheckCircle },
  { step: '02', title: 'Set Up Your Profile', desc: 'Tell us your skills, products, or what you\'re looking for.', icon: Shield },
  { step: '03', title: 'Start Earning or Shopping', desc: 'List products, apply for gigs, or browse the marketplace immediately.', icon: Zap },
]

const highlights = [
  { icon: '🎓', title: 'Merit Over Connections', text: 'We match talent to opportunity based on skills and experience — not who you know.' },
  { icon: '🏘️', title: 'Community-First Growth', text: 'Starting in Gwagwalada, Abuja — with plans to expand across Nigeria and Africa.' },
  { icon: '📈', title: 'Real, Sustainable Income', text: 'Task-based payments, commissions, and storefront earnings — money you actually keep.' },
]

function useScrolled() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return scrolled
}

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function SlideIn({ children, direction = 'left', delay = 0 }: { children: React.ReactNode; direction?: 'left' | 'right'; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: direction === 'left' ? -60 : 60 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const scrolled = useScrolled()
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="min-h-screen text-white overflow-x-hidden">

      {/* ── STICKY NAV ── */}
      <motion.nav
        className="fixed top-0 left-0 w-full z-[100] transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(5,5,5,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
        }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="studio-container flex justify-between items-center h-20">
          <Link to="/" className="text-2xl font-black tracking-tighter hover:opacity-70 transition-opacity">
            ShopNest<span className="text-brand-accent">.</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-10">
            <a href="#features" className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#mission" className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Mission</a>
            <a href="#how-it-works" className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">How It Works</a>
            <a href="#about" className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">About</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-sm font-black uppercase tracking-widest px-6 py-3 border border-white/20 rounded-full hover:border-brand-accent hover:text-brand-accent transition-all"
            >
              Log In
            </Link>
            <Link to="/register" className="studio-button text-xs uppercase tracking-widest px-7 py-3">
              Sign Up Free
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-20 left-0 w-full z-[99] bg-[#0a0a0a]/98 backdrop-blur-2xl border-b border-white/5 p-8 flex flex-col space-y-6 md:hidden"
          >
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-xl font-black uppercase tracking-wide">Features</a>
            <a href="#mission" onClick={() => setMobileMenuOpen(false)} className="text-xl font-black uppercase tracking-wide">Mission</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-xl font-black uppercase tracking-wide">How It Works</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-xl font-black uppercase tracking-wide">About</a>
            <div className="pt-4 border-t border-white/10 flex flex-col space-y-4">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-4 border border-white/20 rounded-full font-black uppercase tracking-widest text-sm hover:border-brand-accent hover:text-brand-accent transition-all">Log In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="studio-button text-center py-4 uppercase tracking-widest text-sm">Sign Up Free</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center items-center text-center overflow-hidden pt-24 pb-32">

        {/* Animated background glow — parallax on glows only, not on text */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)', y: heroY }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 70%)', y: heroY }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </div>

        <motion.div
          className="relative z-10 studio-container max-w-5xl"
          style={{ opacity: heroOpacity }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center space-x-2 mb-8 px-5 py-2 border border-brand-accent/30 rounded-full bg-brand-accent/5"
          >
            <span className="text-lg">🇳🇬</span>
            <span className="text-xs font-black uppercase tracking-widest text-brand-accent">Built for African Youth</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-black tracking-tighter leading-none mb-8"
            style={{ fontSize: 'clamp(3rem, 9vw, 7rem)' }}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            Your Skills.<br />
            Your Store.<br />
            <span className="text-brand-accent">Your Future.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            ShopNest connects unemployed graduates with real income opportunities —
            through digital storefronts, gig work, and local e-commerce.
            <strong className="text-white"> No startup capital. No connections needed.</strong> Just your drive.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/register" className="studio-button text-base uppercase tracking-widest px-10 py-5 flex items-center gap-3 group">
              Start Earning Today
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="text-sm font-black uppercase tracking-widest px-10 py-5 border border-white/20 rounded-full hover:border-brand-accent hover:text-brand-accent transition-all">
              Log In to Account
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs font-bold uppercase tracking-widest text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {['Free to Join', 'No Setup Fees', 'Start in Minutes', 'Nigerian Built'].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <CheckCircle size={14} className="text-brand-accent" />
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
        >
          <ChevronDown size={28} className="text-gray-600" />
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="studio-container py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="text-center group">
                  <div className="flex justify-center mb-3">
                    <s.icon size={22} className="text-brand-accent/60 group-hover:text-brand-accent transition-colors" />
                  </div>
                  <div className="text-4xl font-black tracking-tighter text-brand-accent mb-1">{s.value}</div>
                  <div className="text-xs font-black uppercase tracking-widest text-gray-500">{s.label}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-32">
        <div className="studio-container">
          <FadeUp>
            <p className="text-xs font-black uppercase tracking-widest text-brand-accent mb-4">What We Offer</p>
            <h2 className="font-black tracking-tighter leading-none mb-6" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
              Everything You Need to<br />
              <span className="text-gray-500">Earn and Grow Online</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
              Whether you want to sell products, find digital work, or support local businesses —
              ShopNest gives you the tools to do it all from one platform.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {features.map((f, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div className="glass-card p-8 h-full">
                  <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mb-6">
                    <f.icon size={22} className="text-brand-accent" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight mb-3">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section id="mission" className="py-32 border-y border-white/5 bg-white/[0.015]">
        <div className="studio-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <SlideIn direction="left">
              <p className="text-xs font-black uppercase tracking-widest text-brand-accent mb-4">Our Mission</p>
              <h2 className="font-black tracking-tighter leading-none mb-6" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
                Fighting Youth<br />Unemployment,<br />
                <span className="text-brand-accent">One Digital Job</span><br />at a Time
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                About 9% of Africa's population is unemployed — and the number is growing.
                ShopNest was built in Gwagwalada, Abuja to give qualified graduates a fair
                shot at income, without needing <em className="text-gray-300">"connections from high places."</em>
              </p>
              <a href="#about" className="studio-button-ghost inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-widest rounded-full">
                Read Our Story <ArrowRight size={16} />
              </a>
            </SlideIn>

            <SlideIn direction="right" delay={0.15}>
              <div className="flex flex-col gap-5">
                {highlights.map((h, i) => (
                  <motion.div
                    key={i}
                    className="glass-card p-6 flex gap-5 items-start"
                    whileHover={{ x: 6 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <span className="text-3xl flex-shrink-0">{h.icon}</span>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-wide text-brand-accent mb-2">{h.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{h.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-32">
        <div className="studio-container">
          <FadeUp className="text-center mb-20">
            <p className="text-xs font-black uppercase tracking-widest text-brand-accent mb-4">How It Works</p>
            <h2 className="font-black tracking-tighter leading-none mb-4" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
              Get Started in<br /><span className="text-brand-accent">3 Simple Steps</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              No startup capital. No technical experience needed. Just sign up and start.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-brand-accent/30 via-brand-accent to-brand-accent/30" />

            {steps.map((s, i) => (
              <FadeUp key={i} delay={i * 0.15}>
                <div className="glass-card p-10 text-center relative">
                  <div className="w-16 h-16 rounded-full bg-brand-accent mx-auto mb-6 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(0,255,136,0.4)]">
                    <span className="text-black font-black text-xl">{s.step}</span>
                  </div>
                  <h3 className="font-black text-lg uppercase tracking-tight mb-3">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM SHOWCASE ── */}
      <section className="py-24 border-y border-white/5 bg-white/[0.015]">
        <div className="studio-container">
          <FadeUp className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-widest text-brand-accent mb-4">Who It's For</p>
            <h2 className="font-black tracking-tighter" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              One Platform, Multiple Paths
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🎓',
                role: 'Job Seekers',
                desc: 'Apply for gig work, short-term roles, and digital tasks. Build experience and income without needing referrals.',
                cta: 'Find Work',
                link: '/register',
              },
              {
                icon: '🏪',
                role: 'Sellers & Vendors',
                desc: 'Open your digital storefront, list products, and reach customers across Abuja and beyond.',
                cta: 'Start Selling',
                link: '/register',
              },
              {
                icon: '🛍️',
                role: 'Buyers',
                desc: 'Discover quality local products, support youth businesses, and shop with confidence.',
                cta: 'Browse Marketplace',
                link: '/register',
              },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="glass-card p-10 text-center flex flex-col h-full">
                  <span className="text-5xl mb-6 block">{item.icon}</span>
                  <h3 className="font-black text-xl uppercase tracking-tight mb-4 text-brand-accent">{item.role}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-8">{item.desc}</p>
                  <Link to={item.link} className="studio-button text-xs uppercase tracking-widest py-3 w-full">
                    {item.cta} <ArrowRight size={14} className="inline ml-1" />
                  </Link>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(0,255,136,0.06) 0%, transparent 70%)' }}
          />
        </div>
        <div className="studio-container relative z-10">
          <FadeUp>
            <p className="text-xs font-black uppercase tracking-widest text-brand-accent mb-6">Join ShopNest Today</p>
            <h2 className="font-black tracking-tighter leading-none mb-6" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
              Ready to Turn Your<br />Skills Into Income?
            </h2>
            <p className="text-gray-400 text-lg max-w-lg mx-auto mb-12 leading-relaxed">
              Join hundreds of youth entrepreneurs and small businesses already growing with ShopNest.
              Your opportunity is waiting.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link to="/register" className="studio-button text-base uppercase tracking-widest px-12 py-5 flex items-center gap-3 group">
                Create Free Account
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="text-sm font-black uppercase tracking-widest px-12 py-5 border border-white/20 rounded-full hover:border-brand-accent hover:text-brand-accent transition-all">
                Already Have Account
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-32 border-y border-white/5">
        <div className="studio-container">
          <div className="max-w-3xl mx-auto">
            <FadeUp>
              <p className="text-xs font-black uppercase tracking-widest text-brand-accent mb-4">About ShopNest</p>
              <h2 className="font-black tracking-tighter leading-none mb-6" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
                Empowering African Youth<br /><span className="text-brand-accent">One Storefront at a Time</span>
              </h2>
            </FadeUp>

            <FadeUp delay={0.1}>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                ShopNest was born out of a simple observation: talented, qualified graduates across Africa
                are struggling to find meaningful employment — not because they lack skills, but because
                they lack connections and opportunities.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Founded in Gwagwalada, Abuja, ShopNest is more than just an e-commerce platform.
                It's a movement to democratize economic opportunity and give every young person
                a fair shot at building their future.
              </p>
              <div className="border-l-2 border-brand-accent pl-6 mb-10">
                <p className="text-white text-lg font-medium italic leading-relaxed">
                  "We believe that your potential should never be limited by who you know.
                  Your skills, dedication, and drive should be enough."
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {[
                  { icon: '🎯', title: 'Merit-Based', desc: 'Opportunities based on skills, not connections.' },
                  { icon: '🤝', title: 'Community', desc: 'Building local economies from the ground up.' },
                  { icon: '💡', title: 'Innovation', desc: 'Technology solving real African problems.' },
                  { icon: '🌍', title: 'Pan-African', desc: 'Starting local, scaling across the continent.' },
                ].map((v, i) => (
                  <div key={i} className="glass-card p-6 text-center">
                    <span className="text-3xl block mb-3">{v.icon}</span>
                    <h4 className="font-black text-sm uppercase tracking-wide text-brand-accent mb-2">{v.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.3}>
              <p className="text-gray-400 text-lg leading-relaxed mb-4">
                Since our launch, ShopNest has helped over <strong className="text-white">500 young people</strong> find
                employment or start their own businesses, facilitated over <strong className="text-white">₦2 million</strong> in
                transactions, and supported <strong className="text-white">120+ local vendors</strong> in establishing their
                digital presence.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed">
                Our goal: <strong className="text-white">10,000 jobs</strong> and <strong className="text-white">1,000 small businesses</strong> across
                Nigeria by 2027, and expansion across Africa by 2028.
              </p>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10">
        <div className="studio-container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <Link to="/" className="text-2xl font-black tracking-tighter block mb-1">
                ShopNest<span className="text-brand-accent">.</span>
              </Link>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-600">Built for African Youth</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">© 2026 ShopNest. Starting from Gwagwalada, Abuja.</p>
              <p className="text-xs text-gray-600 mt-1">Creating jobs. Building futures.</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-brand-accent transition-colors">Log In</Link>
              <Link to="/register" className="studio-button text-xs uppercase tracking-widest px-5 py-2">Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
