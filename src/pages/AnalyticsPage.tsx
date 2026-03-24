import { Navigate } from 'react-router-dom';
import { getSession } from '@/lib/auth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { wasteStats } from '@/lib/mockData';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold font-display">Analytics</h2>
        <p className="text-muted-foreground">Detailed waste management insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-display font-semibold mb-4">Monthly Waste by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wasteStats.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="organic" fill="hsl(152, 60%, 36%)" radius={[4,4,0,0]} />
              <Bar dataKey="plastic" fill="hsl(38, 92%, 50%)" radius={[4,4,0,0]} />
              <Bar dataKey="metal" fill="hsl(210, 80%, 55%)" radius={[4,4,0,0]} />
              <Bar dataKey="glass" fill="hsl(280, 60%, 55%)" radius={[4,4,0,0]} />
              <Bar dataKey="hazardous" fill="hsl(0, 72%, 51%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-display font-semibold mb-4">Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={wasteStats.distribution} cx="50%" cy="50%" innerRadius={65} outerRadius={110} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                {wasteStats.distribution.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card lg:col-span-2">
          <h3 className="font-display font-semibold mb-4">Compliance Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={wasteStats.compliance}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
