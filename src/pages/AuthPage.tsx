import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react';
import { login, register, UserRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const ROLES: { value: UserRole; label: string; desc: string; emoji: string }[] = [
  { value: 'citizen', label: 'Citizen', desc: 'Report & earn rewards', emoji: '🌱' },
  { value: 'worker', label: 'Waste Worker', desc: 'Manage collections', emoji: '🚛' },
  { value: 'admin', label: 'Administrator', desc: 'Oversee operations', emoji: '🛡️' },
  { value: 'champion', label: 'Green Champion', desc: 'Inspect & enforce', emoji: '⭐' },
];

function getRoleRedirect(role: UserRole): string {
  const map: Record<UserRole, string> = {
    citizen: '/dashboard',
    admin: '/dashboard',
    worker: '/dashboard',
    champion: '/dashboard',
  };
  return map[role];
}

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const user = await register(name, email, password, role);
        if (!user) {
          toast({ title: 'Registration failed', description: 'Email may already exist or server error.', variant: 'destructive' });
          return;
        }
        navigate(getRoleRedirect(user.role));
      } else {
        const user = await login(email, password);
        if (!user) {
          toast({ title: 'Login failed', description: 'Invalid credentials. Please try again.', variant: 'destructive' });
          return;
        }
        navigate(getRoleRedirect(user.role));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050c0a] text-white flex">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0a1a14] to-[#0d1f17] items-center justify-center p-16">
        {/* bg glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-emerald-500/15 blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-teal-500/10 blur-[80px]" />

        {/* grid dots pattern */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(52,211,153,0.4) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />

        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}
          className="relative z-10 max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display">WasteWise<span className="text-emerald-400">+</span></span>
          </div>

          <h2 className="text-4xl font-bold font-display leading-tight mb-4">
            Smart Waste<br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Governance</span><br />
            Starts Here
          </h2>
          <p className="text-slate-400 leading-relaxed mb-8">
            Join the AI-powered platform helping municipalities and communities build cleaner, data-driven futures.
          </p>

          <div className="space-y-3">
            {[
              '94% accurate AI waste detection',
              'Real-time compliance tracking',
              'Reward-based citizen engagement',
              'Analytics for every stakeholder',
            ].map(t => (
              <div key={t} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-sm text-slate-400">{t}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="w-full max-w-md">

          {/* back to home */}
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </button>

          {/* mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg font-display">WasteWise<span className="text-emerald-400">+</span></span>
          </div>

          {/* tab toggle */}
          <div className="flex rounded-xl border border-white/10 bg-white/5 p-1 mb-8">
            {['Sign In', 'Sign Up'].map((t, i) => (
              <button key={t} onClick={() => setIsRegister(i === 1)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  isRegister === (i === 1)
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}>
                {t}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={isRegister ? 'register' : 'login'}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}>

              <div className="mb-6">
                <h1 className="text-2xl font-bold font-display">
                  {isRegister ? 'Create your account' : 'Welcome back'}
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  {isRegister ? 'Join thousands of communities on WasteWise+' : 'Sign in to your dashboard'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <div>
                    <Label className="text-slate-300 text-sm">Full Name</Label>
                    <Input value={name} onChange={e => setName(e.target.value)}
                      placeholder="Your full name" required
                      className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-emerald-500/20" />
                  </div>
                )}

                <div>
                  <Label className="text-slate-300 text-sm">Email address</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-emerald-500/20" />
                </div>

                <div>
                  <Label className="text-slate-300 text-sm">Password</Label>
                  <div className="relative mt-1">
                    <Input type={showPw ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-emerald-500/20 pr-10" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isRegister && (
                  <div>
                    <Label className="text-slate-300 text-sm mb-2 block">Select your role</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLES.map(r => (
                        <button key={r.value} type="button" onClick={() => setRole(r.value)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            role === r.value
                              ? 'border-emerald-500/60 bg-emerald-500/15 text-white'
                              : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-300'
                          }`}>
                          <div className="text-lg mb-0.5">{r.emoji}</div>
                          <div className="text-xs font-semibold">{r.label}</div>
                          <div className="text-xs text-slate-500">{r.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow text-sm flex items-center justify-center gap-2 disabled:opacity-70">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      Processing…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {isRegister ? 'Create Account' : 'Sign In'}
                    </span>
                  )}
                </motion.button>
              </form>

              <p className="text-center text-xs text-slate-600 mt-6">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button onClick={() => setIsRegister(!isRegister)}
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                  {isRegister ? 'Sign In' : 'Create one free'}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
