const crypto = require('crypto');

const ATLASSIAN_AUTH_URL = 'https://auth.atlassian.com/authorize';
const ATLASSIAN_TOKEN_URL = 'https://auth.atlassian.com/oauth/token';
const ATLASSIAN_RESOURCES_URL = 'https://api.atlassian.com/oauth/token/accessible-resources';

// In-memory token storage (single user)
let tokenData = null;
let cloudId = null;

function getAuthUrl() {
  const state = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    audience: 'api.atlassian.com',
    client_id: process.env.ATLASSIAN_CLIENT_ID,
    scope: 'read:jira-work read:jira-user',
    redirect_uri: process.env.ATLASSIAN_CALLBACK_URL,
    state,
    response_type: 'code',
    prompt: 'consent'
  });
  return { url: `${ATLASSIAN_AUTH_URL}?${params}`, state };
}

async function exchangeCode(code) {
  const res = await fetch(ATLASSIAN_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: process.env.ATLASSIAN_CLIENT_ID,
      client_secret: process.env.ATLASSIAN_CLIENT_SECRET,
      code,
      redirect_uri: process.env.ATLASSIAN_CALLBACK_URL
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${err}`);
  }
  tokenData = await res.json();
  tokenData.obtained_at = Date.now();
  await resolveCloudId();
  return tokenData;
}

async function refreshToken() {
  if (!tokenData?.refresh_token) throw new Error('No refresh token available');
  const res = await fetch(ATLASSIAN_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: process.env.ATLASSIAN_CLIENT_ID,
      client_secret: process.env.ATLASSIAN_CLIENT_SECRET,
      refresh_token: tokenData.refresh_token
    })
  });
  if (!res.ok) {
    const err = await res.text();
    tokenData = null;
    cloudId = null;
    throw new Error(`Token refresh failed: ${res.status} ${err}`);
  }
  tokenData = await res.json();
  tokenData.obtained_at = Date.now();
}

async function resolveCloudId() {
  const res = await fetch(ATLASSIAN_RESOURCES_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  if (!res.ok) throw new Error('Failed to get accessible resources');
  const resources = await res.json();
  if (!resources.length) throw new Error('No accessible Jira sites found');
  // Use first available site (or find globant specifically)
  const site = resources.find(r => r.url.includes('globant')) || resources[0];
  cloudId = site.id;
  console.log(`Connected to: ${site.name} (${site.url})`);
}

async function getAccessToken() {
  if (!tokenData) return null;
  // Refresh if token is expired (with 60s buffer)
  const expiresAt = tokenData.obtained_at + (tokenData.expires_in * 1000) - 60000;
  if (Date.now() > expiresAt) {
    console.log('Access token expired, refreshing...');
    await refreshToken();
  }
  return tokenData.access_token;
}

function getCloudId() { return cloudId; }
function isAuthenticated() { return !!tokenData && !!cloudId; }
function logout() { tokenData = null; cloudId = null; }

module.exports = { getAuthUrl, exchangeCode, getAccessToken, getCloudId, isAuthenticated, logout };
