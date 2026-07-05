const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DOWNLOADS_CSV = path.join(ROOT, 'migration', 'reports', 'old-support-attachment-downloads-en.csv');
const REPORT_MD = path.join(ROOT, 'migration', 'reports', 'en-attachment-links-localized.md');
const REPORT_CSV = path.join(ROOT, 'migration', 'reports', 'en-attachment-links-localized.csv');
const SEARCH_ROOTS = [
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

function sitePath(localBackup) {
  return `/${localBackup.replace(/^static[\\/]/, '').replace(/\\/g, '/')}`;
}

function normalizeUrl(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function basenameKey(value) {
  const decoded = normalizeUrl(value);
  const basename = decoded.split(/[\\/]/).pop() || decoded;
  return basename
    .toLowerCase()
    .replace(/[_\s%-]+/g, '-')
    .replace(/[^\p{L}\p{N}.]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildMaps(rows) {
  const exact = new Map();
  const basename = new Map();

  for (const row of rows) {
    if (row.status !== 'downloaded' || !row.attachment_url || !row.local_backup) {
      continue;
    }

    const replacement = sitePath(row.local_backup);
    const entry = {
      oldUrl: row.attachment_url,
      replacement,
      title: row.title,
      attachmentTitle: row.attachment_title,
      localBackup: row.local_backup,
    };

    exact.set(row.attachment_url, entry);
    exact.set(normalizeUrl(row.attachment_url), entry);
    basename.set(basenameKey(row.attachment_url), entry);
  }

  return {exact, basename};
}

function main() {
  const rows = parseCsv(DOWNLOADS_CSV);
  const maps = buildMaps(rows);
  const mdxFiles = SEARCH_ROOTS.flatMap((root) =>
    walkFiles(root, (filePath) => filePath.endsWith('.mdx')),
  );

  const urlPattern = /https?:\/\/support\.oceanpayment\.com\/(?:en\/)?wp-content\/uploads\/[^\s)\]"]+/g;
  const replacements = [];
  const unmatched = [];

  for (const filePath of mdxFiles) {
    const original = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    const updated = original.replace(urlPattern, (oldUrl) => {
      const entry =
        maps.exact.get(oldUrl) ||
        maps.exact.get(normalizeUrl(oldUrl)) ||
        maps.basename.get(basenameKey(oldUrl));

      if (!entry) {
        unmatched.push({
          path: path.relative(ROOT, filePath),
          oldUrl,
        });
        return oldUrl;
      }

      changed = true;
      replacements.push({
        path: path.relative(ROOT, filePath),
        oldUrl,
        localUrl: entry.replacement,
        title: entry.title,
        attachmentTitle: entry.attachmentTitle,
      });
      return entry.replacement;
    });

    if (changed) {
      fs.writeFileSync(filePath, updated, 'utf8');
    }
  }

  const summary = {
    replacedLinks: replacements.length,
    affectedFiles: new Set(replacements.map((entry) => entry.path)).size,
    unmatchedLinks: unmatched.length,
  };

  const mdLines = [
    '# 英文附件链接本地化报告',
    '',
    `生成时间：${new Date().toISOString()}`,
    '',
    '## 汇总',
    '',
    `- 替换链接数：${summary.replacedLinks}`,
    `- 影响文件数：${summary.affectedFiles}`,
    `- 未匹配旧站链接数：${summary.unmatchedLinks}`,
    '',
    '## 替换清单',
    '',
    '| 文件 | 附件标题 | 本地路径 |',
    '|---|---|---|',
    ...replacements.map(
      (entry) => `| \`${entry.path.replace(/\\/g, '/')}\` | ${entry.attachmentTitle} | \`${entry.localUrl}\` |`,
    ),
    '',
  ];

  if (unmatched.length > 0) {
    mdLines.push('## 未匹配链接', '');
    mdLines.push('| 文件 | 旧链接 |');
    mdLines.push('|---|---|');
    mdLines.push(...unmatched.map((entry) => `| \`${entry.path.replace(/\\/g, '/')}\` | ${entry.oldUrl} |`));
    mdLines.push('');
  }

  const csvRows = [
    ['path', 'attachment_title', 'old_url', 'local_url'],
    ...replacements.map((entry) => [entry.path, entry.attachmentTitle, entry.oldUrl, entry.localUrl]),
  ];

  fs.writeFileSync(REPORT_MD, mdLines.join('\n'), 'utf8');
  fs.writeFileSync(REPORT_CSV, csvRows.map((row) => row.map(csvCell).join(',')).join('\n'), 'utf8');

  console.log(
    `Localized ${summary.replacedLinks} English attachment links in ${summary.affectedFiles} files; unmatched ${summary.unmatchedLinks}.`,
  );
}

main();
