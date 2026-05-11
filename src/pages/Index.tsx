import { Navigate } from 'react-router-dom';
import { getSession } from '@/lib/auth';
import LandingPage from './LandingPage';

export default function Index() {
  const user = getSession();
  if (user) return <Navigate to="/dashboard" />;
  return <LandingPage />;
}
