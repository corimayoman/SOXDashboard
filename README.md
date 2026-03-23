# SOX Controls Dashboard

A static single-page dashboard for tracking the execution status of SOX IT controls across applications and months. Built with plain HTML, CSS, and JavaScript — no build step, no backend, no dependencies except Chart.js via CDN.

---

## Purpose

This dashboard provides visibility into whether SOX IT controls are being executed on time across the organization's application landscape. It covers the period **Ene 2026 – Mar 2026** and tracks 143 controls across 23 platforms.

---

## How to Open

Just open the file in any browser:

```bash
open SOXDashboard/sox_dashboard.html
```

Or via GitHub Pages (if enabled):
```
https://corimayoman.github.io/SOXDashboard/sox_dashboard.html
```

---

## Dashboard Sections

### Tab Navigation
The header includes two tabs:
- **Dashboard** — the main controls view (default)
- **Guide** — reference guide with status legend, control type descriptions, step-by-step usage instructions, and an FAQ section

Tabs are toggled via the `switchTab()` function.

The Guide tab includes:
- Hero section with overview text
- Status badge reference (Executed, Alert, Pending, On Time, N/A)
- Control type grid (ACC, CHG, OPE, APD)
- Step-by-step usage walkthrough
- Collapsible FAQ items
- CTA card linking back to the Dashboard

### Data Source Indicator
A small badge in the header next to the date range shows the current data source:
- 🟢 **Live** — data fetched from Jira via the proxy server
- 🔴 **Offline** — using hardcoded fallback data embedded in the HTML

### Summary Cards
One card per visible month showing:
- **% Executed** — months where controls ran successfully
- **Alerts / Overdue** — months with failed or overdue controls (shown in pink)
- **On Time** — future months where controls are pending but not yet due (shown in yellow)

Cards update automatically when the **Year filter** is applied.

### Control Execution Trend Chart
A line chart showing three series across the visible months:
- **Executed** (lime green) — count of controls successfully run
- **Failed** (pink) — count of controls that are overdue or pending
- **Not Run** (gray) — count of controls marked N/A

The chart respects the active year filter.

### Filters
| Filter | Description |
|--------|-------------|
| Application | Filter by platform (AWS, SAP ECC, S4H, BW, etc.) |
| Control Type | Filter by type code derived from the 3rd segment of the control ID |
| Frequency | Monthly or Quarterly |
| Year | 2025 (Nov–Dec) or 2026 (Jan–Mar) |
| Search | Free text search on Control ID or Description |

### Controls Table
Rows = individual controls. Columns = months. Each cell shows the execution status for that control in that month. Click any cell to open a detail modal.

### Detail Modal
Clicking a status cell opens a modal with:
- Control ID and description
- Application, type, frequency, owner
- Due date, execution date, evidence link, notes (when available)

---

## Control ID Structure

Control IDs follow this naming convention:

```
GB . IT . [TYPE] . [APP] . [NUMBER]
```

| Segment | Example | Meaning |
|---------|---------|---------|
| GB | GB | Globant |
| IT | IT | IT domain |
| TYPE | ACC, CHG, OPE, APD | Control type (see below) |
| APP | SAP, S4H, BW, AWS... | Application/platform |
| NUMBER | 01, 02.01... | Sequential number |

### Control Types
| Code | Meaning |
|------|---------|
| ACC | Access controls — user access reviews, role reviews |
| CHG | Change controls — change management, transports |
| OPE | Operations controls — monitoring, batch jobs, backups |
| APD | Application/DB controls — database access, admin users |

---

## Status Values

| Status | Color | Meaning |
|--------|-------|---------|
| Executed | Lime green | Control was run and completed in the period |
| ⚠ Alert | Pink | Control is overdue or failed |
| Pending | Orange | Control was not run in the period |
| On Time | Teal | Control is not yet due (future month) |
| N/A | Gray | Control does not apply in this period |

---

## Applications / Platforms

| App | Description |
|-----|-------------|
| AWS | Amazon Web Services |
| SAP ECC | SAP ERP Central Component |
| S4H | SAP S/4HANA |
| BW | SAP Business Warehouse |
| SAPHDB | SAP HANA Database |
| GRC | SAP Governance, Risk & Compliance |
| SOLMAN | SAP Solution Manager |
| Ariba | SAP Ariba (procurement) |
| PAPM | SAP Profitability and Performance Management |
| BTP | SAP Business Technology Platform |
| SLT | SAP Landscape Transformation |
| Magnitude | Magnitude/Cognos BI |
| SSFF | SAP SuccessFactors |
| Glow | Glow platform |
| INFR | Infrastructure |
| Linux | Linux servers |
| Windows | Windows servers |
| AD | Active Directory |
| Lumen | Lumen network/connectivity |

---

## Data Structure

All data is embedded directly in `sox_dashboard.html` as JavaScript objects.

### Controls catalog
```js
const controls = [
  { id: 'GB.IT.ACC.AWS.01', desc: 'Review of privileged access in AWS', app: 'AWS', freq: 'Monthly', resp: 'IST Architecture' },
  // ...
];
```

### Monthly execution status
```js
const monthlyData = {
  'GB.IT.ACC.AWS.01': ['executed', 'executed', 'executed', 'executed', 'ontime'],
  // index:              [nov,        dic,        ene,        feb,        mar]
};
```

Status values: `'ejecutado'` | `'alerta'` | `'pendiente'` | `'tiempo'` | `'na'`

### Detail data (optional, per control per month)
```js
const details = {
  'GB.IT.CHG.SAP.02.01': {
    nov: { fecha_vcto: '30/11/2025', fecha_ejec: '-', evidencia: '', estado: 'Pending', obs: 'Not executed' },
    // ...
  }
};
```

---

## How to Add a New Control

1. Add an entry to the `controls` array in `sox_dashboard.html`
2. Add a matching entry to `monthlyData` with 5 status values `[nov, dic, ene, feb, mar]`
3. Optionally add detail data to the `details` object
4. Save and refresh

---

## How to Add a New Month/Period

1. Add the month key to `MONTHS`, label to `MONTH_LABELS`, and year to `MONTH_YEARS`
2. Add a new `<th class="month-col">` in the table header
3. Add a 6th value to every entry in `monthlyData`
4. Update the year filter options if needed

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| UI | Plain HTML5 + CSS3 (CSS variables) |
| Logic | Vanilla JavaScript (ES6+) |
| Chart | [Chart.js 4.4.0](https://www.chartjs.org/) via CDN |
| Hosting | GitHub Pages (static) |
| Version control | GitHub — [corimayoman/SOXDashboard](https://github.com/corimayoman/SOXDashboard) |

---

## Color Scheme

Uses the official [Globant brand palette](https://brand.globant.com/color/):

| Variable | Hex | Usage |
|----------|-----|-------|
| `--g-lime` | `#BFD732` | Primary accent, executed status, headers |
| `--g-dark` | `#00292E` | Header background |
| `--g-mint` | `#38EFA0` | APD type badge |
| `--g-teal` | `#63E3CF` | OPE type badge, control IDs |
| `--g-pink` | `#C0392B` | Alert/overdue status |
| `--g-orange` | `#F7931E` | Pending status |
| `--g-safety` | `#00A99D` | On time status border |
| `--g-purple` | `#662D91` | ACC type badge |

---

## Changelog

### 2026-03-23
- Added data source indicator badge in the header next to the date range. Shows 🟢 "Live" when connected to the Jira proxy, or 🔴 "Offline" when using hardcoded fallback data. Part of the Jira Cloud integration work — the dashboard now attempts to fetch live control data from the Node.js proxy at `localhost:3001` on load, falling back gracefully to embedded data if the proxy is unavailable.

### 2026-03-19 (4)
- Added 119 missing controls from the "Controles SOX General" spreadsheet. Total controls expanded from 24 to 143 across 23 platforms. New platforms: SSFF, Glow, INFR, Linux, Windows, AD, Lumen. Extended existing platforms: Ariba, AWS, SAP ECC, SAPHDB, BW, PaPM, BTP, Magnitude, SOLMAN, S4H. Controls marked "Tomar Control" set to all N/A; controls "Ya bajo nuestro Ownership" set to N/A for past months and On Time for Mar 2026.

### 2026-03-19 (3)
- Updated `--g-pink` color from `#E61587` to `#C0392B` — alert/overdue status now uses a deeper red tone instead of the original Globant pink.

### 2026-03-19 (2)
- Added missing Guide tab HTML content to `SOXDashboard/sox_dashboard.html` — the Guide tab (hero section, status legend, control type grid, step-by-step walkthrough, FAQ, and CTA) was present in the root `sox_dashboard.html` but absent from the versioned copy. Both files are now in sync.

### 2026-03-19
- Fixed missing `<div class="modal-overlay" id="modalOverlay">` wrapper in `SOXDashboard/sox_dashboard.html` — the detail modal was not rendering correctly due to the absent opening tag.

---

## Roadmap / Open Issues

See [GitHub Issues](https://github.com/corimayoman/SOXDashboard/issues) for planned features including:
- Google SSO login page (#3)
- Jira integration as data source (discussed, not yet tracked)

---

## Jira Cloud Integration

A Node.js proxy server (`SOXDashboard/proxy/`) connects the dashboard to Jira Cloud via OAuth 2.0 (3LO). The dashboard attempts to load live data on startup and falls back to hardcoded data if the proxy is unavailable.

### Proxy Setup

1. Install dependencies:
```bash
cd SOXDashboard/proxy
npm install
```

2. Configure environment variables — copy `.env.example` to `.env` and fill in:
```bash
cp .env.example .env
```

Required variables:
| Variable | Description |
|----------|-------------|
| `ATLASSIAN_CLIENT_ID` | OAuth app Client ID from developer.atlassian.com |
| `ATLASSIAN_CLIENT_SECRET` | OAuth app Client Secret |
| `ATLASSIAN_CALLBACK_URL` | `http://localhost:3001/auth/callback` |
| `JIRA_PROJECT_KEY` | Jira project key (e.g. `GLO220`) |
| `PORT` | Proxy port (default: `3001`) |
| `CACHE_TTL` | Cache duration in seconds (default: `300`) |
| `CORS_ORIGIN` | Allowed origin (default: `*`) |

3. Start the proxy:
```bash
node server.js
```

4. Authenticate — open `http://localhost:3001/auth/login` in your browser. You'll be redirected to Atlassian to grant access. After consent, the proxy stores tokens in memory and auto-refreshes them.

5. Open the dashboard — the `● Live` badge in the header confirms the connection. If the proxy is down, the badge shows `● Offline` and hardcoded data is used.

### Proxy Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /auth/login` | Redirects to Atlassian OAuth consent |
| `GET /auth/callback` | Handles OAuth callback (automatic) |
| `GET /auth/status` | Returns `{ authenticated: true/false }` |
| `GET /auth/logout` | Clears tokens and cache |
| `GET /api/controls` | Returns controls + monthlyData from Jira |
| `GET /health` | Health check |

### OAuth App Setup

1. Go to [developer.atlassian.com](https://developer.atlassian.com/console/myapps/)
2. Create a new OAuth 2.0 (3LO) app
3. Add scopes: `read:jira-work`, `read:jira-user` (classic scopes)
4. Set callback URL: `http://localhost:3001/auth/callback`
5. Copy Client ID and Client Secret to `.env`

## Future: Google Sheets Integration

Google Sheets remains a potential alternative data source — upload the Excel files and use the Sheets API.
