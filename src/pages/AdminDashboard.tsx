import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, FileWarning, TrendingUp, Recycle, Download } from 'lucide-react';
import { User } from '@/lib/auth';
import { wasteStats, getComplaints } from '@/lib/mockData';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';

export default function AdminDashboard({ user }: { user: User }) {
  const complaints = getComplaints();
  const pending = complaints.filter(c => c.status === 'pending').length;
  const resolved = complaints.filter(c => c.status === 'resolved').length;

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
        <StatCard title="Total Users" value={156} icon={Users} variant="primary" trend="+12 this month" />
        <StatCard title="Open Complaints" value={pending} icon={FileWarning} variant="warning" />
        <StatCard title="Resolved" value={resolved} icon={TrendingUp} />
        <StatCard title="Compliance Rate" value="78%" icon={Recycle} variant="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-display font-semibold mb-4">Monthly Waste Collection (tons)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={wasteStats.monthly}>
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
              <Pie data={wasteStats.distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                {wasteStats.distribution.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 shadow-card">
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

      {/* Recent complaints */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="font-display font-semibold mb-4">Recent Complaints</h3>
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
              {complaints.slice(0, 5).map(c => (
                <tr key={c.id} className="border-b border-border/50">
                  <td className="py-3 px-2 font-medium">{c.userName}</td>
                  <td className="py-3 px-2 text-muted-foreground max-w-[200px] truncate">{c.description}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.status === 'pending' ? 'bg-warning/20 text-warning' :
                      c.status === 'in_progress' ? 'bg-info/20 text-info' :
                      'bg-success/20 text-success'
                    }`}>{c.status.replace('_', ' ')}</span>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground">{c.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
