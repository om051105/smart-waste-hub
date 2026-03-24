import { Truck, MapPin } from 'lucide-react';
import { mockCollections } from '@/lib/mockData';

export default function CollectionsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold font-display flex items-center gap-2"><Truck className="w-6 h-6 text-primary" /> Collections</h2>
        <p className="text-muted-foreground">Manage waste collection routes</p>
      </div>
      <div className="space-y-3">
        {mockCollections.map(c => (
          <div key={c.id} className="bg-card rounded-2xl p-5 shadow-card flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              c.status === 'completed' ? 'bg-success/20 text-success' :
              c.status === 'missed' ? 'bg-destructive/20 text-destructive' : 'bg-info/20 text-info'
            }`}><Truck className="w-5 h-5" /></div>
            <div className="flex-1">
              <p className="font-medium text-sm">{c.area}</p>
              <p className="text-xs text-muted-foreground">{c.households} households · {c.date}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              c.status === 'completed' ? 'bg-success/20 text-success' :
              c.status === 'missed' ? 'bg-destructive/20 text-destructive' : 'bg-info/20 text-info'
            }`}>{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
