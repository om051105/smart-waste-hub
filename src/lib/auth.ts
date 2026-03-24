export type UserRole = 'citizen' | 'worker' | 'admin' | 'champion';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  complianceScore: number;
  rewardPoints: number;
  avatar?: string;
  area?: string;
  createdAt: string;
}

const USERS_KEY = 'wastewise_users';
const SESSION_KEY = 'wastewise_session';

const defaultUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@wastewise.com', role: 'admin', complianceScore: 100, rewardPoints: 500, createdAt: '2024-01-01' },
  { id: '2', name: 'Jane Citizen', email: 'jane@example.com', role: 'citizen', complianceScore: 75, rewardPoints: 120, createdAt: '2024-02-15' },
  { id: '3', name: 'Worker Mike', email: 'mike@wastewise.com', role: 'worker', complianceScore: 90, rewardPoints: 200, area: 'Zone A', createdAt: '2024-01-20' },
  { id: '4', name: 'Green Sara', email: 'sara@wastewise.com', role: 'champion', complianceScore: 95, rewardPoints: 350, area: 'Zone B', createdAt: '2024-03-01' },
];

function getUsers(): (User & { password: string })[] {
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    const usersWithPw = defaultUsers.map(u => ({ ...u, password: 'password123' }));
    localStorage.setItem(USERS_KEY, JSON.stringify(usersWithPw));
    return usersWithPw;
  }
  return JSON.parse(stored);
}

export function login(email: string, password: string): User | null {
  const users = getUsers();
  const found = users.find(u => u.email === email && u.password === password);
  if (!found) return null;
  const { password: _, ...user } = found;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function register(name: string, email: string, password: string, role: UserRole): User | null {
  const users = getUsers();
  if (users.find(u => u.email === email)) return null;
  const newUser = {
    id: crypto.randomUUID(),
    name, email, password, role,
    complianceScore: 50, rewardPoints: 0,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  const { password: _, ...user } = newUser;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
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
