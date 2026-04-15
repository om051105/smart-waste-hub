import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Eye, EyeOff, ArrowRight, Sparkles, Shield, Users, Recycle, Trophy, ArrowLeft } from 'lucide-react';
import { login, register, UserRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

/* ─── Particle Canvas (same as landing page) ─────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
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
        ctx.fillStyle = 'rgba(52,211,153,0.45)';
        ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(52,211,153,${0.12 * (1 - d / 120)})`;
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

/* ─── Floating icon component ─────────────────────────────── */
function FloatingIcon({ icon: Icon, delay, x, y, size = 20 }: { icon: any; delay: number; x: string; y: string; size?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.15, scale: 1 }}
      transition={{ delay, duration: 0.8, ease: 'easeOut' }}
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
    >
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 5 + delay, ease: 'easeInOut' }}
      >
        <Icon size={size} className="text-emerald-400" />
      </motion.div>
    </motion.div>
  );
}

/* ─── Role data ────────────────────────────────────────────── */
const ROLES: { value: UserRole; label: string; icon: any; desc: string; color: string; border: string }[] = [
  { value: 'citizen', label: 'Citizen', icon: Users, desc: 'Report & earn rewards', color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
  { value: 'worker', label: 'Waste Worker', icon: Recycle, desc: 'Manage collections', color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30' },
  { value: 'admin', label: 'Administrator', icon: Shield, desc: 'Govern & oversee', color: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30' },
  { value: 'champion', label: 'Green Champion', icon: Trophy, desc: 'Lead sustainability', color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30' },
];

/* ─── Stagger container & item variants ────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── Main Component ───────────────────────────────────────── */
export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [area, setArea] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
    setIsLoading(true);
    try {
      if (isRegister) {
        const user = await register(name, email, password, role);
        if (!user) { toast({ title: 'Email already exists or error', variant: 'destructive' }); return; }
        navigate('/dashboard');
      } else {
        const user = await login(email, password);
        if (!user) { toast({ title: 'Invalid credentials or error', variant: 'destructive' }); return; }
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
=======
    try {
      if (isRegister) {
        await register(name, email, password, role, area);
        navigate('/dashboard');
      } else {
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast({ 
        title: isRegister ? 'Registration Failed' : 'Login Failed',
        description: err.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive' 
      });
>>>>>>> 1d45ed1369f66831b2587aaae97b0c1a0c771f73
    }
  };

  return (
    <div className="min-h-screen bg-[#050c0a] text-white overflow-hidden relative">

      {/* ── Background image ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/login-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Dark overlay on the image */}
      <div className="absolute inset-0 z-0 bg-[#050c0a]/75" />

      {/* ── Particle canvas ── */}
      <div className="absolute inset-0 z-[1]">
        <ParticleCanvas />
      </div>

      {/* ── Radial glows (matching landing page) ── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/8 blur-[120px] pointer-events-none z-[1]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-teal-500/6 blur-[100px] pointer-events-none z-[1]" />

      {/* ── Floating decorative icons ── */}
      <FloatingIcon icon={Recycle} delay={0.5} x="8%" y="20%" size={28} />
      <FloatingIcon icon={Leaf} delay={0.8} x="85%" y="15%" size={24} />
      <FloatingIcon icon={Shield} delay={1.1} x="90%" y="65%" size={22} />
      <FloatingIcon icon={Trophy} delay={1.4} x="5%" y="75%" size={26} />

      {/* ── Content ── */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* ── Top bar ── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-6 h-16 flex items-center justify-between max-w-7xl mx-auto w-full"
        >
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
<<<<<<< HEAD
            <span className="font-bold text-lg tracking-tight font-display">
              WasteWise<span className="text-emerald-400">+</span>
            </span>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </motion.button>
        </motion.header>

        {/* ── Main form area ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-lg">

            <AnimatePresence mode="wait">
              <motion.div
                key={isRegister ? 'register' : 'login'}
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >

                {/* ── Glassmorphism card ── */}
                <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 md:p-10 shadow-2xl shadow-black/20 overflow-hidden">

                  {/* Inner glow */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-emerald-500/10 blur-[60px] pointer-events-none" />
                  <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-teal-500/10 blur-[50px] pointer-events-none" />

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10"
                  >
                    {/* Badge */}
                    <motion.div variants={itemVariants}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-6"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isRegister ? 'Join the Platform' : 'Welcome Back'}
                    </motion.div>

                    {/* Heading */}
                    <motion.h1 variants={itemVariants}
                      className="text-3xl md:text-4xl font-bold font-display mb-2"
                    >
                      {isRegister ? (
                        <>Create your <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">account</span></>
                      ) : (
                        <>Sign in to <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">WasteWise+</span></>
                      )}
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-slate-400 mb-8">
                      {isRegister ? 'Join thousands building greener communities.' : 'Access your dashboard and make an impact.'}
                    </motion.p>

                    {/* ── Form ── */}
                    <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-5">

                      {/* Name (register only) */}
                      <AnimatePresence>
                        {isRegister && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Label className="text-sm text-slate-300 font-medium">Full Name</Label>
                            <Input
                              value={name}
                              onChange={e => setName(e.target.value)}
                              placeholder="Your name"
                              required
                              className="mt-1.5 h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Email */}
                      <div>
                        <Label className="text-sm text-slate-300 font-medium">Email</Label>
                        <Input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="mt-1.5 h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <Label className="text-sm text-slate-300 font-medium">Password</Label>
                        <div className="relative mt-1.5">
                          <Input
                            type={showPw ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all pr-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Role selector (register only) */}
                      <AnimatePresence>
                        {isRegister && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Label className="text-sm text-slate-300 font-medium mb-2 block">Select Your Role</Label>
                            <div className="grid grid-cols-2 gap-2.5">
                              {ROLES.map((r) => {
                                const Icon = r.icon;
                                const isActive = role === r.value;
                                return (
                                  <motion.button
                                    key={r.value}
                                    type="button"
                                    onClick={() => setRole(r.value)}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 ${
                                      isActive
                                        ? `bg-gradient-to-br ${r.color} ${r.border} shadow-lg`
                                        : 'border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'
                                    }`}
                                  >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                      isActive ? `bg-gradient-to-br ${r.color}` : 'bg-white/5'
                                    }`}>
                                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-slate-500'}`} />
                                    </div>
                                    <div className="min-w-0">
                                      <div className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-400'}`}>{r.label}</div>
                                      <div className={`text-[10px] ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>{r.desc}</div>
                                    </div>
                                    {isActive && (
                                      <motion.div
                                        layoutId="roleCheck"
                                        className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400"
                                      />
                                    )}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit button */}
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all text-sm group border-0"
                        >
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                          ) : (
                            <>
                              {isRegister ? 'Create Account' : 'Sign In'}
                              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </motion.form>

                    {/* ── Toggle link ── */}
                    <motion.div variants={itemVariants} className="mt-6 text-center">
                      <span className="text-sm text-slate-500">
                        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                      </span>
                      <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-sm text-emerald-400 font-medium hover:text-emerald-300 transition-colors hover:underline underline-offset-2"
                      >
                        {isRegister ? 'Sign In' : 'Create Account'}
                      </button>
                    </motion.div>

                  </motion.div>
=======
            <div>
              <Label>Password</Label>
              <div className="relative mt-1">
                <Input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {isRegister && (
              <div>
                <Label>Location / Area</Label>
                <Input value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. North Town, South District" required className="mt-1" />
              </div>
            )}
            {isRegister && (
              <div>
                <Label>Role</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {roles.map(r => (
                    <button key={r.value} type="button" onClick={() => setRole(r.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        role === r.value ? 'border-primary bg-secondary text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}>
                      {r.label}
                    </button>
                  ))}
>>>>>>> 1d45ed1369f66831b2587aaae97b0c1a0c771f73
                </div>

                {/* ── Trust indicators beneath card ── */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-600"
                >
                  {['End-to-end encrypted', 'GDPR Compliant', 'SOC 2 Ready'].map((t) => (
                    <div key={t} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                      {t}
                    </div>
                  ))}
                </motion.div>

              </motion.div>
            </AnimatePresence>

          </div>
        </div>

        {/* ── Footer ── */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="px-6 py-4 text-center text-xs text-slate-600"
        >
          © {new Date().getFullYear()} WasteWise+. All rights reserved.
        </motion.footer>

      </div>
    </div>
  );
}
