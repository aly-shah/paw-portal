// JWT helpers + auth middleware. The signing secret is persisted to a file so
// tokens stay valid across server restarts (overridable with JWT_SECRET env).
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const secretPath = path.join(__dirname, 'data', '.jwt-secret');
  try {
    return fs.readFileSync(secretPath, 'utf8').trim();
  } catch {
    const secret = crypto.randomBytes(48).toString('hex');
    fs.mkdirSync(path.dirname(secretPath), { recursive: true });
    fs.writeFileSync(secretPath, secret, { mode: 0o600 });
    return secret;
  }
}

const SECRET = loadSecret();
const TOKEN_TTL = '30d';

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, SECRET, { expiresIn: TOKEN_TTL });
}

// Express middleware: require a valid Bearer token; attaches req.userId / req.userRole.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const payload = jwt.verify(token, SECRET);
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
