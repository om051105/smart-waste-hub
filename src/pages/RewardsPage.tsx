import { motion } from 'framer-motion';
import { Trophy, Award, TrendingUp, AlertTriangle, Star } from 'lucide-react';
import { User } from '@/lib/auth';
import { leaderboard } from '@/lib/mockData';
import { Progress } from '@/components/ui/progress';

export default function RewardsPage({ user }: { user: User }) {
  const badges = [
    { name: 'Green Citizen', desc: 'Score above 80', icon: Award, earned: user.complianceScore >= 80, color: 'bg-success/20 text-success' },
    { name: 'Training Pro', desc: 'All trainings complete', icon: Star, earned: false, color: 'bg-info/20 text-info' },
    { name: 'Reporter', desc: 'Filed 3+ complaints', icon: TrendingUp, earned: true, color: 'bg-warning/20 text-warning' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold font-display flex items-center gap-2"><Trophy className="w-6 h-6 text-warning" /> Rewards & Compliance</h2>
        <p className="text-muted-foreground">Track your progress and earn badges</p>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-card text-center">
        <p className="text-sm text-muted-foreground mb-2">Your Compliance Score</p>
        <p className="text-5xl font-bold font-display text-gradient mb-4">{user.complianceScore}</p>
        <Progress value={user.complianceScore} className="h-4 mb-2" />
        <p className="text-xs text-muted-foreground">Reward Points: <span className="font-bold text-foreground">{user.rewardPoints}</span></p>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="font-display font-semibold mb-4">Score Breakdown</h3>
        <div className="space-y-2 text-sm">
          {[{ label: 'Training Completed', pts: '+20', c: 'text-success' },
            { label: 'Correct Segregation', pts: '+10', c: 'text-success' },
            { label: 'Complaint Filed Against', pts: '-15', c: 'text-destructive' },
            { label: 'Repeated Violation', pts: '-30', c: 'text-destructive' }].map(r => (
            <div key={r.label} className="flex justify-between p-2 rounded-lg bg-muted/50">
              <span>{r.label}</span><span className={`font-bold ${r.c}`}>{r.pts}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="font-display font-semibold mb-4">Your Badges</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {badges.map(b => (
            <motion.div key={b.name} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className={`p-4 rounded-xl text-center border ${b.earned ? 'border-primary/20 bg-secondary' : 'border-border opacity-50'}`}>
              <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center ${b.color}`}>
                <b.icon className="w-6 h-6" />
              </div>
              <p className="font-medium text-sm">{b.name}</p>
              <p className="text-xs text-muted-foreground">{b.desc}</p>
              {b.earned && <p className="text-xs text-success mt-1">✓ Earned</p>}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-warning" /> Leaderboard</h3>
        <div className="space-y-2">
          {leaderboard.map(l => (
            <div key={l.rank} className={`flex items-center gap-3 p-3 rounded-xl ${l.name === user.name ? 'bg-secondary border border-primary/20' : 'bg-muted/50'}`}>
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${l.rank <= 3 ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{l.rank}</span>
              <div className="flex-1"><p className="text-sm font-medium">{l.name}</p></div>
              <span className="text-sm font-bold">{l.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
