/**
 * AgenticDev — Cloud Backend
 * 
 * - Serves the compiled React frontend as static files
 * - Provides REST API for resources (Firestore-backed)
 * - Admin routes protected by ADMIN_SECRET env var
 * - Chat history, API keys, and progress stay in the browser (localStorage)
 */

'use strict';

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { v4: uuidv4 } = require('uuid');
const admin   = require('firebase-admin');
const fs      = require('fs');

let localConfig = {};
try {
  localConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
} catch(e) {
  // Ignore, running via env vars
}

// ─── Firebase Init ───────────────────────────────────────────────────────────
let db;

function initFirebase() {
  if (admin.apps.length) return;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const serviceAccount = serviceAccountJson ? JSON.parse(serviceAccountJson) : localConfig.FIREBASE_SERVICE_ACCOUNT;
  
  if (!serviceAccount) {
    console.warn('⚠️  FIREBASE_SERVICE_ACCOUNT not set — using emulator/no-db mode');
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    db = admin.firestore();
    console.log('✅ Firestore connected:', serviceAccount.project_id);
  } catch (err) {
    console.error('❌ Firebase init failed:', err.message);
  }
}

initFirebase();

// ─── Express Setup ────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ─── Admin Auth Middleware ────────────────────────────────────────────────────
const ADMIN_SECRET = process.env.ADMIN_SECRET || localConfig.ADMIN_SECRET || '';

function requireAdmin(req, res, next) {
  if (!ADMIN_SECRET) {
    return res.status(503).json({ error: 'Admin access not configured on this server.' });
  }
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized — invalid admin secret.' });
  }
  next();
}

// ─── Resources Collection ─────────────────────────────────────────────────────
const COLLECTION = 'resources';

async function getResources() {
  if (!db) return getMockResources();
  const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function createResource(data) {
  if (!db) throw new Error('Database not available');
  const id  = uuidv4();
  const doc = { ...data, createdAt: admin.firestore.FieldValue.serverTimestamp() };
  await db.collection(COLLECTION).doc(id).set(doc);
  return { id, ...doc };
}

async function updateResource(id, data) {
  if (!db) throw new Error('Database not available');
  const ref = db.collection(COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Not found');
  await ref.update({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  return { id, ...snap.data(), ...data };
}

async function deleteResource(id) {
  if (!db) throw new Error('Database not available');
  const ref = db.collection(COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Not found');
  await ref.delete();
}

// Fallback in-memory mock when no DB configured (dev mode)
let mockResources = [];
function getMockResources() { return [...mockResources]; }

// ─── API Routes ───────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, db: !!db, timestamp: new Date().toISOString() });
});

// Public: list all resources
app.get('/api/resources', async (req, res) => {
  try {
    const resources = await getResources();
    res.json(resources);
  } catch (err) {
    console.error('GET /api/resources error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: create resource
app.post('/api/resources', requireAdmin, async (req, res) => {
  try {
    const { title, url, type, notes, tags, week } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    const resource = await createResource({ title, url: url || '', type: type || 'link', notes: notes || '', tags: tags || [], week: week || '' });
    res.status(201).json(resource);
  } catch (err) {
    console.error('POST /api/resources error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: update resource
app.put('/api/resources/:id', requireAdmin, async (req, res) => {
  try {
    const updated = await updateResource(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    if (err.message === 'Not found') return res.status(404).json({ error: 'Not found' });
    console.error('PUT /api/resources/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: delete resource
app.delete('/api/resources/:id', requireAdmin, async (req, res) => {
  try {
    await deleteResource(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    if (err.message === 'Not found') return res.status(404).json({ error: 'Not found' });
    console.error('DELETE /api/resources/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Serve Static Frontend ────────────────────────────────────────────────────
const staticDir = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(staticDir));

// SPA fallback — all non-API routes serve index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(staticDir, 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 AgenticDev backend running on port ${PORT}`);
    console.log(`   Admin: ${ADMIN_SECRET ? '✅ secret configured' : '⚠️  no secret set'}`);
    console.log(`   DB:    ${db ? '✅ Firestore' : '⚠️  mock/in-memory'}`);
  });
}

module.exports = app;
