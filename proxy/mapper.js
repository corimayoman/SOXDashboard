// Month mapping from Spanish month codes in Jira task summaries
const MONTH_MAP = {
  ENE: 'ene', FEB: 'feb', MAR: 'mar', ABR: 'abr', MAY: 'may', JUN: 'jun',
  JUL: 'jul', AGO: 'ago', SEP: 'sep', OCT: 'oct', NOV: 'nov', DIC: 'dic',
  JAN: 'ene', APR: 'abr', AUG: 'ago', DEC: 'dic'  // English fallbacks
};

// Dashboard months (current scope)
const MONTHS = ['nov', 'dic', 'ene', 'feb', 'mar'];
const MONTH_LABELS = ['NOV 2025', 'DIC 2025', 'ENE 2026', 'FEB 2026', 'MAR 2026'];
const MONTH_YEARS = ['2025', '2025', '2026', '2026', '2026'];

// Platform name normalization
const PLATFORM_MAP = {
  'SAP': 'SAP ECC', 'HANA': 'SAPHDB', 'S4': 'S4H', 'S/4HANA': 'S4H', 'S4HANA': 'S4H',
  'BW': 'BW', 'AWS': 'AWS', 'GLOW': 'Glow', 'Glow': 'Glow',
  'ARIBA': 'Ariba', 'Ariba': 'Ariba', 'GRC': 'GRC', 'SOLMAN': 'SOLMAN',
  'BTP': 'BTP', 'PAPM': 'PAPM', 'PaPM': 'PAPM', 'SLT': 'SLT',
  'SSFF': 'SSFF', 'SuccessFactors': 'SSFF',
  'LINUX': 'Linux', 'Linux': 'Linux', 'WINDOWS': 'Windows', 'Windows': 'Windows',
  'AD': 'AD', 'INFR': 'INFR', 'MAGNITUDE': 'Magnitude', 'Magnitude': 'Magnitude',
  'LUMEN': 'Lumen', 'Lumen': 'Lumen', 'CIRION': 'Cirion', 'Cirion': 'Cirion'
};

function mapStatus(jiraStatus, dueDate) {
  const now = new Date();
  const overdue = dueDate && new Date(dueDate) < now;
  const s = (jiraStatus || '').toLowerCase().trim();

  if (s === 'closed' || s === 'pending to be deployed') return 'ejecutado';
  if (s === 'in testing' || s === 'in progress') return 'pendiente';
  if (s === 'blocked' || s === 'rejected') return 'alerta';
  if (s === 'planned' || s === 'refined' || s === 'backlog' || s === 'open') {
    return overdue ? 'alerta' : 'tiempo';
  }
  return 'na';
}

function parseControlId(summary) {
  // "[APD] GB.IT.APD.ARI.05" → "GB.IT.APD.ARI.05"
  const match = summary.match(/\]\s*(.+)$/);
  return match ? match[1].trim() : summary.trim();
}

function parseControlType(summary) {
  // "[APD] GB.IT.APD.ARI.05" → "APD"
  const match = summary.match(/^\[([A-Z]+)\]/);
  return match ? match[1] : null;
}

function parseMonthYear(parentSummary) {
  // "[MAR-2026] - ITGC Execution - SAP" → { month: 'mar', year: '2026' }
  const match = parentSummary.match(/\[([A-Z]{3})-(\d{4})\]/);
  if (!match) return null;
  const month = MONTH_MAP[match[1]] || match[1].toLowerCase();
  return { month, year: match[2] };
}

function parsePlatform(parentSummary) {
  // "[MAR-2026] - ITGC Execution - SAP" → "SAP ECC"
  const parts = parentSummary.split(' - ');
  const raw = (parts[parts.length - 1] || '').trim();
  return PLATFORM_MAP[raw] || PLATFORM_MAP[raw.toUpperCase()] || raw;
}

function parseDueDate(parentDescription) {
  // "Periodo de Control: 01/03/2026 al 31/03/2026" → "2026-03-31"
  if (!parentDescription) return null;
  const text = typeof parentDescription === 'string'
    ? parentDescription
    : JSON.stringify(parentDescription);
  const match = text.match(/al\s+(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function deriveFrequency(controlId) {
  // Most controls are monthly; some known quarterly ones
  const quarterlyPatterns = ['ACC.AWS.02', 'ACC.SAP.02', 'ACC.GRC.01', 'ACC.Ariba.01', 'ACC.MAG.01'];
  return quarterlyPatterns.some(p => controlId.includes(p)) ? 'Quarterly' : 'Monthly';
}

function deriveResponsible(app, controlType) {
  const map = {
    'AWS': 'IST Architecture', 'SAP ECC': 'Basis SAP', 'S4H': 'Basis SAP',
    'BW': 'BW Team', 'SAPHDB': 'DBA Team', 'GRC': 'GRC Team',
    'SOLMAN': 'Basis SAP', 'Ariba': 'Ariba Team', 'PAPM': 'PaPM Team',
    'BTP': 'IST Architecture', 'SLT': 'Basis SAP', 'Magnitude': 'BI Team',
    'SSFF': 'SSFF Team', 'Glow': 'INFR Team', 'INFR': 'INFR Team',
    'Linux': 'INFR Team', 'Windows': 'INFR Team', 'AD': 'INFR Team',
    'Lumen': 'INFR Team', 'Cirion': 'INFR Team'
  };
  return map[app] || 'Unknown';
}

function transformToDashboard(subtasks, parentMap) {
  // Build control data grouped by control ID
  const controlMap = new Map(); // controlId → { control, monthStatuses }

  for (const issue of subtasks) {
    const summary = issue.fields?.summary || '';
    const controlId = parseControlId(summary);
    if (!controlId || !controlId.startsWith('GB.IT.')) continue;

    const parentKey = issue.fields?.parent?.key;
    const parent = parentMap.get(parentKey);
    if (!parent) continue;

    const parentSummary = parent.fields?.summary || '';
    const monthYear = parseMonthYear(parentSummary);
    if (!monthYear) continue;

    const platform = parsePlatform(parentSummary);
    const dueDate = parseDueDate(parent.fields?.description);
    const jiraStatus = issue.fields?.status?.name || '';
    const dashStatus = mapStatus(jiraStatus, dueDate);

    // Find month index in MONTHS array
    const monthIdx = MONTHS.findIndex((m, i) =>
      m === monthYear.month && MONTH_YEARS[i] === monthYear.year
    );

    if (!controlMap.has(controlId)) {
      controlMap.set(controlId, {
        control: {
          id: controlId,
          desc: extractDescription(issue.fields?.description),
          app: platform,
          freq: deriveFrequency(controlId),
          resp: issue.fields?.assignee?.displayName || deriveResponsible(platform)
        },
        months: ['na', 'na', 'na', 'na', 'na']
      });
    }

    if (monthIdx >= 0) {
      controlMap.get(controlId).months[monthIdx] = dashStatus;
    }
  }

  // Assemble output
  const controls = [];
  const monthlyData = {};
  for (const [id, data] of controlMap) {
    controls.push(data.control);
    monthlyData[id] = data.months;
  }

  return { controls, monthlyData, months: MONTHS, monthLabels: MONTH_LABELS };
}

function extractDescription(desc) {
  if (!desc) return '';
  // Jira API v3 returns ADF (Atlassian Document Format)
  if (typeof desc === 'object' && desc.content) {
    return extractSectionFromAdf(desc, 'Control Description', 'Control Evidence');
  }
  // Plain text fallback — extract between markers
  const text = String(desc);
  return extractSectionFromPlainText(text);
}

function extractSectionFromPlainText(text) {
  const startMarker = 'Control Description';
  const endMarker = 'Control Evidence';
  const startIdx = text.indexOf(startMarker);
  if (startIdx === -1) {
    // No marker found — return first line as fallback
    const first = text.split('\n')[0];
    return first.length > 200 ? first.substring(0, 200) + '...' : first;
  }
  const afterStart = text.substring(startIdx + startMarker.length);
  const endIdx = afterStart.indexOf(endMarker);
  const section = endIdx >= 0 ? afterStart.substring(0, endIdx) : afterStart;
  return section.replace(/^[\s:;\-]+/, '').replace(/[\s:;\-]+$/, '').trim();
}

function extractSectionFromAdf(doc, startHeading, endHeading) {
  // Flatten ADF to an array of {type, text} blocks
  const blocks = flattenAdfBlocks(doc);
  let capturing = false;
  let result = [];
  for (const block of blocks) {
    if (block.heading && block.text.includes(startHeading)) {
      capturing = true;
      continue;
    }
    if (capturing && block.heading && block.text.includes(endHeading)) {
      break;
    }
    if (capturing && block.text.trim()) {
      result.push(block.text.trim());
    }
  }
  if (result.length) return result.join(' ');
  // Fallback: no section markers found, extract all text
  const allText = blocks.map(b => b.text).join(' ').trim();
  return allText.length > 200 ? allText.substring(0, 200) + '...' : allText;
}

function flattenAdfBlocks(node) {
  if (!node) return [];
  const blocks = [];
  if (node.type === 'text') return [{ heading: false, text: node.text || '' }];
  if (node.type === 'heading') {
    const text = (node.content || []).map(c => extractAdfText(c)).join('');
    return [{ heading: true, text }];
  }
  if (node.type === 'paragraph' || node.type === 'bulletList' || node.type === 'orderedList' || node.type === 'listItem') {
    const text = extractAdfText(node);
    if (text) blocks.push({ heading: false, text });
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      blocks.push(...flattenAdfBlocks(child));
    }
  }
  return blocks;
}

function extractAdfText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.text || '';
  if (Array.isArray(node.content)) {
    return node.content.map(extractAdfText).join('');
  }
  return '';
}

module.exports = { transformToDashboard, mapStatus, parseControlId, parseMonthYear, parsePlatform };
