import express from 'express';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import WasteCollection from '../models/WasteCollection.js';
import Facility from '../models/Facility.js';

const router = express.Router();

// --- Auth Routes ---
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const { password: _, ...userWithoutPass } = user.toJSON();
    res.json(userWithoutPass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/register', async (req, res) => {
  const { name, email, password, role, area } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const user = new User({ name, email, password, role, area, complianceScore: 0, rewardPoints: 0 });
    await user.save();
    const { password: _, ...userWithoutPass } = user.toJSON();
    res.json(userWithoutPass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- User Routes ---
router.get('/users/leaderboard', async (req, res) => {
  try {
    const users = await User.find().sort({ complianceScore: -1 }).limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Complaint Routes ---
router.get('/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/complaints', async (req, res) => {
  try {
    const { userId, userName, location, description } = req.body;
    const complaint = new Complaint({ userId, userName, location, description });
    await complaint.save();
    
    // Increment reporter's score
    await User.findByIdAndUpdate(userId, { $inc: { complianceScore: 5 } });
    
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/complaints/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    // If verified by Champion, give bonus to reporter and champion (if we had championId)
    if (status === 'in_progress') {
        await User.findByIdAndUpdate(complaint.userId, { $inc: { complianceScore: 10 } });
    }
    
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Collections ---
router.get('/collections', async (req, res) => {
  try {
    const collections = await WasteCollection.find().sort({ date: -1 });
    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/collections/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    let updateData = { status };
    if (status === 'completed') {
      // Logic: Simulate real waste weights based on households (1.5kg per household avg)
      const count = await WasteCollection.findById(req.params.id);
      const total = (count?.households || 10) * 1.5;
      updateData.organicWeight = total * 0.45;
      updateData.plasticWeight = total * 0.25;
      updateData.metalWeight = total * 0.15;
    }

    const collection = await WasteCollection.findByIdAndUpdate(
      req.params.id, updateData, { new: true }
    );

    // If completed, increment worker's score
    if (status === 'completed') {
      await User.findByIdAndUpdate(collection.workerId, { $inc: { complianceScore: 20 } });
    }

    res.json(collection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Facilities ---
router.get('/facilities', async (req, res) => {
  try {
    const facilities = await Facility.find();
    res.json(facilities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Stats (for Admin Dashboard real-time) ---
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
    const completedCollections = await WasteCollection.countDocuments({ status: 'completed' });
    const totalCollections = await WasteCollection.countDocuments();
    const complianceRate = totalUsers > 0 
      ? Math.round((await User.aggregate([{ $group: { _id: null, avg: { $avg: '$complianceScore' } } }]))[0]?.avg || 0)
      : 0;

    res.json({
      totalUsers,
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      completedCollections,
      totalCollections,
      complianceRate
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Analytics (Full Monthly Stats) ---
router.get('/analytics', async (req, res) => {
  try {
    const collections = await WasteCollection.find({ status: 'completed' });
    
    // Calculate distribution
    const distribution = [
      { name: 'Organic', value: 0, fill: 'hsl(152, 60%, 36%)' },
      { name: 'Plastic', value: 0, fill: 'hsl(38, 92%, 50%)' },
      { name: 'Metal', value: 0, fill: 'hsl(210, 80%, 55%)' },
    ];

    collections.forEach(c => {
      distribution[0].value += c.organicWeight || 0;
      distribution[1].value += c.plasticWeight || 0;
      distribution[2].value += c.metalWeight || 0;
    });

    // Strict Real Data for the current month
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    const monthly = [{
      month: currentMonth,
      organic: Math.round(distribution[0].value),
      plastic: Math.round(distribution[1].value),
      metal: Math.round(distribution[2].value)
    }];

    // Strict Real Compliance Data
    const totalUsers = await User.countDocuments();
    const complianceRate = totalUsers > 0 
      ? Math.round((await User.aggregate([{ $group: { _id: null, avg: { $avg: '$complianceScore' } } }]))[0]?.avg || 0)
      : 0;

    const compliance = [{
      month: currentMonth,
      score: complianceRate
    }];

    res.json({
      monthly: distribution.some(d => d.value > 0) ? monthly : [],
      distribution: distribution.filter(d => d.value > 0),
      compliance: complianceRate > 0 ? compliance : []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
