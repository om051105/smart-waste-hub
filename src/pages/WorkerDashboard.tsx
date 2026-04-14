import { motion } from 'framer-motion';
import { Truck, CheckCircle, AlertTriangle, Clock, MapPin, Loader2, Navigation } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@/lib/auth';
import { fetchCollections, updateCollectionStatus, POLL_INTERVAL } from '@/lib/api';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';

export default function WorkerDashboard({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: fetchCollections,
    refetchInterval: POLL_INTERVAL
  });

  const markDoneMutation = useMutation({
    mutationFn: (id: string) => updateCollectionStatus(id, 'completed'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collections'] })
  });

  const workerCollections = collections.filter((c: any) => c.workerId === (user.id || user._id));
  const completed = workerCollections.filter((c: any) => c.status === 'completed').length;
  const missed = workerCollections.filter((c: any) => c.status === 'missed').length;
  const pending = workerCollections.filter((c: any) => c.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold font-display">Worker Dashboard</h2>
        <p className="text-muted-foreground">Your collection routes & tasks</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Completed" value={completed} icon={CheckCircle} variant="primary" />
        <StatCard title="Pending" value={pending} icon={Clock} variant="info" />
        <StatCard title="Missed" value={missed} icon={AlertTriangle} variant="warning" />
      </div>
      )}

      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-primary" /> Today's Routes</h3>
        {isLoading ? (
          <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : workerCollections.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No routes assigned today.</p>
        ) : (
        <div className="space-y-3">
          {workerCollections.map((c: any) => (
            <motion.div key={c.id || c._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
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
                <Button 
                  size="sm" 
                  className="gradient-primary text-primary-foreground"
                  disabled={markDoneMutation.isPending}
                  onClick={() => markDoneMutation.mutate(c.id || c._id)}
                >Mark Done</Button>
              )}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                c.status === 'completed' ? 'bg-success/20 text-success' :
                c.status === 'missed' ? 'bg-destructive/20 text-destructive' :
                'bg-info/20 text-info'
              }`}>{c.status}</span>
            </motion.div>
          ))}
        </div>
        )}
      </div>

      {/* Simulated map */}
      <div className="bg-card rounded-2xl p-6 shadow-card overflow-hidden">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Route Map</h3>
        <div className="h-64 rounded-xl bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=28.6139,77.2090&zoom=14&size=800x400&style=feature:all|element:labels|visibility:off&style=feature:road|element:geometry|color:0xdddddd&sensor=false')] bg-cover bg-center flex items-center justify-center relative">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]"></div>
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-background rounded-full mx-auto flex items-center justify-center shadow-lg mb-3 border border-border">
              <Navigation className="w-8 h-8 text-primary" />
            </div>
            <p className="font-semibold text-foreground">Interactive Route Overview</p>
            <p className="text-sm text-muted-foreground mt-1">Live from Backend Data</p>
          </div>
        </div>
      </div>
    </div>
  );
}
