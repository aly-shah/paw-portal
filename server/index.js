// PawPortal API server — real accounts + persisted data backed by SQLite.
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from './db.js';
import { signToken, requireAuth } from './auth.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' })); // allow base64 image data URLs in payloads

const PORT = process.env.API_PORT || 7071;
const newId = () => crypto.randomUUID();
const now = () => new Date().toISOString();

const VALID_ROLES = ['OWNER', 'VET', 'CLINIC', 'VENDOR', 'CARE_GIVER', 'SUPER_ADMIN'];

const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, avatar: u.avatar });

// Seed a default super-admin on first run so the /admin portal works out of the box.
// Override via ADMIN_EMAIL / ADMIN_PASSWORD env vars.
function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@pawportal.local';
  const password = process.env.ADMIN_PASSWORD || 'admin12345';
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return;
  db.prepare(
    'INSERT INTO users (id, email, password_hash, name, role, avatar, created_at) VALUES (@id, @email, @password_hash, @name, @role, @avatar, @created_at)'
  ).run({
    id: newId(), email, password_hash: bcrypt.hashSync(password, 10),
    name: 'Super Admin', role: 'SUPER_ADMIN',
    avatar: 'https://picsum.photos/seed/admin/100/100', created_at: now(),
  });
  console.log(`[seed] Created super-admin account: ${email}`);
}
seedAdmin();

// ----------------------------------------------------------------------------
// Health check
// ----------------------------------------------------------------------------
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ----------------------------------------------------------------------------
// Auth
// ----------------------------------------------------------------------------
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, role } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const finalRole = VALID_ROLES.includes(role) ? role : 'OWNER';

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

  const user = {
    id: newId(),
    email: String(email).trim(),
    password_hash: bcrypt.hashSync(String(password), 10),
    name: String(name).trim(),
    role: finalRole,
    avatar: `https://picsum.photos/seed/${encodeURIComponent(email)}/100/100`,
    created_at: now(),
  };
  db.prepare(
    'INSERT INTO users (id, email, password_hash, name, role, avatar, created_at) VALUES (@id, @email, @password_hash, @name, @role, @avatar, @created_at)'
  ).run(user);

  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim());
  if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: publicUser(user) });
});

// Update the signed-in user's display name and/or avatar.
app.put('/api/auth/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { name, avatar } = req.body || {};
  const newName = typeof name === 'string' && name.trim() ? name.trim() : user.name;
  const newAvatar = typeof avatar === 'string' && avatar ? avatar : user.avatar;
  db.prepare('UPDATE users SET name = ?, avatar = ? WHERE id = ?').run(newName, newAvatar, req.userId);
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  res.json({ user: publicUser(updated) });
});

// ----------------------------------------------------------------------------
// Generic persistence — per-user and global collections
//   /api/user/:collection          (private to the authed user)
//   /api/global/:collection        (shared; author tracked via user_id)
// ----------------------------------------------------------------------------
const isValidScope = (s) => s === 'user' || s === 'global';
const isValidCollection = (c) => /^[a-zA-Z0-9_-]{1,64}$/.test(c || '');

// List items in a collection.
app.get('/api/:scope/:collection', requireAuth, (req, res) => {
  const { scope, collection } = req.params;
  if (!isValidScope(scope) || !isValidCollection(collection)) return res.status(400).json({ error: 'Bad request' });

  let rows;
  if (scope === 'user') {
    rows = db.prepare('SELECT data FROM items WHERE scope = ? AND collection = ? AND user_id = ? ORDER BY created_at DESC')
      .all('user', collection, req.userId);
  } else {
    rows = db.prepare('SELECT data FROM items WHERE scope = ? AND collection = ? ORDER BY created_at DESC')
      .all('global', collection);
  }
  res.json(rows.map((r) => JSON.parse(r.data)));
});

// Create an item. Body is the object; an `id` is generated if absent.
app.post('/api/:scope/:collection', requireAuth, (req, res) => {
  const { scope, collection } = req.params;
  if (!isValidScope(scope) || !isValidCollection(collection)) return res.status(400).json({ error: 'Bad request' });

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const itemId = String(body.id || newId());
  const record = { ...body, id: itemId };
  const ts = now();

  db.prepare(
    `INSERT INTO items (scope, collection, item_id, user_id, data, created_at, updated_at)
     VALUES (@scope, @collection, @item_id, @user_id, @data, @created_at, @updated_at)
     ON CONFLICT(scope, collection, item_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
  ).run({
    scope, collection, item_id: itemId, user_id: req.userId,
    data: JSON.stringify(record), created_at: ts, updated_at: ts,
  });
  res.status(201).json(record);
});

// Replace an existing item by id.
app.put('/api/:scope/:collection/:itemId', requireAuth, (req, res) => {
  const { scope, collection, itemId } = req.params;
  if (!isValidScope(scope) || !isValidCollection(collection)) return res.status(400).json({ error: 'Bad request' });

  const existing = findItem(scope, collection, itemId);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (!canModify(req, scope, existing)) return res.status(403).json({ error: 'Forbidden' });

  const record = { ...(req.body || {}), id: itemId };
  db.prepare('UPDATE items SET data = ?, updated_at = ? WHERE scope = ? AND collection = ? AND item_id = ?')
    .run(JSON.stringify(record), now(), scope, collection, itemId);
  res.json(record);
});

// Delete an item by id.
app.delete('/api/:scope/:collection/:itemId', requireAuth, (req, res) => {
  const { scope, collection, itemId } = req.params;
  if (!isValidScope(scope) || !isValidCollection(collection)) return res.status(400).json({ error: 'Bad request' });

  const existing = findItem(scope, collection, itemId);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (!canModify(req, scope, existing)) return res.status(403).json({ error: 'Forbidden' });

  db.prepare('DELETE FROM items WHERE scope = ? AND collection = ? AND item_id = ?').run(scope, collection, itemId);
  res.json({ ok: true });
});

function findItem(scope, collection, itemId) {
  return db.prepare('SELECT * FROM items WHERE scope = ? AND collection = ? AND item_id = ?').get(scope, collection, itemId);
}

// User-scoped items are private to their owner. Global items can only be changed
// by their author (or a super admin).
function canModify(req, scope, row) {
  if (scope === 'user') return row.user_id === req.userId;
  return row.user_id === req.userId || req.userRole === 'SUPER_ADMIN';
}

app.listen(PORT, '127.0.0.1', () => {
  console.log(`PawPortal API listening on http://127.0.0.1:${PORT}`);
});
