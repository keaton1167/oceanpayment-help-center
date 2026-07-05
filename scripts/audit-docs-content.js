const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOC_ROOTS = ['docs', path.join('i18n', 'en', 'docusaurus-plugin-content-docs', 'current')];
const ENGLISH_DOC_IDS = [
  'odpm-guide/section-guide/blacklist-operation-manual',
  'odpm-guide/section-guide/digital-platform-guidelines-manual',
  'odpm-guide/section-guide/digital-platform-guidelines-manual-all-exceptions',
  'odpm-guide/section-guide/high-fraud-risk-alert-manual',
  'odpm-guide/section-guide/klarna-payment-operations-guide',
  'odpm-guide/section-guide/merchant-initiated-chargeback-recall-guidelines',
  'odpm-guide/section-guide/assign-account-setting',
  'odpm-guide/section-guide/opccount-guideline',
  'odpm-guide/section-guide/reconciliation-guide',
  'odpm-guide/section-guide/reconciliation-guideline',
  'odpm-guide/section-guide/merchant-batch-representment-submission-guide',
  'odpm-guide/section-guide/whitelist-operation-manual',
];
const PHASE2_ZH_DOC_IDS = [
  'odpm-guide/section-guide/agreement-signing-operation-manual',
  'odpm-guide/section-guide/digital-platform-guide-exception-transaction-management',
];
const MANAGED_DOC_IDS = new Set([...ENGLISH_DOC_IDS, ...PHASE2_ZH_DOC_IDS]);
const BAD_MARKERS = [
  ['\u65e0\u6cd5\u63d0\u53d6\u4e0b\u8f7d\u94fe\u63a5', 'contains Feishu bad attachment placeholder'],
  ['\u65e0\u6cd5\u63d0\u53d6\u9644\u4ef6', 'contains failed attachment extraction placeholder'],
  ['\u65e0\u6cd5\u89e3\u6790\u8868\u683c', 'contains failed table parsing placeholder'],
  ['\u8868\u683c\u7ed3\u6784\u9700\u4eba\u5de5\u6838\u5bf9', 'contains unresolved table review placeholder'],
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (/\.mdx?$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseFrontmatter(content) {
  content = content.replace(/^\uFEFF/, '');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return {frontmatter: '', body: content};
  }
  return {frontmatter: match[1], body: content.slice(match[0].length)};
}

function report(issues, file, line, message) {
  const relative = path.relative(ROOT, file).replace(/\\/g, '/');
  issues.push(`${relative}:${line}: ${message}`);
}

function lineNumber(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
}

function hasReadableImageHeader(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.length < 12) {
    return false;
  }

  const ascii = buffer.toString('ascii', 0, 12);
  const hex = buffer.toString('hex', 0, 12);
  return (
    hex.startsWith('89504e470d0a1a0a') ||
    hex.startsWith('ffd8ff') ||
    ascii.startsWith('GIF87a') ||
    ascii.startsWith('GIF89a') ||
    (ascii.startsWith('RIFF') && buffer.toString('ascii', 8, 12) === 'WEBP')
  );
}

function checkStaticAsset(issues, file, content, url, index) {
  if (!url || /^(?:[a-z]+:)?\/\//i.test(url) || url.startsWith('#')) {
    return;
  }

  const cleanUrl = url.split(/[?#]/)[0];
  if (!cleanUrl.startsWith('/img/') && !cleanUrl.startsWith('/files/')) {
    return;
  }

  const staticPath = path.join(ROOT, 'static', safeDecode(cleanUrl.replace(/^\//, '')));
  if (!fs.existsSync(staticPath)) {
    report(issues, file, lineNumber(content, index), `missing static asset: ${cleanUrl}`);
    return;
  }

  const stat = fs.statSync(staticPath);
  if (stat.size === 0) {
    report(issues, file, lineNumber(content, index), `empty static asset: ${cleanUrl}`);
    return;
  }

  if (/\/img\//.test(cleanUrl) && !hasReadableImageHeader(staticPath)) {
    report(issues, file, lineNumber(content, index), `invalid image asset: ${cleanUrl}`);
  }
}

function checkStaticAssets(issues, file, content) {
  const patterns = [
    /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
    /<img\b[^>]*\bsrc="([^"]+)"/g,
    /<a\b[^>]*\bhref="([^"]+)"/g,
    /\[[^\]]+]\((\/files\/[^)\s]+)(?:\s+"[^"]*")?\)/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content))) {
      checkStaticAsset(issues, file, content, match[1], match.index);
    }
  }
}

function checkHeadingNumberHierarchy(issues, file, body) {
  const seen = new Set();
  const headingPattern = /^(#{2,6})\s+(\d+(?:\.\d+)*)(?:[.)])?\s+/gm;
  let match;

  while ((match = headingPattern.exec(body))) {
    const marker = match[1];
    const number = match[2];
    const parts = number.split('.');
    const parentNumber = parts.slice(0, -1).join('.');

    if (marker.length >= 4 && parentNumber && !seen.has(parentNumber)) {
      report(
        issues,
        file,
        lineNumber(body, match.index),
        `numbered heading "${number}" is missing parent heading "${parentNumber}"; likely imported one level too deep`,
      );
    }

    seen.add(number);
  }
}

function checkManagedMarkdownFormatting(issues, file, body) {
  const checks = [
    [/^\s*\d+\\[.)]\s+/gm, 'escaped ordered-list marker; expected plain "1. item"'],
    [/^\s*-\s+-\s+/gm, 'collapsed nested bullet marker; expected indented "- item"'],
    [/\*\*[QA]:\s*\*\*\*/g, 'malformed Q/A bold marker from Feishu export'],
    [/^#{2,6}\s+.*\*\*\*\*/gm, 'malformed bold marker in heading'],
  ];

  for (const [pattern, message] of checks) {
    let match;
    while ((match = pattern.exec(body))) {
      report(issues, file, lineNumber(body, match.index), message);
    }
  }
}

const issues = [];

for (const root of DOC_ROOTS) {
  for (const file of walk(path.join(ROOT, root))) {
    const content = fs.readFileSync(file, 'utf8');
    const {frontmatter, body} = parseFrontmatter(content);

    for (const [marker, message] of BAD_MARKERS) {
      const markerIndex = content.indexOf(marker);
      if (markerIndex !== -1) {
        report(issues, file, lineNumber(content, markerIndex), message);
      }
    }

    const h1Match = body.match(/^#\s+/m);
    const docId = path
      .relative(path.join(ROOT, root), path.dirname(file))
      .replace(/\\/g, '/');

    const isManagedPage = MANAGED_DOC_IDS.has(docId);

    if (isManagedPage && h1Match) {
      report(issues, file, lineNumber(body, h1Match.index), 'contains H1 in body; right TOC only supports H2/H3');
    }

    if (isManagedPage && !/^hide_title:\s*true\s*$/m.test(frontmatter)) {
      report(issues, file, 1, 'managed page is missing hide_title: true');
    }

    if (isManagedPage) {
      checkHeadingNumberHierarchy(issues, file, body);
      checkManagedMarkdownFormatting(issues, file, body);
    }

    checkStaticAssets(issues, file, content);
  }
}

if (issues.length) {
  console.error(`Docs audit failed with ${issues.length} issue(s):`);
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log('Docs audit passed.');
