import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, FileWarning, Recycle, GraduationCap, Trophy, MapPin,
  Camera, Truck, Users, BarChart3, LogOut, Menu, X, Leaf, ChevronRight,
  Shield, ClipboardCheck
} from 'lucide-react';
import { User, logout, UserRole } from '@/lib/auth';

const roleMenus: Record<UserRole, { label: string; icon: React.ElementType; path: string }[]> = {
  citizen: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'AI Detection', icon: Camera, path: '/ai-detect' },
    { label: 'Complaints', icon: FileWarning, path: '/complaints' },
    { label: 'Training', icon: GraduationCap, path: '/training' },
    { label: 'Rewards', icon: Trophy, path: '/rewards' },
    { label: 'Facilities', icon: MapPin, path: '/facilities' },
  ],
  worker: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Collections', icon: Truck, path: '/collections' },
    { label: 'Report Issue', icon: FileWarning, path: '/complaints' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { label: 'Users', icon: Users, path: '/users' },
    { label: 'Complaints', icon: FileWarning, path: '/complaints' },
    { label: 'Facilities', icon: MapPin, path: '/facilities' },
  ],
  champion: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Inspections', icon: ClipboardCheck, path: '/inspections' },
    { label: 'Complaints', icon: FileWarning, path: '/complaints' },
    { label: 'Facilities', icon: MapPin, path: '/facilities' },
  ],
};

const roleLabels: Record<UserRole, string> = {
  citizen: 'Citizen',
  worker: 'Waste Worker',
  admin: 'Administrator',
  champion: 'Green Champion',
};

export default function DashboardLayout({ user, children }: { user: User; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menu = roleMenus[user.role];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 gradient-dark flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display text-sidebar-foreground">WasteWise+</h1>
            <p className="text-xs text-sidebar-foreground/60">AI Waste Governance</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-sidebar-foreground/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent p-3">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60 flex items-center gap-1">
                <Shield className="w-3 h-3" /> {roleLabels[user.role]}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {menu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20' 
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'}
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm text-sidebar-foreground/70 hover:text-destructive hover:bg-sidebar-accent transition-all">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-4 px-6 py-4 border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Recycle className="w-4 h-4 text-primary" />
            Score: <span className="font-bold text-foreground">{user.complianceScore}</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
