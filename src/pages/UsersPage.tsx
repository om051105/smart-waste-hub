import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, MapPin, UserCheck, Shield, Hammer, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []));
  }, []);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.area?.toLowerCase().includes(search.toLowerCase())
  );

  const roles = [
    { id: 'citizen', label: 'Citizens', icon: UserCheck, color: 'text-blue-500' },
    { id: 'worker', label: 'Workers', icon: Hammer, color: 'text-amber-500' },
    { id: 'admin', label: 'Admins', icon: Shield, color: 'text-rose-500' },
    { id: 'champion', label: 'Champions', icon: Award, color: 'text-emerald-500' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">User Directory</h1>
        <p className="text-muted-foreground mt-2">Manage and view registered members across all sections.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name, email or area..." 
          className="pl-10"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="citizen" className="w-full">
        <TabsList className="bg-muted/50 p-1">
          {roles.map(r => (
            <TabsTrigger key={r.id} value={r.id} className="gap-2 px-6">
              <r.icon className="w-4 h-4" />
              {r.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {roles.map(r => (
          <TabsContent key={r.id} value={r.id} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.filter(u => u.role === r.id).length === 0 ? (
                <p className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                  No {r.label.toLowerCase()} found matching your search.
                </p>
              ) : (
                filteredUsers.filter(u => u.role === r.id).map(user => (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={user._id}>
                    <Card className="hover:shadow-md transition-all border-border/50">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className={`p-2 rounded-lg ${r.color} bg-current/10`}>
                            <r.icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                            ID: {user._id.slice(-6)}
                          </span>
                        </div>
                        <CardTitle className="text-lg mt-3">{user.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          <span>{user.area || 'No Location Set'}</span>
                        </div>
                        <div className="mt-4 flex gap-2">
                           <div className="text-[10px] px-2 py-1 rounded bg-secondary font-medium">
                              Score: {user.complianceScore}
                           </div>
                           <div className="text-[10px] px-2 py-1 rounded bg-secondary font-medium text-primary">
                              Points: {user.rewardPoints}
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
