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
  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const user = new User({ name, email, password, role, complianceScore: 50, rewardPoints: 0 });
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
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/complaints/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
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

// --- Facilities ---
router.get('/facilities', async (req, res) => {
  try {
    const facilities = await Facility.find();
    res.json(facilities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
