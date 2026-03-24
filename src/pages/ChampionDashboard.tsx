import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, CheckCircle, AlertTriangle, Send, MapPin, Shield } from 'lucide-react';
import { User } from '@/lib/auth';
import { getComplaints, updateComplaintStatus } from '@/lib/mockData';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function ChampionDashboard({ user }: { user: User }) {
  const complaints = getComplaints();
  const [reportText, setReportText] = useState('');
  const { toast } = useToast();

  const handleVerify = (id: string) => {
    updateComplaintStatus(id, 'in_progress');
    toast({ title: 'Complaint verified and escalated' });
  };

  const submitReport = () => {
    if (!reportText.trim()) return;
    toast({ title: 'Inspection report submitted!' });
    setReportText('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold font-display">Green Champion Dashboard</h2>
        <p className="text-muted-foreground">Monitor {user.area || 'your assigned area'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Area Complaints" value={complaints.length} icon={AlertTriangle} variant="warning" />
        <StatCard title="Verified" value={complaints.filter(c => c.status !== 'pending').length} icon={CheckCircle} variant="primary" />
        <StatCard title="Your Score" value={user.complianceScore} icon={Shield} variant="info" />
      </div>

      {/* Complaints to verify */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-primary" /> Pending Verification</h3>
        <div className="space-y-3">
          {complaints.filter(c => c.status === 'pending').map(c => (
            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="w-10 h-10 rounded-xl bg-warning/20 text-warning flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{c.description}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {c.location.lat.toFixed(3)}, {c.location.lng.toFixed(3)} · {c.userName}
                </p>
              </div>
              <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => handleVerify(c.id)}>Verify</Button>
            </motion.div>
          ))}
          {complaints.filter(c => c.status === 'pending').length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">All complaints have been verified ✓</p>
          )}
        </div>
      </div>

      {/* Submit inspection */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Send className="w-5 h-5 text-primary" /> Submit Inspection Report</h3>
        <Textarea
          value={reportText} onChange={e => setReportText(e.target.value)}
          placeholder="Describe your inspection findings for this area..."
          className="mb-3"
        />
        <Button className="gradient-primary text-primary-foreground" onClick={submitReport}>Submit Report</Button>
      </div>
    </div>
  );
}
