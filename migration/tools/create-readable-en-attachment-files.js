const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const LINK_REPORT = path.join(ROOT, 'migration', 'reports', 'en-attachment-links-localized.csv');
const STATIC_DIR = path.join(ROOT, 'static', 'files', 'help-center', 'wordpress-attachments-en');
const REPORT_MD = path.join(ROOT, 'migration', 'reports', 'en-readable-attachment-files.md');
const REPORT_CSV = path.join(ROOT, 'migration', 'reports', 'en-readable-attachment-files.csv');
const DOC_ROOTS = [
  path.join(ROOT, 'docs'),
  path.join(ROOT, 'i18n', 'en', 'docusaurus-plugin-content-docs', 'current'),
];

function parseCsvLine(line) {
  const cells = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === ',' && !quoted) {
      cells.push(cell);
      cell = '';
      continue;
    }

    cell += char;
  }

  cells.push(cell);
  return cells;
}

function parseCsv(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').trimEnd().split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
  });
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function cleanFileName(value) {
  return String(value || 'attachment')
    .replace(/[\/\\:*?"<>|]/g, '_')
    .replace(/[\x00-\x1f]/g, '')
    .trim() || 'attachment';
}

function ensureExtension(fileName, sourceName) {
  const ext = path.extname(sourceName);
  if (!ext) return fileName;
  return fileName.toLowerCase().endsWith(ext.toLowerCase()) ? fileName : `${fileName}${ext}`;
}

function uniqueTargetName(baseName, usedNames, sourceName) {
  const ext = path.extname(baseName);
  const stem = ext ? baseName.slice(0, -ext.length) : baseName;
  let candidate = baseName;
  let index = 2;

  while (usedNames.has(candidate.toLowerCase()) && usedNames.get(candidate.toLowerCase()) !== sourceName) {
    candidate = `${stem} ${index}${ext}`;
    index += 1;
  }

  usedNames.set(candidate.toLowerCase(), sourceName);
  return candidate;
}

function walkFiles(dirPath, predicate, files = []) {
  if (!fs.existsSync(dirPath)) {
    return files;
  }

  for (const entry of fs.readdirSync(dirPath, {withFileTypes: true})) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(entryPath, predicate, files);
    } else if (predicate(entryPath)) {
      files.push(entryPath);
    }
  }

  return files;
}

function stripMarkdown(value) {
  return String(value || '')
    .replace(/\\([\\`*_[\]{}()#+\-.!|])/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function collectLinksFromDocs() {
  const links = [];
  const linkPattern = /\[([^\]]+)\]\(\/files\/help-center\/wordpress-attachments-en\/(attachment-\d+\.(?:pdf|docx|doc|pptx|ppt|xlsx|xls))\)/gi;
  const files = DOC_ROOTS.flatMap((root) => walkFiles(root, (filePath) => filePath.endsWith('.mdx')));

  for (const filePath of files) {
    const markdown = fs.readFileSync(filePath, 'utf8');
    let match;
    while ((match = linkPattern.exec(markdown)) !== null) {
      links.push({
        path: path.relative(ROOT, filePath),
        title: stripMarkdown(match[1]),
        sourceName: match[2],
      });
    }
  }

  return links;
}

function main() {
  const rows = parseCsv(LINK_REPORT);
  const docLinks = collectLinksFromDocs();
  const usedNames = new Map();
  const created = [];
  const missing = [];
  const seen = new Set();

  const candidates = docLinks.length > 0
    ? docLinks
    : rows.map((row) => ({
        path: row.path,
        title: row.attachment_title,
        sourceName: path.basename(row.local_url || ''),
      }));

  for (const row of candidates) {
    const sourceName = row.sourceName;
    if (!sourceName || seen.has(`${sourceName}::${row.title}`)) {
      continue;
    }
    seen.add(`${sourceName}::${row.title}`);

    const sourcePath = path.join(STATIC_DIR, sourceName);
    if (!fs.existsSync(sourcePath)) {
      missing.push({sourceName, title: row.title});
      continue;
    }

    const readableName = uniqueTargetName(
      ensureExtension(cleanFileName(row.title), sourceName),
      usedNames,
      sourceName,
    );
    const targetPath = path.join(STATIC_DIR, readableName);

    fs.copyFileSync(sourcePath, targetPath);
    created.push({
      sourceName,
      readableName,
      title: row.title,
      path: row.path,
      localUrl: `/files/help-center/wordpress-attachments-en/${readableName}`,
    });
  }

  const mdLines = [
    '# 英文附件可读文件名生成报告',
    '',
    `生成时间：${new Date().toISOString()}`,
    '',
    '## 汇总',
    '',
    `- 生成可读文件副本：${created.length}`,
    `- 缺失源文件：${missing.length}`,
    '',
    '## 文件清单',
    '',
    '| 页面文件 | 原文件 | 可读文件名 | 页面打开路径 |',
    '|---|---|---|---|',
    ...created.map(
      (entry) => `| \`${entry.path.replace(/\\/g, '/')}\` | \`${entry.sourceName}\` | \`${entry.readableName}\` | \`${entry.localUrl}\` |`,
    ),
    '',
  ];

  if (missing.length > 0) {
    mdLines.push('## 缺失源文件', '');
    mdLines.push('| 原文件 | 附件标题 |');
    mdLines.push('|---|---|');
    mdLines.push(...missing.map((entry) => `| \`${entry.sourceName}\` | ${entry.title} |`));
    mdLines.push('');
  }

  const csvRows = [
    ['path', 'source_name', 'readable_name', 'title', 'local_url'],
    ...created.map((entry) => [entry.path, entry.sourceName, entry.readableName, entry.title, entry.localUrl]),
  ];

  fs.writeFileSync(REPORT_MD, mdLines.join('\n'), 'utf8');
  fs.writeFileSync(REPORT_CSV, csvRows.map((row) => row.map(csvCell).join(',')).join('\n'), 'utf8');

  console.log(`Created ${created.length} readable English attachment files; missing ${missing.length}.`);
}

main();
