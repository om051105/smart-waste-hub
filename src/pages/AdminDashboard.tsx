import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, FileWarning, TrendingUp, Recycle, Download, Loader2 } from 'lucide-react';
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
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: POLL_INTERVAL
  });
  
  const pending = complaints.filter((c: any) => c.status === 'pending').length;
  const resolved = complaints.filter((c: any) => c.status === 'resolved').length;

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
            <BarChart data={[]}>
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
              <Pie data={[]} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
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
