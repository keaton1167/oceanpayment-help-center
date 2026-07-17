const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOC_ROOTS = ['docs', path.join('i18n', 'en', 'docusaurus-plugin-content-docs', 'current')];
const CONFIG_PATH = path.join(ROOT, 'docusaurus.config.js');
const LANGUAGE_SWITCHER_PATH = path.join(ROOT, 'static', 'js', 'language-switcher.js');
const DOCUMENT_REGISTRY_PATH = path.join(ROOT, 'content', 'document-registry.json');
const ENGLISH_DOC_IDS = [
  'odpm-guide/section-guide/batch-chargeback-representment-guide',
  'odpm-guide/section-guide/blacklist-operation-manual',
  'odpm-guide/section-guide/chargeback-document-submission-guide',
  'odpm-guide/section-guide/chargeback-recall-verification-guide',
  'odpm-guide/section-guide/common-transaction-response-codes-logistics-upload-guide',
  'odpm-guide/section-guide/digital-platform-guidelines-manual',
  'odpm-guide/section-guide/digital-platform-guidelines-manual-all-exceptions',
  'odpm-guide/section-guide/high-fraud-risk-alert-manual',
  'odpm-guide/section-guide/klarna-payment-operations-guide',
  'odpm-guide/section-guide/assign-account-setting',
  'odpm-guide/section-guide/opccount-guideline',
  'odpm-guide/section-guide/reconciliation-guide',
  'odpm-guide/section-guide/reconciliation-guideline',
  'odpm-guide/section-guide/whitelist-operation-manual',
];
const PHASE2_ZH_DOC_IDS = [
  'odpm-guide/section-guide/agreement-signing-operation-manual',
  'odpm-guide/section-guide/digital-platform-guide-exception-transaction-management',
];
const MANAGED_DOC_IDS = new Set([...ENGLISH_DOC_IDS, ...PHASE2_ZH_DOC_IDS]);
const REQUIRED_NUMBERED_HEADING_DOC_IDS = new Set([
  'odpm-guide/section-guide/high-fraud-risk-alert-manual',
  'odpm-guide/section-guide/blacklist-operation-manual',
  'odpm-guide/section-guide/whitelist-operation-manual',
]);
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

function parseStringArray(source, name) {
  const match = source.match(new RegExp(`(?:const|var)\\s+${name}\\s*=\\s*\\[([\\s\\S]*?)\\]`));
  if (!match) {
    return [];
  }
  return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]);
}

function parseLanguageSwitcherTranslatedDocIds(source) {
  const match = source.match(/var\s+translatedDocIds\s*=\s*makeSet\(\[([\s\S]*?)\]\);/);
  if (!match) {
    return [];
  }
  return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]);
}

function parseYamlString(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch (error) {
      return trimmed.slice(1, -1);
    }
  }
  return trimmed;
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

function checkRequiredHeadingNumbers(issues, file, body) {
  const headingPattern = /^(#{2,4})\s+(?!\d+(?:\.\d+)*\.?\s+)(.+)$/gm;
  let match;

  while ((match = headingPattern.exec(body))) {
    report(
      issues,
      file,
      lineNumber(body, match.index),
      `heading "${match[2]}" is missing its required section number`,
    );
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
const configSource = fs.readFileSync(CONFIG_PATH, 'utf8');
const languageSwitcherSource = fs.readFileSync(LANGUAGE_SWITCHER_PATH, 'utf8');
const registryDocuments = loadDocumentRegistry();
const registryDocumentIds = new Set(registryDocuments.map((document) => document.docId));
const registryEnglishOnlyDocIds = new Set(
  registryDocuments
    .filter((document) => document.publicationMode === 'english-only')
    .map((document) => document.docId),
);
const registryRequiredNumberedHeadingDocIds = new Set(
  registryDocuments
    .filter((document) => document.requireNumberedHeadings)
    .map((document) => document.docId),
);
const configEnglishOnlyDocIds = new Set(parseStringArray(configSource, 'ENGLISH_ONLY_DOC_IDS'));
const configTranslatedDocIds = new Set(parseStringArray(configSource, 'TRANSLATED_DOC_IDS'));
const languageSwitcherTranslatedDocIds = new Set(parseLanguageSwitcherTranslatedDocIds(languageSwitcherSource));

for (const docId of configTranslatedDocIds) {
  if (!languageSwitcherTranslatedDocIds.has(docId)) {
    issues.push(
      `static/js/language-switcher.js:1: missing translated doc id from docusaurus.config.js: ${docId}`,
    );
  }
}

function checkMarkdownTables(issues, file, body) {
  const lines = body.split(/\r?\n/);

  for (let index = 0; index < lines.length - 1; index += 1) {
    if (!/^\|.+\|\s*$/.test(lines[index]) || !/^\|(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(lines[index + 1])) {
      continue;
    }

    const columns = lines[index].split('|').slice(1, -1).length;
    let rowIndex = index + 2;
    while (rowIndex < lines.length && /^\|.+\|\s*$/.test(lines[rowIndex])) {
      const rowColumns = lines[rowIndex].split('|').slice(1, -1).length;
      if (rowColumns !== columns) {
        report(issues, file, rowIndex + 1, `table has ${rowColumns} columns; expected ${columns}`);
      }
      rowIndex += 1;
    }
    index = rowIndex - 1;
  }
}

function loadDocumentRegistry() {
  if (!fs.existsSync(DOCUMENT_REGISTRY_PATH)) {
    return [];
  }

  const registry = JSON.parse(fs.readFileSync(DOCUMENT_REGISTRY_PATH, 'utf8'));
  return Array.isArray(registry.documents) ? registry.documents : [];
}

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

    const isManagedPage = MANAGED_DOC_IDS.has(docId) || registryDocumentIds.has(docId);
    const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
    const title = titleMatch ? parseYamlString(titleMatch[1]) : '';

    if (
      root === 'docs' &&
      docId.startsWith('odpm-guide/section-guide/') &&
      title &&
      !/[\u3400-\u9FFF]/.test(title) &&
      !configEnglishOnlyDocIds.has(docId) &&
      !registryEnglishOnlyDocIds.has(docId) &&
      !configTranslatedDocIds.has(docId)
    ) {
      report(
        issues,
        file,
        1,
        'English-titled ODPM page is in the Chinese docs tree but is not configured as English-only or translated',
      );
    }

    if (isManagedPage && h1Match) {
      report(issues, file, lineNumber(body, h1Match.index), 'contains H1 in body; right TOC only supports H2/H3');
    }

    if (isManagedPage) {
      checkHeadingNumberHierarchy(issues, file, body);
      checkManagedMarkdownFormatting(issues, file, body);
    }

    if (REQUIRED_NUMBERED_HEADING_DOC_IDS.has(docId) || registryRequiredNumberedHeadingDocIds.has(docId)) {
      checkRequiredHeadingNumbers(issues, file, body);
    }

    if (isManagedPage) {
      checkMarkdownTables(issues, file, body);
    }

    checkStaticAssets(issues, file, content);
  }
}

for (const docId of registryEnglishOnlyDocIds) {
  const sourcePath = path.join(ROOT, 'docs', docId, 'index.mdx');
  const englishPath = path.join(ROOT, 'i18n', 'en', 'docusaurus-plugin-content-docs', 'current', docId, 'index.mdx');
  if (!fs.existsSync(sourcePath)) {
    issues.push(`content/document-registry.json: ${docId} is missing docs source file`);
  }
  if (!fs.existsSync(englishPath)) {
    issues.push(`content/document-registry.json: ${docId} is missing English MDX file`);
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
