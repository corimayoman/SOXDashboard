# SOX Controls Dashboard

A static single-page dashboard for tracking the execution status of SOX IT controls across applications and months. Built with plain HTML, CSS, and JavaScript — no build step, no backend, no dependencies except Chart.js via CDN.

---

## Purpose

This dashboard provides visibility into whether SOX IT controls are being executed on time across the organization's application landscape. It covers the period **Nov 2025 – Mar 2026** and tracks 24 controls across 11 platforms.

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
| `--g-pink` | `#E61587` | Alert/overdue status |
| `--g-orange` | `#F7931E` | Pending status |
| `--g-safety` | `#00A99D` | On time status border |
| `--g-purple` | `#662D91` | ACC type badge |

---

## Changelog

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

## Future: Google Sheets / Jira Integration

Currently all data is hardcoded in the HTML. The plan is to connect to a live data source:
- **Google Sheets** — upload the Excel files and use the Sheets API
- **Jira** — requires a small proxy backend due to CORS restrictions

See the conversation history for implementation details.
