import { useState } from 'react';
import { MapPin, Search, Recycle, Leaf, Wrench } from 'lucide-react';
import { facilities } from '@/lib/mockData';
import { Input } from '@/components/ui/input';

const typeIcons: Record<string, React.ElementType> = { recycling: Recycle, compost: Leaf, scrap: Wrench };
const typeColors: Record<string, string> = { recycling: 'bg-info/20 text-info', compost: 'bg-success/20 text-success', scrap: 'bg-warning/20 text-warning' };

export default function FacilitiesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  
  const filtered = facilities.filter(f => {
    if (filter !== 'all' && f.type !== filter) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold font-display flex items-center gap-2"><MapPin className="w-6 h-6 text-primary" /> Facility Locator</h2>
        <p className="text-muted-foreground">Find nearby recycling & composting centers</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search facilities..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          {['all', 'recycling', 'compost', 'scrap'].map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${filter === t ? 'border-primary bg-secondary text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Map placeholder */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <div className="h-48 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MapPin className="w-10 h-10 mx-auto mb-2 text-primary/40" />
            <p className="text-sm">Interactive map view</p>
            <p className="text-xs mt-1">Connect a map provider to see locations</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(f => {
          const Icon = typeIcons[f.type] || MapPin;
          return (
            <div key={f.id} className="bg-card rounded-2xl p-5 shadow-card flex items-start gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${typeColors[f.type]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm">{f.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{f.address}</p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[f.type]}`}>{f.type}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
