import { Navigate } from 'react-router-dom';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import CitizenDashboard from './CitizenDashboard';
import AdminDashboard from './AdminDashboard';
import WorkerDashboard from './WorkerDashboard';
import ChampionDashboard from './ChampionDashboard';

export default function DashboardPage() {
  const user = getSession();
  if (!user) return <Navigate to="/auth" />;

  const dashboards = {
    citizen: <CitizenDashboard user={user} />,
    admin: <AdminDashboard user={user} />,
    worker: <WorkerDashboard user={user} />,
    champion: <ChampionDashboard user={user} />,
  };

  return (
    <DashboardLayout user={user}>
      {dashboards[user.role]}
    </DashboardLayout>
  );
}
