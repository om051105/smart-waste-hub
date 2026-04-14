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
    
    // Get text body first to handle cases where it is not JSON (like Vercel 500/404 pages)
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch (e) { data = { error: 'Unknown server error' }; }

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    const user = data;
    user.id = user._id; // Map MongoDB _id to id for frontend compatibility
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  } catch (err: any) {
    console.error('Login error:', err);
    throw new Error(err.message || 'Server connection failed');
  }
}

export async function register(name: string, email: string, password: string, role: UserRole, area: string): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, area })
    });
    
    const text = await res.text();
    let data;
    try { 
      data = JSON.parse(text); 
    } catch (e) { 
      // This means Vercel sent back HTML (like a 500 or 504 error page). 
      // Let's grab the first line of the HTML page to know what Vercel crashed on.
      const rawHtmlMsg = text.replace(/<[^>]*>?/gm, '').split('\n').filter(l => l.trim().length > 0)[0] || 'Unknown HTML error';
      data = { error: `Vercel Infrastructure Error: ${rawHtmlMsg.substring(0, 50)}...` }; 
    }

    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    
    const user = data;
    user.id = user._id;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  } catch (err: any) {
    console.error('Register error:', err);
    throw new Error(err.message || 'Connection lost. Please refresh and try again.');
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
