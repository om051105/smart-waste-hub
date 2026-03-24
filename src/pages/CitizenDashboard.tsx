import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Trophy, Camera, FileWarning, GraduationCap, TrendingUp, Award, AlertTriangle } from 'lucide-react';
import { User } from '@/lib/auth';
import { wasteStats, leaderboard, getComplaints, mockTrainings } from '@/lib/mockData';
import StatCard from '@/components/StatCard';
import { Progress } from '@/components/ui/progress';

function getBadge(score: number) {
  if (score >= 80) return { label: 'Green Citizen', color: 'bg-success text-success-foreground', icon: Award };
  if (score >= 50) return { label: 'On Track', color: 'bg-warning text-warning-foreground', icon: TrendingUp };
  return { label: 'Needs Attention', color: 'bg-destructive text-destructive-foreground', icon: AlertTriangle };
}

export default function CitizenDashboard({ user }: { user: User }) {
  const complaints = getComplaints().filter(c => c.userId === user.id);
  const badge = getBadge(user.complianceScore);
  const trainingsCompleted = mockTrainings.filter(t => t.completed).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold font-display">Welcome, {user.name} 👋</h2>
        <p className="text-muted-foreground">Here's your waste management overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Compliance Score" value={user.complianceScore} icon={TrendingUp} variant="primary" trend="+5 this month" />
        <StatCard title="Reward Points" value={user.rewardPoints} icon={Trophy} trend="Earn more by segregating!" />
        <StatCard title="Complaints Filed" value={complaints.length} icon={FileWarning} />
        <StatCard title="Trainings Done" value={`${trainingsCompleted}/${mockTrainings.length}`} icon={GraduationCap} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 shadow-card lg:col-span-2">
          <h3 className="font-display font-semibold mb-4">Compliance Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={wasteStats.compliance}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Badge + Score */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 shadow-card flex flex-col items-center justify-center text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 ${badge.color}`}>
            <badge.icon className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-lg">{badge.label}</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Your current status</p>
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span>Score</span>
              <span className="font-bold">{user.complianceScore}/100</span>
            </div>
            <Progress value={user.complianceScore} className="h-3" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste distribution */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-display font-semibold mb-4">Waste Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={wasteStats.distribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {wasteStats.distribution.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Leaderboard */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-warning" /> Leaderboard</h3>
          <div className="space-y-3">
            {leaderboard.map(l => (
              <div key={l.rank} className={`flex items-center gap-3 p-3 rounded-xl ${l.name === user.name ? 'bg-secondary border border-primary/20' : 'bg-muted/50'}`}>
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${l.rank <= 3 ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{l.rank}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{l.area}</p>
                </div>
                <span className="text-sm font-bold">{l.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
