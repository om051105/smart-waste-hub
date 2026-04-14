import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Leaf, Brain, MessageSquare, BarChart3, Trophy, Map,
  ArrowRight, ChevronDown, Sparkles, Shield, Users, Zap,
  Recycle, Eye, TrendingUp, CheckCircle, Globe, Menu, X
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────── */
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const h = () => setY(window.scrollY);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return y;
}

function FadeIn({
  children, delay = 0, direction = 'up', className = '',
}: {
  children: React.ReactNode; delay?: number; direction?: 'up' | 'left' | 'right' | 'none'; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const dirs = { up: { y: 40 }, left: { x: -40 }, right: { x: 40 }, none: {} };
  return (
    <motion.div ref={ref} initial={{ opacity: 0, ...dirs[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

/* ─── data ─────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Brain, title: 'AI Waste Detection',
    desc: 'Computer-vision models classify waste types in real-time, ensuring accurate categorisation and faster action.',
    color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20',
  },
  {
    icon: MessageSquare, title: 'Complaint Reporting',
    desc: 'Citizens capture and submit geo-tagged complaints instantly. Smart routing ensures the right team responds.',
    color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', glow: 'shadow-blue-500/20',
  },
  {
    icon: Recycle, title: 'Waste Tracking System',
    desc: 'End-to-end tracking from collection to disposal. Real-time dashboards show every bin, route, and facility.',
    color: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30', glow: 'shadow-violet-500/20',
  },
  {
    icon: Trophy, title: 'Compliance & Rewards',
    desc: 'Behavioural incentives drive participation. Earn points for proper disposal, redeem them for community rewards.',
    color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', glow: 'shadow-amber-500/20',
  },
  {
    icon: BarChart3, title: 'Analytics Dashboard',
    desc: 'Heat maps, trend lines, and predictive analytics give stakeholders the insight to act before issues escalate.',
    color: 'from-rose-500/20 to-pink-500/20', border: 'border-rose-500/30', glow: 'shadow-rose-500/20',
  },
];

const STEPS = [
  { icon: Users, label: 'Citizen', sub: 'Reports waste via app' },
  { icon: Eye, label: 'Upload', sub: 'Image & location captured' },
  { icon: Brain, label: 'AI Analysis', sub: 'Model classifies waste type' },
  { icon: Shield, label: 'Compliance Score', sub: 'Instant rating & feedback' },
  { icon: TrendingUp, label: 'Better Outcomes', sub: 'Cleaner neighbourhoods' },
];

const STATS = [
  { value: '94%', label: 'AI Detection Accuracy' },
  { value: '12k+', label: 'Complaints Resolved' },
  { value: '3.2M', label: 'kg Waste Tracked' },
  { value: '98k', label: 'Active Citizens' },
];

/* ─── sub-components ────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
    }));
    let raf: number;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(52,211,153,0.55)';
        ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(52,211,153,${0.18 * (1 - d / 120)})`;
          ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(draw);
    }
    draw();
    const ro = new ResizeObserver(() => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; });
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

function FeatureCard({ f, i }: { f: typeof FEATURES[0]; i: number }) {
  const Icon = f.icon;
  return (
    <FadeIn delay={i * 0.1} direction="up">
      <motion.div whileHover={{ scale: 1.03, y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`relative rounded-2xl border ${f.border} bg-gradient-to-br ${f.color} backdrop-blur-sm p-6 cursor-default group h-full hover:shadow-2xl ${f.glow} transition-shadow duration-300`}>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} border ${f.border} flex items-center justify-center mb-4`}>
          <Icon className="w-6 h-6 text-emerald-300" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2 font-display">{f.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
        <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${f.color}`} style={{ filter: 'blur(1px)', zIndex: -1 }} />
      </motion.div>
    </FadeIn>
  );
}

/* ─── main component ─────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const scrollY = useScrollY();
  const [menuOpen, setMenuOpen] = useState(false);

  const navGlass = scrollY > 40;

  return (
    <div className="min-h-screen bg-[#050c0a] text-white overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navGlass ? 'backdrop-blur-xl bg-[#050c0a]/80 border-b border-white/5 shadow-lg' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight font-display">WasteWise<span className="text-emerald-400">+</span></span>
          </div>

          {/* desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            {['Features', 'How It Works', 'Impact'].map(s => (
              <a key={s} href={`#${s.toLowerCase().replace(/ /g, '-')}`}
                className="hover:text-white transition-colors cursor-pointer"
                onClick={e => { e.preventDefault(); document.getElementById(s.toLowerCase().replace(/ /g, '-'))?.scrollIntoView({ behavior: 'smooth' }); }}>
                {s}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')}
              className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors">
              Sign In
            </button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow">
              Get Started
            </motion.button>
            <button className="md:hidden text-slate-400" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#050c0a]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4 space-y-3">
              {['Features', 'How It Works', 'Impact'].map(s => (
                <a key={s} onClick={() => { setMenuOpen(false); document.getElementById(s.toLowerCase().replace(/ /g, '-'))?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="block text-sm text-slate-400 hover:text-white cursor-pointer">{s}</a>
              ))}
              <button onClick={() => navigate('/login')} className="w-full mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium">
                Get Started Free
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 px-6 overflow-hidden">
        <ParticleCanvas />

        {/* radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-teal-500/8 blur-[100px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Waste Governance Platform
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold leading-tight font-display mb-6">
            Smart Waste Governance{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Powered by AI
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Harness computer-vision detection, real-time compliance tracking, and reward-based citizen participation to build cleaner, greener communities.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
              className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-shadow text-sm">
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-slate-300 hover:text-white hover:border-white/20 transition-all text-sm font-medium">
              Learn More
              <ChevronDown className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>

        {/* scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-emerald-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="border-y border-white/5 bg-white/2 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.1} direction="up" className="text-center">
              <div className="text-3xl md:text-4xl font-bold font-display bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-medium mb-4">
              <Zap className="w-3 h-3" /> Platform Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
              Everything you need to<br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">govern smarter</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">Five interconnected modules built for citizens, workers, champions, and administrators.</p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => <FeatureCard key={f.title} f={f} i={i} />)}
            {/* sixth cell — CTA card */}
            <FadeIn delay={0.5} direction="up">
              <motion.div whileHover={{ scale: 1.03, y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => navigate('/login')}
                className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 backdrop-blur-sm p-6 cursor-pointer group h-full flex flex-col items-center justify-center text-center hover:shadow-2xl hover:shadow-emerald-500/20 transition-shadow duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/40 flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-emerald-300" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 font-display">Start for Free</h3>
                <p className="text-sm text-slate-400 mb-4">Join thousands of communities already using WasteWise+</p>
                <span className="flex items-center gap-1 text-emerald-400 text-sm font-medium group-hover:gap-2 transition-all">
                  Get Started <ArrowRight className="w-4 h-4" />
                </span>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-transparent to-white/2">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-medium mb-4">
              <CheckCircle className="w-3 h-3" /> Simple Process
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">From a single photo to measurable community impact in five steps.</p>
          </FadeIn>

          {/* timeline */}
          <div className="relative">
            {/* connecting line */}
            <div className="hidden lg:block absolute top-14 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-8">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <FadeIn key={step.label} delay={i * 0.12} direction="up" className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}
                        className="w-[60px] h-[60px] rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-emerald-400" />
                      </motion.div>
                      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </div>
                    </div>
                    <h3 className="font-semibold text-white font-display mb-1">{step.label}</h3>
                    <p className="text-xs text-slate-500">{step.sub}</p>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT / ABOUT ── */}
      <section id="impact" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <FadeIn direction="left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-medium mb-6">
              <Globe className="w-3 h-3" /> Our Mission
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">
              Building a{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">sustainable future</span>{' '}
              for every community
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-6">
              WasteWise+ bridges the gap between citizens, municipal workers, and government administrators. Our platform turns waste management from a reactive problem into a proactive, data-driven governance system.
            </p>
            <ul className="space-y-3">
              {[
                'Reduce illegal dumping by 60% through community reporting',
                'AI models trained on 500k+ waste images for accurate detection',
                'Reward citizens for positive environmental behaviour',
                'Give administrators real-time visibility across all zones',
              ].map(t => (
                <li key={t} className="flex items-start gap-3 text-sm text-slate-400">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn direction="right" delay={0.2}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: 'Governance First', desc: 'Policy-aligned compliance scoring for every stakeholder', color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
                { icon: Recycle, title: 'Circular Economy', desc: 'Track materials from collection through recycling pipelines', color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30' },
                { icon: Users, title: 'Community Driven', desc: 'Gamified participation boosts citizen engagement by 3×', color: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30' },
                { icon: BarChart3, title: 'Data Insights', desc: 'Predictive analytics to allocate resources proactively', color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30' },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div key={card.title} whileHover={{ scale: 1.04 }} transition={{ type: 'spring', stiffness: 300 }}
                    className={`rounded-2xl border ${card.border} bg-gradient-to-br ${card.color} backdrop-blur-sm p-5`}>
                    <Icon className="w-6 h-6 text-emerald-300 mb-3" />
                    <h3 className="text-sm font-semibold text-white font-display mb-1">{card.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <div className="relative rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent backdrop-blur-sm p-12 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 blur-xl" />
              <div className="relative z-10">
                <Sparkles className="w-10 h-10 text-emerald-400 mx-auto mb-6" />
                <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
                  Ready to transform your<br />
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">community's future?</span>
                </h2>
                <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                  Join thousands of municipalities already making data-driven decisions with WasteWise+.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/login')}
                    className="group flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-shadow text-base">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/login')}
                    className="px-10 py-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-slate-300 hover:text-white hover:border-white/20 transition-all text-base font-medium">
                    Sign In
                  </motion.button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Leaf className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-slate-400 font-display">WasteWise+</span>
          </div>
          <p>© {new Date().getFullYear()} WasteWise+. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
