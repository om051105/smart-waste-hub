import { Navigate } from 'react-router-dom';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';

interface ProtectedPageProps {
  children: React.ReactNode;
}

export default function ProtectedPage({ children }: ProtectedPageProps) {
  const user = getSession();
  if (!user) return <Navigate to="/login" />;
  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
