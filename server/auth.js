const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'vainneram-kerala-tea-stall-secret-key-1984';

// Default shared public user so NO ONE ever needs to log in
const DEFAULT_USER = {
  id: 'shared_library_user',
  username: 'kattan_chaya_listener',
  email: 'library@vainneram.local',
  display_name: 'ചായക്കട ലൈബ്രറി (Tea Stall Library)'
};

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, display_name: user.display_name },
    JWT_SECRET,
    { expiresIn: '365d' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Seamless auth middleware: if token exists and is valid, use it;
// otherwise automatically fall back to the shared library user!
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
      return next();
    }
  }

  // Fallback to shared library user automatically (no login required!)
  req.user = DEFAULT_USER;
  next();
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
      return next();
    }
  }

  req.user = DEFAULT_USER;
  next();
}

module.exports = {
  DEFAULT_USER,
  generateToken,
  verifyToken,
  authMiddleware,
  optionalAuth,
  hashPassword: async (pwd) => bcrypt.hash(pwd, 10),
  comparePassword: async (pwd, hash) => bcrypt.compare(pwd, hash)
};
