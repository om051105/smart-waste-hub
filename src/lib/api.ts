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

export async function fetchComplaints(): Promise<Complaint[]> {
  const res = await fetch('/api/complaints');
  return res.json();
}

export async function addComplaint(c: Omit<Complaint, 'id' | 'createdAt' | 'status'>): Promise<Complaint> {
  const res = await fetch('/api/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(c)
  });
  return res.json();
}

export async function updateComplaintStatus(id: string, status: Complaint['status']): Promise<Complaint> {
  const res = await fetch(`/api/complaints/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
}

export async function fetchCollections(): Promise<WasteCollection[]> {
  const res = await fetch('/api/collections');
  return res.json();
}

export async function fetchFacilities(): Promise<Facility[]> {
  const res = await fetch('/api/facilities');
  return res.json();
}

export async function fetchLeaderboard(): Promise<any[]> {
  const res = await fetch('/api/users/leaderboard');
  return res.json();
}

// Temporary static data until full migration
export const wasteStats = {
  monthly: [
    { month: 'Jul', organic: 320, plastic: 180, metal: 60, glass: 40, hazardous: 20 },
    { month: 'Aug', organic: 340, plastic: 170, metal: 55, glass: 45, hazardous: 18 },
    { month: 'Sep', organic: 300, plastic: 190, metal: 70, glass: 35, hazardous: 25 },
    { month: 'Oct', organic: 360, plastic: 160, metal: 65, glass: 50, hazardous: 15 },
    { month: 'Nov', organic: 380, plastic: 150, metal: 58, glass: 42, hazardous: 22 },
  ],
  distribution: [
    { name: 'Organic', value: 45, fill: 'hsl(152, 60%, 36%)' },
    { name: 'Plastic', value: 25, fill: 'hsl(38, 92%, 50%)' },
    { name: 'Metal', value: 12, fill: 'hsl(210, 80%, 55%)' },
    { name: 'Glass', value: 10, fill: 'hsl(280, 60%, 55%)' },
    { name: 'Hazardous', value: 8, fill: 'hsl(0, 72%, 51%)' },
  ],
  compliance: [
    { month: 'Jul', score: 68 },
    { month: 'Aug', score: 72 },
    { month: 'Sep', score: 70 },
    { month: 'Oct', score: 78 },
    { month: 'Nov', score: 82 },
  ],
};

export const mockTrainings: TrainingRecord[] = [
  { id: '1', userId: '2', title: 'Waste Segregation Basics', completed: true, score: 85, completedAt: '2024-10-01' },
  { id: '2', userId: '2', title: 'Composting at Home', completed: false, score: 0 },
  { id: '3', userId: '2', title: 'Hazardous Waste Handling', completed: false, score: 0 },
];
