// Redirect /chat/ to /chat/chat.html
app.get('/chat/', requireAuth, requireApproved, (req, res) => {
  res.redirect('/chat/chat.html');
});

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const sodium = require('libsodium-wrappers');
const bcrypt = require('bcrypt');
const session = require('express-session');
const crypto = require('crypto');
const transporter = require('./email');

const app = express();
const pendingUsers = {};
const emailCodes = {};
const ADMIN_EMAIL = 'MFL88@proton.me';
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
const path = require('path');
// Middleware to check authentication
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/');
  }
}

// Serve chat.html only for authenticated users
// Serve chat.html only for authenticated and approved users
function requireApproved(req, res, next) {
  if (req.session && req.session.user && users[req.session.user]) {
    next();
  } else {
    res.redirect('/');
});

// Serve other static files (main.js, etc.)
app.use('/chat', express.static(path.join(__dirname, '../client')));
// Serve home.html as the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/home.html'));
});
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false } // Set secure: true if using HTTPS
}));
    if (users[username] || pendingUsers[username]) return res.status(409).send('User exists or pending approval');
const users = {};
    pendingUsers[username] = { hash, email: req.body.email };
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (users[username] || pendingUsers[username]) return res.status(409).send('User exists or pending approval');
  const hash = await bcrypt.hash(password, 12);
  const code = crypto.randomBytes(3).toString('hex').toUpperCase();
  pendingUsers[username] = { hash, email, code, confirmed: false };
  emailCodes[email] = code;
  try {
    await transporter.sendMail({
      from: 'no-reply@yourdomain.com',
      to: email,
      subject: 'Your Authentication Code',
      text: `Your authentication code is: ${code}`
    });
    res.send('Check your email for the authentication code.');
  } catch (err) {
    res.status(500).send('Failed to send email.');
  }
});
// Confirm email code
app.post('/confirm', (req, res) => {
  const { email, code } = req.body;
  const username = Object.keys(pendingUsers).find(u => pendingUsers[u].email === email);
  if (!username) return res.status(404).send('User not found');
  if (pendingUsers[username].code === code) {
    pendingUsers[username].confirmed = true;
    res.send('Email confirmed!');
  } else {
    res.status(400).send('Invalid code');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  let user = users[username];
  if (!user) {
    if (pendingUsers[username]) {
      if (!pendingUsers[username].confirmed) {
        return res.status(403).send('Please confirm your email before login.');
      }
      return res.status(403).send('Your account is pending admin approval');
    }
    return res.status(401).send('Invalid credentials');
  }
  const valid = await bcrypt.compare(password, user.hash);
  if (!valid) return res.status(401).send('Invalid credentials');
  req.session.user = username;
  req.session.isAdmin = (user.email === ADMIN_EMAIL);
  res.send('Logged in');
});

wss.on('connection', (ws, req) => {
  // Admin route to approve users
    req.session.isAdmin = (user.email === ADMIN_EMAIL);
    if (!req.session.isAdmin) return res.status(403).send('Forbidden');
    res.json(pendingUsers);
  });

  app.post('/admin/approve', requireAuth, async (req, res) => {
    if (!req.session.isAdmin) return res.status(403).send('Forbidden');
    const { username } = req.body;
    if (!pendingUsers[username]) return res.status(404).send('User not found');
    users[username] = { hash: pendingUsers[username].hash, email: pendingUsers[username].email };
    delete pendingUsers[username];
    res.send('User approved');
  });
  // Only allow chat if authenticated
  if (!req.session || !req.session.user) {
    ws.close();
    return;
  }
  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Secure chat server running on port ${PORT}`);
});
