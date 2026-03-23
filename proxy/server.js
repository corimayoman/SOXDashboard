require('dotenv').config();
const express = require('express');
const cors = require('cors');
const auth = require('./auth');
const jiraClient = require('./jira-client');
const { transformToDashboard } = require('./mapper');
const Cache = require('./cache');

const app = express();
const PORT = process.env.PORT || 3001;
const cache = new Cache(parseInt(process.env.CACHE_TTL) || 300);

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// --- Auth routes ---

app.get('/auth/login', (req, res) => {
  const { url } = auth.getAuthUrl();
  res.redirect(url);
});

app.get('/auth/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error) {
    return res.status(400).send(`Auth error: ${error}`);
  }
  if (!code) {
    return res.status(400).send('Missing authorization code');
  }
  try {
    await auth.exchangeCode(code);
    // Redirect to dashboard after successful auth
    res.send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#001a1e;color:#e8f5f0">
        <h2 style="color:#BFD732">✓ Connected to Jira</h2>
        <p>You can close this tab and refresh the dashboard.</p>
        <script>setTimeout(()=>window.close(),2000)</script>
      </body></html>
    `);
  } catch (err) {
    console.error('Auth callback error:', err.message);
    res.status(500).send(`Authentication failed: ${err.message}`);
  }
});

app.get('/auth/status', (req, res) => {
  res.json({ authenticated: auth.isAuthenticated() });
});

app.get('/auth/logout', (req, res) => {
  auth.logout();
  cache.clear();
  res.json({ ok: true });
});

// --- API routes ---

app.get('/api/controls', async (req, res) => {
  if (!auth.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated. Visit /auth/login first.' });
  }

  // Check cache
  const cached = cache.get('controls');
  if (cached) {
    console.log('Serving from cache');
    return res.json(cached);
  }

  try {
    console.log('Fetching from Jira...');
    const { subtasks, parentMap } = await jiraClient.fetchAllData();
    const result = transformToDashboard(subtasks, parentMap);
    console.log(`Mapped ${result.controls.length} controls`);

    cache.set('controls', result);
    res.json(result);
  } catch (err) {
    console.error('API error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- Health check ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', authenticated: auth.isAuthenticated() });
});

app.listen(PORT, () => {
  console.log(`SOX Dashboard proxy running on http://localhost:${PORT}`);
  console.log(`Login: http://localhost:${PORT}/auth/login`);
  console.log(`Status: http://localhost:${PORT}/auth/status`);
});
