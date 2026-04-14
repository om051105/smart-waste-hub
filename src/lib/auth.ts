export type UserRole = 'citizen' | 'worker' | 'admin' | 'champion';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  complianceScore: number;
  rewardPoints: number;
  avatar?: string;
  area?: string;
  createdAt: string;
}

const SESSION_KEY = 'wastewise_session';

export async function login(email: string, password: string): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) return null;
    const user = await res.json();
    user.id = user._id; // Map MongoDB _id to id for frontend compatibility
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  } catch (err) {
    console.error('Login error:', err);
    return null;
  }
}

export async function register(name: string, email: string, password: string, role: UserRole, area: string): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, area })
    });
    if (!res.ok) return null;
    const user = await res.json();
    user.id = user._id;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  } catch (err) {
    console.error('Register error:', err);
    return null;
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): User | null {
  const s = localStorage.getItem(SESSION_KEY);
  return s ? JSON.parse(s) : null;
}

export function updateSession(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
