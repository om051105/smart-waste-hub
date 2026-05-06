import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Eye, EyeOff, ArrowRight, Sparkles, Shield, Users, Recycle, Trophy, ArrowLeft, Phone } from 'lucide-react';
import { login, register, UserRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { auth, googleProvider, RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup } from '@/lib/firebase';

/* ─── Particle Canvas ─────────────────────────────────────── */
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
        ctx.fillStyle = 'rgba(74,222,168,0.6)';
        ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(74,222,168,${0.18 * (1 - d / 120)})`;
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
      animate={{ opacity: 0.2, scale: 1 }}
      transition={{ delay, duration: 0.8, ease: 'easeOut' }}
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
    >
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 5 + delay, ease: 'easeInOut' }}
      >
        <Icon size={size} className="text-emerald-300" />
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
// ── Save social user to Firestore via backend ───────────────────────────────
async function saveSocialUser(user: { uid: string; name: string | null; email: string | null; phone: string | null; provider: string }) {
  const res = await fetch('/api/auth/social-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error('Failed to save user');
  return res.json();
}

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Phone OTP state
  const [phoneMode, setPhoneMode] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaRef = useRef<any>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  // ── Google Sign-In ────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const dbUser = await saveSocialUser({
        uid:      fbUser.uid,
        name:     fbUser.displayName,
        email:    fbUser.email,
        phone:    fbUser.phoneNumber,
        provider: 'google',
      });
      localStorage.setItem('user', JSON.stringify(dbUser));
      toast({ title: `Welcome, ${dbUser.name}! 🎉`, description: 'Signed in with Google.' });
      navigate('/dashboard');
    } catch (err: any) {
      toast({ title: 'Google Sign-In Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Phone — Send OTP ─────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!phone) return;
    setIsLoading(true);
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      }
      const result = await signInWithPhoneNumber(auth, phone, recaptchaRef.current);
      setConfirmationResult(result);
      setOtpSent(true);
      toast({ title: 'OTP Sent! 📱', description: `Code sent to ${phone}` });
    } catch (err: any) {
      toast({ title: 'Failed to send OTP', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Phone — Verify OTP ───────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (!otp || !confirmationResult) return;
    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const fbUser = result.user;
      const dbUser = await saveSocialUser({
        uid:      fbUser.uid,
        name:     fbUser.displayName || `User_${fbUser.uid.slice(0, 6)}`,
        email:    fbUser.email,
        phone:    fbUser.phoneNumber,
        provider: 'phone',
      });
      localStorage.setItem('user', JSON.stringify(dbUser));
      toast({ title: 'Phone Verified! 🎉', description: 'Signed in successfully.' });
      navigate('/dashboard');
    } catch (err: any) {
      toast({ title: 'OTP Verification Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071e14] text-white overflow-hidden relative">

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
      {/* Green overlay with dot texture */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: 'rgba(7, 30, 20, 0.72)',
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(52,211,153,0.12) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* ── Particle canvas ── */}
      <div className="absolute inset-0 z-[1]">
        <ParticleCanvas />
      </div>

      {/* ── Radial glows ── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none z-[1]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-teal-500/[0.12] blur-[100px] pointer-events-none z-[1]" />
      <div className="absolute top-2/3 left-1/4 w-[350px] h-[350px] rounded-full bg-green-500/10 blur-[100px] pointer-events-none z-[1]" />

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
            <span className="font-bold text-lg tracking-tight font-display">
              WasteWise<span className="text-emerald-400">+</span>
            </span>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-emerald-200/60 hover:text-white transition-colors"
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
                <div className="relative rounded-3xl border border-emerald-500/15 bg-emerald-950/40 backdrop-blur-xl p-8 md:p-10 shadow-2xl shadow-emerald-900/30 overflow-hidden">

                  {/* Inner glow */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-emerald-500/15 blur-[60px] pointer-events-none" />
                  <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-teal-500/15 blur-[50px] pointer-events-none" />

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10"
                  >
                    {/* Badge */}
                    <motion.div variants={itemVariants}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 text-xs font-medium mb-6"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isRegister ? 'Join the Platform' : 'Welcome Back'}
                    </motion.div>

                    {/* Heading */}
                    <motion.h1 variants={itemVariants}
                      className="text-3xl md:text-4xl font-bold font-display mb-2"
                    >
                      {isRegister ? (
                        <>Create your <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-green-300 bg-clip-text text-transparent">account</span></>
                      ) : (
                        <>Sign in to <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-green-300 bg-clip-text text-transparent">WasteWise+</span></>
                      )}
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-emerald-200/50 mb-8">
                      {isRegister ? 'Join thousands building greener communities.' : 'Access your dashboard and make an impact.'}
                    </motion.p>

                    {/* ── Social Sign-In Buttons ── */}
                    <motion.div variants={itemVariants} className="space-y-3 mb-6">
                      {/* Google */}
                      <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={handleGoogleSignIn} disabled={isLoading}
                        className="w-full h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-3 text-sm font-medium text-white transition-all">
                        {/* Google icon SVG */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </motion.button>

                      {/* Phone */}
                      <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setPhoneMode(!phoneMode)} disabled={isLoading}
                        className="w-full h-11 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 flex items-center justify-center gap-3 text-sm font-medium text-emerald-300 transition-all">
                        <Phone className="w-4 h-4" />
                        Continue with Phone Number
                      </motion.button>

                      {/* Phone OTP flow */}
                      <AnimatePresence>
                        {phoneMode && (
                          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                            className="space-y-3 overflow-hidden">
                            <div className="flex gap-2">
                              <Input value={phone} onChange={e => setPhone(e.target.value)}
                                placeholder="+91 9876543210" disabled={otpSent}
                                className="h-11 bg-emerald-950/50 border-emerald-500/20 text-white placeholder:text-emerald-200/30 rounded-xl flex-1" />
                              {!otpSent && (
                                <button type="button" onClick={handleSendOtp} disabled={isLoading || !phone}
                                  className="px-4 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50">
                                  {isLoading ? '...' : 'Send OTP'}
                                </button>
                              )}
                            </div>
                            {otpSent && (
                              <div className="flex gap-2">
                                <Input value={otp} onChange={e => setOtp(e.target.value)}
                                  placeholder="Enter 6-digit OTP"
                                  className="h-11 bg-emerald-950/50 border-emerald-500/20 text-white placeholder:text-emerald-200/30 rounded-xl flex-1" />
                                <button type="button" onClick={handleVerifyOtp} disabled={isLoading || !otp}
                                  className="px-4 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-50">
                                  {isLoading ? '...' : 'Verify'}
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* invisible reCAPTCHA container */}
                      <div id="recaptcha-container" />

                      {/* Divider */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-emerald-500/10" />
                        <span className="text-xs text-emerald-300/30">or sign in with email</span>
                        <div className="flex-1 h-px bg-emerald-500/10" />
                      </div>
                    </motion.div>

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
                            <Label className="text-sm text-emerald-100/70 font-medium">Full Name</Label>
                            <Input
                              value={name}
                              onChange={e => setName(e.target.value)}
                              placeholder="Your name"
                              required
                              className="mt-1.5 h-11 bg-emerald-950/50 border-emerald-500/20 text-white placeholder:text-emerald-200/30 focus:border-emerald-400/50 focus:ring-emerald-400/20 rounded-xl transition-all"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Email */}
                      <div>
                        <Label className="text-sm text-emerald-100/70 font-medium">Email</Label>
                        <Input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="mt-1.5 h-11 bg-emerald-950/50 border-emerald-500/20 text-white placeholder:text-emerald-200/30 focus:border-emerald-400/50 focus:ring-emerald-400/20 rounded-xl transition-all"
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <Label className="text-sm text-emerald-100/70 font-medium">Password</Label>
                        <div className="relative mt-1.5">
                          <Input
                            type={showPw ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="h-11 bg-emerald-950/50 border-emerald-500/20 text-white placeholder:text-emerald-200/30 focus:border-emerald-400/50 focus:ring-emerald-400/20 rounded-xl transition-all pr-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-300/40 hover:text-emerald-200 transition-colors"
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
                            <Label className="text-sm text-emerald-100/70 font-medium mb-2 block">Select Your Role</Label>
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
                                        : 'border-emerald-500/10 bg-emerald-950/30 hover:border-emerald-500/20 hover:bg-emerald-900/30'
                                    }`}
                                  >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                      isActive ? `bg-gradient-to-br ${r.color}` : 'bg-emerald-900/50'
                                    }`}>
                                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-emerald-400/40'}`} />
                                    </div>
                                    <div className="min-w-0">
                                      <div className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-emerald-200/60'}`}>{r.label}</div>
                                      <div className={`text-[10px] ${isActive ? 'text-emerald-100/60' : 'text-emerald-300/30'}`}>{r.desc}</div>
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
                      <span className="text-sm text-emerald-200/40">
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
                </div>

                {/* ── Trust indicators beneath card ── */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="mt-6 flex items-center justify-center gap-6 text-xs text-emerald-300/30"
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
          className="px-6 py-4 text-center text-xs text-emerald-300/30"
        >
          © {new Date().getFullYear()} WasteWise+. All rights reserved.
        </motion.footer>

      </div>
    </div>
  );
}
