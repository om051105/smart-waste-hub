export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  image: string;
  location: { lat: number; lng: number };
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface WasteCollection {
  id: string;
  workerId: string;
  area: string;
  status: 'pending' | 'completed' | 'missed';
  date: string;
  households: number;
}

export interface TrainingRecord {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  score: number;
  completedAt?: string;
}

export interface AIItem {
  name: string;
  category: 'Green' | 'Blue' | 'Red';
  confidence: number;
  reason: string;
}

export interface AIResult {
  items: AIItem[];
  final_recommendation: string;
}

export interface Facility {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  address: string;
}

// Auto-refresh interval — all queries will re-fetch every 5 seconds automatically
export const POLL_INTERVAL = 5000;
const API_BASE = '/api';

export async function fetchComplaints(): Promise<Complaint[]> {
  const res = await fetch(`${API_BASE}/complaints`);
  return res.json();
}

export async function addComplaint(c: Omit<Complaint, 'id' | 'createdAt' | 'status'>): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(c)
  });
  return res.json();
}

export async function updateComplaintStatus(id: string, status: Complaint['status']): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/complaints/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
}

export async function fetchCollections(): Promise<WasteCollection[]> {
  const res = await fetch(`${API_BASE}/collections`);
  return res.json();
}

export async function updateCollectionStatus(id: string, status: WasteCollection['status']): Promise<WasteCollection> {
  const res = await fetch(`${API_BASE}/collections/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
}

export async function fetchFacilities(): Promise<Facility[]> {
  const res = await fetch(`${API_BASE}/facilities`);
  return res.json();
}

export async function fetchLeaderboard(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/users/leaderboard`);
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  return res.json();
}
