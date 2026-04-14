import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { login, register, UserRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [area, setArea] = useState('');
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      const user = await register(name, email, password, role, area);
      if (!user) { toast({ title: 'Email already exists or error', variant: 'destructive' }); return; }
      navigate('/dashboard');
    } else {
      const user = await login(email, password);
      if (!user) { toast({ title: 'Invalid credentials or error', variant: 'destructive' }); return; }
      navigate('/dashboard');
    }
  };

  const roles: { value: UserRole; label: string }[] = [
    { value: 'citizen', label: 'Citizen' },
    { value: 'worker', label: 'Waste Worker' },
    { value: 'admin', label: 'Administrator' },
    { value: 'champion', label: 'Green Champion' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-dark items-center justify-center p-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-8">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold font-display text-sidebar-foreground mb-4">
            WasteWise+
          </h1>
          <p className="text-lg text-sidebar-foreground/70 mb-6">
            AI-Powered Waste Governance System for a cleaner, greener future.
          </p>
          <div className="space-y-3">
            {['Smart AI waste detection', 'Real-time compliance tracking', 'Reward-based engagement'].map(t => (
              <div key={t} className="flex items-center gap-3 text-sidebar-foreground/80">
                <div className="w-2 h-2 rounded-full bg-sidebar-primary" />
                <span className="text-sm">{t}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold font-display">WasteWise+</h1>
          </div>

          <h2 className="text-2xl font-bold font-display">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-muted-foreground mt-1 mb-6">{isRegister ? 'Join the green movement' : 'Sign in to your dashboard'}</p>


          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <Label>Full Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required className="mt-1" />
              </div>
            )}
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1" />
            </div>
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
                </div>
              </div>
            )}
            <Button type="submit" className="w-full gradient-primary text-primary-foreground h-11 font-medium">
              {isRegister ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsRegister(!isRegister)} className="text-primary font-medium hover:underline">
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
