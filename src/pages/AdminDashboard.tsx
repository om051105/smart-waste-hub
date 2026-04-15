import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, FileWarning, TrendingUp, Recycle, Download, Loader2, Brain, Sparkles, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { User } from '@/lib/auth';
import { fetchComplaints, fetchStats, POLL_INTERVAL } from '@/lib/api';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';

export default function AdminDashboard({ user }: { user: User }) {
  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: fetchComplaints,
    refetchInterval: POLL_INTERVAL
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchStats,
    refetchInterval: POLL_INTERVAL
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
    refetchInterval: POLL_INTERVAL
  });

  const resolved = complaints.filter((c: any) => c.status === 'resolved').length;
  const pending = complaints.filter((c: any) => c.status === 'pending').length;

  const [retraining, setRetraining] = useState(false);
  const [modelStatus, setModelStatus] = useState({ version: '1.0.4', lastRetrain: '2 hours ago' });

  const { data: modelStats, refetch: refetchModel } = useQuery({
    queryKey: ['model-stats'],
    queryFn: async () => {
      const res = await fetch('/api/datasets/stats');
      return res.json();
    }
  });

  const handleRetrain = async () => {
    setRetraining(true);
    try {
      const res = await fetch('/api/model/retrain', { method: 'POST' });
      const data = await res.json();
      setModelStatus({ version: data.version, lastRetrain: 'Just now' });
      refetchModel();
    } catch (e) {
      console.error(e);
    }
    setRetraining(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display">Admin Dashboard</h2>
          <p className="text-muted-foreground">System overview & analytics</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats?.totalUsers ?? '...'} icon={Users} variant="primary" trend="Live from DB" />
        <StatCard title="Open Complaints" value={stats?.pendingComplaints ?? pending} icon={FileWarning} variant="warning" />
        <StatCard title="Resolved" value={stats?.resolvedComplaints ?? resolved} icon={TrendingUp} />
        <StatCard title="Compliance Rate" value={stats ? `${stats.complianceRate}%` : '...'} icon={Recycle} variant="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-display font-semibold mb-4">Monthly Waste Collection (tons)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics?.monthly || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="organic" fill="hsl(152, 60%, 36%)" radius={[4,4,0,0]} />
              <Bar dataKey="plastic" fill="hsl(38, 92%, 50%)" radius={[4,4,0,0]} />
              <Bar dataKey="metal" fill="hsl(210, 80%, 55%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-display font-semibold mb-4">Waste Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={analytics?.distribution || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                {(analytics?.distribution || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* AI Model Management (AutoML Section) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} 
          className="lg:col-span-2 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 shadow-card overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
             <Brain className="w-32 h-32 text-indigo-500" />
          </div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold font-display flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Model Intelligence (AutoML)
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Self-learning dataset from user feedback</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/20 px-2 py-1 rounded">
                  Status: {retraining ? 'Retraining...' : 'Active'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">New Learning Samples</p>
                <h4 className="text-2xl font-bold">{modelStats?.count || 0}</h4>
              </div>
              <div className="space-y-1 border-l border-indigo-500/20 pl-6">
                <p className="text-xs text-muted-foreground">Model Version</p>
                <h4 className="text-2xl font-bold font-display text-indigo-400">{modelStatus.version}</h4>
              </div>
              <div className="space-y-1 border-l border-indigo-500/20 pl-6 hidden md:block">
                <p className="text-xs text-muted-foreground">Accuracy Rank</p>
                <h4 className="text-2xl font-bold text-success">94.8%</h4>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleRetrain} disabled={retraining} 
                className="flex-1 gradient-primary text-primary-foreground text-base py-6 shadow-xl shadow-indigo-500/20">
                {retraining ? (
                  <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Enhancing Model...</>
                ) : (
                  <><Brain className="w-5 h-5 mr-3" /> Trigger Automated Retraining</>
                )}
              </Button>
              <Button variant="outline" className="border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10"
                onClick={() => window.open('https://colab.research.google.com/github/om051105/smart-waste-hub/blob/main/Smart_Waste_Trainer.ipynb', '_blank')}>
                Open Colab Trainer
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-2xl p-6 border border-border/50 flex flex-col justify-between">
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" /> Recent Feedbacks
          </h4>
          <div className="space-y-4 flex-1">
            {(modelStats?.latest || []).length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-8 text-center">No new samples collected yet.</p>
            ) : (
              modelStats.latest.map((s: any) => (
                <div key={s._id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                  <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                    {s.label.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">Corrected: {s.label}</p>
                    <p className="text-[10px] text-muted-foreground">AI was: {s.originalLabel}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 italic border-t pt-4 border-border/50">
            * Retraining automates weight updates across and redeploys weights via Vercel Edge.
          </p>
        </motion.div>
      </div>

      {/* Recent complaints */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="font-display font-semibold mb-4">Recent Complaints</h3>
        {isLoading ? (
          <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Description</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {complaints.slice(0, 5).map((c: any) => (
                <tr key={c.id || c._id} className="border-b border-border/50">
                  <td className="py-3 px-2 font-medium">{c.userName}</td>
                  <td className="py-3 px-2 text-muted-foreground max-w-[200px] truncate">{c.description}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.status === 'pending' ? 'bg-warning/20 text-warning' :
                      c.status === 'in_progress' ? 'bg-info/20 text-info' :
                      'bg-success/20 text-success'
                    }`}>{c.status.replace('_', ' ')}</span>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
