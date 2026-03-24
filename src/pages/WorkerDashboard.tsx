import { motion } from 'framer-motion';
import { Truck, CheckCircle, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { User } from '@/lib/auth';
import { mockCollections } from '@/lib/mockData';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';

export default function WorkerDashboard({ user }: { user: User }) {
  const collections = mockCollections;
  const completed = collections.filter(c => c.status === 'completed').length;
  const missed = collections.filter(c => c.status === 'missed').length;
  const pending = collections.filter(c => c.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold font-display">Worker Dashboard</h2>
        <p className="text-muted-foreground">Your collection routes & tasks</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Completed" value={completed} icon={CheckCircle} variant="primary" />
        <StatCard title="Pending" value={pending} icon={Clock} variant="info" />
        <StatCard title="Missed" value={missed} icon={AlertTriangle} variant="warning" />
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-primary" /> Today's Routes</h3>
        <div className="space-y-3">
          {collections.map(c => (
            <motion.div key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                c.status === 'completed' ? 'bg-success/20 text-success' :
                c.status === 'missed' ? 'bg-destructive/20 text-destructive' :
                'bg-info/20 text-info'
              }`}>
                {c.status === 'completed' ? <CheckCircle className="w-5 h-5" /> :
                 c.status === 'missed' ? <AlertTriangle className="w-5 h-5" /> :
                 <Clock className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{c.area}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.households} households · {c.date}</p>
              </div>
              {c.status === 'pending' && (
                <Button size="sm" className="gradient-primary text-primary-foreground">Mark Done</Button>
              )}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                c.status === 'completed' ? 'bg-success/20 text-success' :
                c.status === 'missed' ? 'bg-destructive/20 text-destructive' :
                'bg-info/20 text-info'
              }`}>{c.status}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Simulated map */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Route Map</h3>
        <div className="h-64 rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-sm">
          <div className="text-center">
            <MapPin className="w-10 h-10 mx-auto mb-2 text-primary/40" />
            <p>Interactive map with Mapbox/Google Maps</p>
            <p className="text-xs mt-1">Connect a map provider to enable live tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
}
