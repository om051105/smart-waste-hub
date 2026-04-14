import { useState } from 'react';
import { MapPin, Search, Recycle, Leaf, Wrench, Loader2, Navigation } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchFacilities } from '@/lib/api';
import { Input } from '@/components/ui/input';

const typeIcons: Record<string, React.ElementType> = { recycling: Recycle, compost: Leaf, scrap: Wrench };
const typeColors: Record<string, string> = { recycling: 'bg-info/20 text-info', compost: 'bg-success/20 text-success', scrap: 'bg-warning/20 text-warning' };

export default function FacilitiesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  
  const { data: facilities = [], isLoading } = useQuery({
    queryKey: ['facilities'],
    queryFn: fetchFacilities
  });
  
  const filtered = facilities.filter((f: any) => {
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

      {/* Map placeholder -> Simulated interactive look */}
      <div className="bg-card rounded-2xl p-6 shadow-card overflow-hidden relative">
        <div className="h-64 rounded-xl bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=28.6139,77.2090&zoom=12&size=800x400&style=feature:all|element:labels|visibility:off&style=feature:road|element:geometry|color:0xdddddd&sensor=false')] bg-cover bg-center flex items-center justify-center relative">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]"></div>
          
          <div className="relative z-10 text-center">
             <div className="w-16 h-16 bg-background rounded-full mx-auto flex items-center justify-center shadow-lg mb-3 border border-border">
                <Navigation className="w-8 h-8 text-primary" />
             </div>
             <p className="font-semibold text-foreground">Interactive Map Region</p>
             <p className="text-sm text-muted-foreground mt-1">Live from Backend Data</p>
          </div>
          
          {/* Simulated pins */}
          {!isLoading && filtered.map((f: any, i: number) => {
             const Icon = typeIcons[f.type] || MapPin;
             // Just randomly scatter them around the map box for visual effect since it's a fixed background map
             const top = 20 + (i * 15) % 60;
             const left = 20 + (i * 25) % 60;
             return (
               <div key={f.id || f._id} className="absolute shadow-lg rounded-full w-8 h-8 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2" style={{ top: `${top}%`, left: `${left}%`, backgroundColor: 'hsl(var(--background))' }}>
                 <Icon className={`w-4 h-4 text-primary`} />
               </div>
             )
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((f: any) => {
            const Icon = typeIcons[f.type] || MapPin;
            return (
              <div key={f.id || f._id} className="bg-card rounded-2xl p-5 shadow-card flex items-start gap-4">
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
      )}
    </div>
  );
}
