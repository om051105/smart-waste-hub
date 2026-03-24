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

export interface AIResult {
  category: string;
  confidence: number;
  isCorrectlySegregated: boolean;
}

const COMPLAINTS_KEY = 'wastewise_complaints';

const defaultComplaints: Complaint[] = [
  { id: '1', userId: '2', userName: 'Jane Citizen', image: '', location: { lat: 28.6139, lng: 77.209 }, description: 'Illegal dumping near park', status: 'pending', createdAt: '2024-11-01' },
  { id: '2', userId: '2', userName: 'Jane Citizen', image: '', location: { lat: 28.62, lng: 77.215 }, description: 'Overflowing bin on Main St', status: 'in_progress', createdAt: '2024-10-28' },
  { id: '3', userId: '5', userName: 'Rahul K', image: '', location: { lat: 28.618, lng: 77.22 }, description: 'Hazardous waste found', status: 'resolved', createdAt: '2024-10-15' },
];

export function getComplaints(): Complaint[] {
  const s = localStorage.getItem(COMPLAINTS_KEY);
  if (!s) {
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(defaultComplaints));
    return defaultComplaints;
  }
  return JSON.parse(s);
}

export function addComplaint(c: Omit<Complaint, 'id' | 'createdAt' | 'status'>): Complaint {
  const complaints = getComplaints();
  const newC: Complaint = { ...c, id: crypto.randomUUID(), status: 'pending', createdAt: new Date().toISOString() };
  complaints.push(newC);
  localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
  return newC;
}

export function updateComplaintStatus(id: string, status: Complaint['status']) {
  const complaints = getComplaints();
  const idx = complaints.findIndex(c => c.id === id);
  if (idx >= 0) {
    complaints[idx].status = status;
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
  }
}

export const mockCollections: WasteCollection[] = [
  { id: '1', workerId: '3', area: 'Zone A - Sector 1', status: 'completed', date: '2024-11-20', households: 45 },
  { id: '2', workerId: '3', area: 'Zone A - Sector 2', status: 'pending', date: '2024-11-21', households: 38 },
  { id: '3', workerId: '3', area: 'Zone A - Sector 3', status: 'missed', date: '2024-11-19', households: 52 },
  { id: '4', workerId: '3', area: 'Zone A - Sector 1', status: 'completed', date: '2024-11-18', households: 45 },
];

export const mockTrainings: TrainingRecord[] = [
  { id: '1', userId: '2', title: 'Waste Segregation Basics', completed: true, score: 85, completedAt: '2024-10-01' },
  { id: '2', userId: '2', title: 'Composting at Home', completed: false, score: 0 },
  { id: '3', userId: '2', title: 'Hazardous Waste Handling', completed: false, score: 0 },
];

export function simulateAI(): AIResult {
  const categories = ['organic', 'plastic', 'metal', 'glass', 'hazardous'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const confidence = 70 + Math.floor(Math.random() * 28);
  const isCorrectlySegregated = Math.random() > 0.35;
  return { category, confidence, isCorrectlySegregated };
}

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

export const leaderboard = [
  { rank: 1, name: 'Green Sara', area: 'Zone B', score: 95 },
  { rank: 2, name: 'Worker Mike', area: 'Zone A', score: 90 },
  { rank: 3, name: 'Admin User', area: 'HQ', score: 88 },
  { rank: 4, name: 'Jane Citizen', area: 'Zone C', score: 75 },
  { rank: 5, name: 'Rahul K', area: 'Zone A', score: 72 },
];

export const facilities = [
  { id: '1', name: 'GreenCycle Center', type: 'recycling', lat: 28.615, lng: 77.21, address: '123 Green Rd' },
  { id: '2', name: 'CompostHub', type: 'compost', lat: 28.62, lng: 77.205, address: '45 Organic Ln' },
  { id: '3', name: 'MetalMax Scrap', type: 'scrap', lat: 28.608, lng: 77.218, address: '78 Industrial Ave' },
  { id: '4', name: 'EcoReclaim', type: 'recycling', lat: 28.625, lng: 77.195, address: '12 Eco Blvd' },
];
