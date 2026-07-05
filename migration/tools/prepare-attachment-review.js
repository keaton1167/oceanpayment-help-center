const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DOWNLOAD_REPORT = path.join(ROOT, 'migration', 'reports', 'old-support-attachment-downloads.csv');
const AUDIT_PATH = path.join(ROOT, 'migration', 'reports', 'zh-migration-audit.csv');
const REVIEW_DIR = path.join(ROOT, 'migration', 'review', 'attachments');
const REVIEW_REPORT = path.join(ROOT, 'migration', 'review', 'attachment-review-index.md');
const REVIEW_CSV = path.join(ROOT, 'migration', 'review', 'attachment-review-index.csv');

function parseCsvLine(line) {
  const cells = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
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

function csvEscape(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function toPosix(filePath) {
  return filePath.replace(/\\/g, '/');
}

function safeFileName(value) {
  return value
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

function extractLinkText(context) {
  const match = context.match(/\[([^\]]+)]\(/);
  return match ? match[1].replace(/\\_/g, '_') : '附件';
}

function buildAuditMap() {
  const rows = parseCsv(AUDIT_PATH);
  const byTargetFile = new Map();

  for (const row of rows) {
    if (!row.target_directory || !row.candidate_slug) continue;
    const file = `${row.target_directory}/${row.candidate_slug}/index.mdx`;
    byTargetFile.set(file, row);
  }

  return byTargetFile;
}

function main() {
  const downloads = parseCsv(DOWNLOAD_REPORT).filter((row) => row.status === 'downloaded');
  const auditMap = buildAuditMap();
  const rows = [];

  fs.mkdirSync(REVIEW_DIR, {recursive: true});

  downloads.forEach((download, index) => {
    const audit = auditMap.get(download.file) || {};
    const oldCategory = audit.old_category || '(旧目录缺失)';
    const oldTitle = audit.title || path.basename(path.dirname(download.file));
    const attachmentTitle = extractLinkText(download.context);
    const reviewFileName = `${String(index + 1).padStart(2, '0')} - ${safeFileName(oldCategory)} - ${safeFileName(oldTitle)} - ${safeFileName(attachmentTitle)}.pdf`;
    const sourcePath = path.join(ROOT, download.localPath);
    const reviewPath = path.join(REVIEW_DIR, reviewFileName);

    fs.copyFileSync(sourcePath, reviewPath);

    rows.push({
      index: index + 1,
      oldCategory,
      oldTitle,
      attachmentTitle,
      currentDoc: download.file,
      docLine: download.line,
      oldUrl: download.target,
      localBackup: download.localPath,
      reviewCopy: toPosix(path.relative(ROOT, reviewPath)),
      size: download.size,
    });
  });

  const mdLines = [
    '# 旧站附件审核索引',
    '',
    '用途：这份清单用于人工确认旧站附件是否仍需要在新帮助中心中保留，或是否已被正文迁移替代。',
    '',
    `审核附件目录：\`migration/review/attachments/\``,
    '',
    '| # | 旧目录 | 旧文章 | 附件标题 | 当前新文档 | 审核副本 |',
    '|---|---|---|---|---|---|',
    ...rows.map(
      (row) =>
        `| ${row.index} | ${row.oldCategory} | ${row.oldTitle} | ${row.attachmentTitle} | \`${row.currentDoc}:${row.docLine}\` | \`${row.reviewCopy}\` |`,
    ),
    '',
    '## 审核建议',
    '',
    '- 如果附件内容已经完整迁移为 MDX 正文，可以在后续从该文档中删除附件链接。',
    '- 如果附件仍是必要资料，建议后续将 MDX 链接替换为本地备份路径，避免旧站下线后失效。',
    '- 如果附件需要新版替换，请将新版文件提供到迁移目录，再统一替换。',
    '',
  ];

  const csvHeaders = [
    'index',
    'oldCategory',
    'oldTitle',
    'attachmentTitle',
    'currentDoc',
    'docLine',
    'oldUrl',
    'localBackup',
    'reviewCopy',
    'size',
  ];
  const csvLines = [
    csvHeaders.map(csvEscape).join(','),
    ...rows.map((row) => csvHeaders.map((header) => csvEscape(row[header])).join(',')),
  ];

  fs.writeFileSync(REVIEW_REPORT, mdLines.join('\n'), 'utf8');
  fs.writeFileSync(REVIEW_CSV, csvLines.join('\n'), 'utf8');

  console.log(`Prepared ${rows.length} attachment review files.`);
  console.log(toPosix(path.relative(ROOT, REVIEW_REPORT)));
  console.log(toPosix(path.relative(ROOT, REVIEW_CSV)));
}

main();
