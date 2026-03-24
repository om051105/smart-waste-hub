import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileWarning, MapPin, Send, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { getComplaints, addComplaint, updateComplaintStatus, Complaint } from '@/lib/mockData';
import { User } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function ComplaintsPage({ user }: { user: User }) {
  const [complaints, setComplaints] = useState(getComplaints());
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const isAdmin = user.role === 'admin';

  const handleSubmit = () => {
    if (!desc.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      const c = addComplaint({
        userId: user.id,
        userName: user.name,
        image: '',
        location: { lat: 28.61 + Math.random() * 0.02, lng: 77.2 + Math.random() * 0.02 },
        description: desc,
      });
      setComplaints(prev => [...prev, c]);
      setDesc('');
      setSubmitting(false);
      toast({ title: 'Complaint submitted successfully!' });
    }, 800);
  };

  const handleStatusChange = (id: string, status: Complaint['status']) => {
    updateComplaintStatus(id, status);
    setComplaints(getComplaints());
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
          <Button className="gradient-primary text-primary-foreground" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Submit Complaint
          </Button>
        </div>
      )}

      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="font-display font-semibold mb-4">{isAdmin ? 'All Complaints' : 'Your Complaints'}</h3>
        <div className="space-y-3">
          {complaints.filter(c => isAdmin || c.userId === user.id).map(c => (
            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="mt-1">{statusIcon(c.status)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{c.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.userName} · {c.createdAt}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  c.status === 'pending' ? 'bg-warning/20 text-warning' :
                  c.status === 'in_progress' ? 'bg-info/20 text-info' :
                  'bg-success/20 text-success'
                }`}>{c.status.replace('_', ' ')}</span>
                {isAdmin && c.status !== 'resolved' && (
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange(c.id, c.status === 'pending' ? 'in_progress' : 'resolved')}>
                    {c.status === 'pending' ? 'Start' : 'Resolve'}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
