import { Navigate } from 'react-router-dom';
import { getSession } from '@/lib/auth';

export default function Index() {
  const user = getSession();
  if (user) return <Navigate to="/dashboard" />;
  return <Navigate to="/login" />;
}
