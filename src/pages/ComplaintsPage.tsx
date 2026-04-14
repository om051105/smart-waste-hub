import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileWarning, MapPin, Send, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchComplaints, addComplaint, updateComplaintStatus, Complaint } from '@/lib/api';
import { User } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function ComplaintsPage({ user }: { user: User }) {
  const [desc, setDesc] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = user.role === 'admin' || user.role === 'champion';

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: fetchComplaints
  });

  const submitMutation = useMutation({
    mutationFn: (newComplaint: any) => addComplaint(newComplaint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      setDesc('');
      toast({ title: 'Complaint submitted successfully!' });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: Complaint['status'] }) => updateComplaintStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast({ title: 'Status updated' });
    }
  });

  const handleSubmit = () => {
    if (!desc.trim()) return;
    submitMutation.mutate({
      userId: user.id || user._id,
      userName: user.name,
      location: { lat: 28.61 + Math.random() * 0.02, lng: 77.2 + Math.random() * 0.02 },
      description: desc,
    });
  };

  const statusIcon = (s: string) => {
    if (s === 'resolved') return <CheckCircle className="w-4 h-4 text-success" />;
    if (s === 'in_progress') return <Loader2 className="w-4 h-4 text-info" />;
    return <Clock className="w-4 h-4 text-warning" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold font-display flex items-center gap-2"><FileWarning className="w-6 h-6 text-primary" /> Complaints</h2>
        <p className="text-muted-foreground">{isAdmin ? 'Manage all complaints' : 'Report & track issues'}</p>
      </div>

      {!isAdmin && (
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-display font-semibold mb-3">Report an Issue</h3>
          <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe the waste management issue..." className="mb-3" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <MapPin className="w-3 h-3" /> Location will be auto-detected
          </div>
          <Button className="gradient-primary text-primary-foreground" onClick={handleSubmit} disabled={submitMutation.isPending}>
            {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Submit Complaint
          </Button>
        </div>
      )}

      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="font-display font-semibold mb-4">{isAdmin ? 'All Complaints' : 'Your Complaints'}</h3>
        
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : complaints.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No complaints found.</p>
        ) : (
          <div className="space-y-3">
            {complaints.filter(c => isAdmin || c.userId === (user.id || user._id)).map(c => (
              <motion.div key={c.id || c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                <div className="mt-1">{statusIcon(c.status)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{c.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.userName} · {new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    c.status === 'pending' ? 'bg-warning/20 text-warning' :
                    c.status === 'in_progress' ? 'bg-info/20 text-info' :
                    'bg-success/20 text-success'
                  }`}>{c.status.replace('_', ' ')}</span>
                  
                  {isAdmin && c.status !== 'resolved' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      disabled={updateStatusMutation.isPending}
                      onClick={() => updateStatusMutation.mutate({ 
                        id: c.id || c._id as string, 
                        status: c.status === 'pending' ? 'in_progress' : 'resolved' 
                      })}
                    >
                      {c.status === 'pending' ? 'Start' : 'Resolve'}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
