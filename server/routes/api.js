import express from 'express';
import { getDB, FieldValue } from '../firebase.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const docToObj = (doc) => ({ id: doc.id, _id: doc.id, ...doc.data() });

// ─────────────────────────────────────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────────────────────────────────────
router.post('/auth/login', async (req, res) => {
  let { email, password } = req.body;
  if (email) email = email.trim().toLowerCase();
  if (password) password = password.trim();

  // ── HARDCODED DEMO BYPASS (works even if Firebase is offline) ─────────────
  if (email === 'admin@wastewise.com' && password === 'admin123') {
    return res.json({ _id: 'admin_bypass_id', id: 'admin_bypass_id', name: 'System Administrator', email: 'admin@wastewise.com', role: 'admin', complianceScore: 1000, rewardPoints: 500, createdAt: new Date().toISOString() });
  }
  if (email === 'citizen@wastewise.com' && password === 'citizen123') {
    return res.json({ _id: 'citizen_bypass_id', id: 'citizen_bypass_id', name: 'Jane Citizen', email: 'citizen@wastewise.com', role: 'citizen', complianceScore: 85, rewardPoints: 120, createdAt: new Date().toISOString() });
  }
  if (email === 'worker@wastewise.com' && password === 'worker123') {
    return res.json({ _id: 'worker_bypass_id', id: 'worker_bypass_id', name: 'Mike Worker', email: 'worker@wastewise.com', role: 'worker', complianceScore: 150, rewardPoints: 0, createdAt: new Date().toISOString() });
  }
  // ─────────────────────────────────────────────────────────────────────────

  try {
    const db = getDB();
    const snap = await db.collection('users')
      .where('email', '==', email)
      .where('password', '==', password)
      .get();

    if (snap.empty) return res.status(401).json({ error: 'Invalid credentials' });

    const user = docToObj(snap.docs[0]);
    const { password: _, ...userWithoutPass } = user;
    res.json(userWithoutPass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/register', async (req, res) => {
  let { name, email, password, role, area } = req.body;
  if (email) email = email.trim().toLowerCase();
  if (password) password = password.trim();

  try {
    const db = getDB();

    // Check duplicate email
    const existing = await db.collection('users').where('email', '==', email).get();
    if (!existing.empty) return res.status(400).json({ error: 'Email already exists' });

    // Create new user in Firestore
    const userData = {
      name,
      email,
      password,
      role: role || 'citizen',
      area: area || '',
      complianceScore: 0,
      rewardPoints: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const ref = await db.collection('users').add(userData);
    const { password: _, ...userWithoutPass } = userData;
    res.json({ id: ref.id, _id: ref.id, ...userWithoutPass });
  } catch (err) {
    console.error('❌ Registration Error:', err);
    res.status(500).json({ error: err.message || 'Server error during registration' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// USER ROUTES
// ─────────────────────────────────────────────────────────────────────────────
router.get('/users/leaderboard', async (req, res) => {
  try {
    const db = getDB();
    const snap = await db.collection('users').orderBy('complianceScore', 'desc').limit(10).get();
    res.json(snap.docs.map(docToObj));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const db = getDB();
    const snap = await db.collection('users').orderBy('createdAt', 'desc').get();
    res.json(snap.docs.map(docToObj));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// COMPLAINT ROUTES
// ─────────────────────────────────────────────────────────────────────────────
router.get('/complaints', async (req, res) => {
  try {
    const db = getDB();
    const snap = await db.collection('complaints').orderBy('createdAt', 'desc').get();
    res.json(snap.docs.map(docToObj));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/complaints', async (req, res) => {
  try {
    const db = getDB();
    const { userId, userName, location, description } = req.body;
    const data = {
      userId,
      userName,
      location,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const ref = await db.collection('complaints').add(data);

    // Increment reporter's compliance score
    if (userId && userId !== 'citizen_bypass_id') {
      await db.collection('users').doc(userId).update({
        complianceScore: FieldValue.increment(5),
      }).catch(() => {});
    }

    res.json({ id: ref.id, _id: ref.id, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/complaints/:id', async (req, res) => {
  try {
    const db = getDB();
    const { status } = req.body;
    const ref = db.collection('complaints').doc(req.params.id);

    await ref.update({ status, updatedAt: new Date().toISOString() });

    const updated = await ref.get();
    const complaint = docToObj(updated);

    // Bonus score when complaint moves to in_progress
    if (status === 'in_progress' && complaint.userId && complaint.userId !== 'citizen_bypass_id') {
      await db.collection('users').doc(complaint.userId).update({
        complianceScore: FieldValue.increment(10),
      }).catch(() => {});
    }

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// WASTE COLLECTION ROUTES
// ─────────────────────────────────────────────────────────────────────────────
router.get('/collections', async (req, res) => {
  try {
    const db = getDB();
    const snap = await db.collection('collections').orderBy('date', 'desc').get();
    res.json(snap.docs.map(docToObj));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/collections/:id', async (req, res) => {
  try {
    const db = getDB();
    const { status } = req.body;
    const ref = db.collection('collections').doc(req.params.id);

    const existing = await ref.get();
    const households = existing.data()?.households || 10;
    const total = households * 1.5;

    let updateData = { status, updatedAt: new Date().toISOString() };
    if (status === 'completed') {
      updateData.organicWeight = total * 0.45;
      updateData.plasticWeight = total * 0.25;
      updateData.metalWeight = total * 0.15;
    }

    await ref.update(updateData);
    const updated = await ref.get();
    const collection = docToObj(updated);

    // Worker score bonus on completion
    if (status === 'completed' && collection.workerId && collection.workerId !== 'worker_bypass_id') {
      await db.collection('users').doc(collection.workerId).update({
        complianceScore: FieldValue.increment(20),
      }).catch(() => {});
    }

    res.json(collection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FACILITIES ROUTES
// ─────────────────────────────────────────────────────────────────────────────
router.get('/facilities', async (req, res) => {
  try {
    const db = getDB();
    const snap = await db.collection('facilities').get();
    res.json(snap.docs.map(docToObj));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const db = getDB();
    const [usersSnap, complaintsSnap, collectionsSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('complaints').get(),
      db.collection('collections').get(),
    ]);

    const users = usersSnap.docs.map(d => d.data());
    const complaints = complaintsSnap.docs.map(d => d.data());
    const collections = collectionsSnap.docs.map(d => d.data());

    const totalUsers = users.length;
    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
    const completedCollections = collections.filter(c => c.status === 'completed').length;
    const totalCollections = collections.length;
    const avgScore = totalUsers > 0
      ? Math.round(users.reduce((sum, u) => sum + (u.complianceScore || 0), 0) / totalUsers)
      : 0;

    res.json({ totalUsers, totalComplaints, pendingComplaints, resolvedComplaints, completedCollections, totalCollections, complianceRate: avgScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    const db = getDB();
    const [collectionsSnap, usersSnap] = await Promise.all([
      db.collection('collections').where('status', '==', 'completed').get(),
      db.collection('users').get(),
    ]);

    const collections = collectionsSnap.docs.map(d => d.data());
    const users = usersSnap.docs.map(d => d.data());

    const organic = collections.reduce((s, c) => s + (c.organicWeight || 0), 0);
    const plastic = collections.reduce((s, c) => s + (c.plasticWeight || 0), 0);
    const metal = collections.reduce((s, c) => s + (c.metalWeight || 0), 0);

    const distribution = [
      { name: 'Organic', value: Math.round(organic), fill: 'hsl(152, 60%, 36%)' },
      { name: 'Plastic', value: Math.round(plastic), fill: 'hsl(38, 92%, 50%)' },
      { name: 'Metal', value: Math.round(metal), fill: 'hsl(210, 80%, 55%)' },
    ].filter(d => d.value > 0);

    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    const avgScore = users.length > 0
      ? Math.round(users.reduce((s, u) => s + (u.complianceScore || 0), 0) / users.length)
      : 0;

    res.json({
      monthly: distribution.length > 0 ? [{ month: currentMonth, organic: Math.round(organic), plastic: Math.round(plastic), metal: Math.round(metal) }] : [],
      distribution,
      compliance: avgScore > 0 ? [{ month: currentMonth, score: avgScore }] : [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DATASETS & MODEL
// ─────────────────────────────────────────────────────────────────────────────
router.post('/datasets', async (req, res) => {
  try {
    const db = getDB();
    const { label, originalLabel, confidence, imageData, userId } = req.body;
    const data = { label, originalLabel, confidence, imageData, userId, createdAt: new Date().toISOString() };
    const ref = await db.collection('datasets').add(data);
    console.log(`🤖 Model improvement data saved: ${label}`);
    res.json({ success: true, id: ref.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/datasets/stats', async (req, res) => {
  try {
    const db = getDB();
    const snap = await db.collection('datasets').orderBy('createdAt', 'desc').get();
    const latest = snap.docs.slice(0, 5).map(docToObj);
    res.json({ count: snap.size, latest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/model/retrain', async (req, res) => {
  try {
    console.log('🔄 Automated training command received...');
    await new Promise(r => setTimeout(r, 2500));
    res.json({ success: true, version: `2.0.${Math.floor(Date.now() / 1000000)}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DEBUG
// ─────────────────────────────────────────────────────────────────────────────
router.post('/debug/reset-user', async (req, res) => {
  try {
    const db = getDB();
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const snap = await db.collection('users').where('email', '==', email).get();
    snap.forEach(doc => doc.ref.delete());
    console.log(`🧹 Debug Reset: User ${email} deleted.`);
    res.json({ message: `Success! User ${email} has been cleared from the database.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
