const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const AUDIT_PATH = path.join(ROOT, 'migration', 'reports', 'zh-migration-audit.csv');
const BACKUP_DIR = path.join(ROOT, 'static', 'files', 'help-center', 'wordpress-attachments-odpm');
const REVIEW_DIR = path.join(ROOT, 'migration', 'review', 'attachments-odpm');
const REVIEW_REPORT = path.join(ROOT, 'migration', 'review', 'attachment-review-odpm-index.md');
const REVIEW_CSV = path.join(ROOT, 'migration', 'review', 'attachment-review-odpm-index.csv');
const DOWNLOAD_REPORT = path.join(ROOT, 'migration', 'reports', 'old-support-attachment-downloads-odpm.csv');

const OLD_CATEGORY = 'ODPM后台板块操作指引';
const LINK_RE = /\[([^\]]+)]\((https?:\/\/support\.oceanpayment\.com\/wp-content\/uploads\/[^)]+)\)/g;

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

function getLineNumber(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function getExtension(url) {
  const pathname = new URL(url).pathname;
  const ext = path.extname(decodeURIComponent(pathname));
  return ext && ext.length <= 8 ? ext : '.bin';
}

function requestUrl(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error('Too many redirects'));
      return;
    }

    const parsed = new URL(url);
    const client = parsed.protocol === 'http:' ? http : https;
    const req = client.get(
      parsed,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 help-center-migration',
          Accept: '*/*',
        },
      },
      (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          const location = res.headers.location;
          res.resume();
          if (!location) {
            reject(new Error(`Redirect without location: ${res.statusCode}`));
            return;
          }
          resolve(requestUrl(new URL(location, parsed).toString(), redirectCount + 1));
          return;
        }

        resolve(res);
      },
    );

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy(new Error('Request timed out'));
    });
  });
}

async function download(url, targetPath) {
  const res = await requestUrl(url);
  const statusCode = res.statusCode || 0;
  const contentType = res.headers['content-type'] || '';

  if (statusCode < 200 || statusCode >= 300) {
    res.resume();
    throw new Error(`HTTP ${statusCode}`);
  }

  fs.mkdirSync(path.dirname(targetPath), {recursive: true});
  const tempPath = `${targetPath}.tmp`;
  const stream = fs.createWriteStream(tempPath);

  await new Promise((resolve, reject) => {
    res.pipe(stream);
    res.on('error', reject);
    stream.on('error', reject);
    stream.on('finish', resolve);
  });

  const size = fs.statSync(tempPath).size;
  if (size === 0) {
    fs.rmSync(tempPath, {force: true});
    throw new Error('Downloaded empty file');
  }

  fs.renameSync(tempPath, targetPath);
  return {size, contentType};
}

function collectLinks() {
  const rows = parseCsv(AUDIT_PATH).filter((row) => row.old_category === OLD_CATEGORY && row.markdown_output);
  const links = [];

  for (const row of rows) {
    const sourcePath = path.join(ROOT, row.markdown_output);
    if (!fs.existsSync(sourcePath)) continue;

    const content = fs.readFileSync(sourcePath, 'utf8');
    let match;
    while ((match = LINK_RE.exec(content))) {
      links.push({
        oldCategory: row.old_category,
        oldTitle: row.title,
        sourceMarkdown: row.markdown_output,
        line: getLineNumber(content, match.index),
        attachmentTitle: match[1].replace(/\\_/g, '_'),
        oldUrl: match[2],
      });
    }
  }

  return links;
}

async function main() {
  const links = collectLinks();
  const results = [];

  fs.mkdirSync(BACKUP_DIR, {recursive: true});
  fs.mkdirSync(REVIEW_DIR, {recursive: true});

  for (let index = 0; index < links.length; index += 1) {
    const link = links[index];
    const ext = getExtension(link.oldUrl);
    const backupName = `attachment-${String(index + 1).padStart(2, '0')}-${safeFileName(link.oldTitle)}${ext}`;
    const backupPath = path.join(BACKUP_DIR, backupName);
    const reviewName = `${String(index + 1).padStart(2, '0')} - ${safeFileName(link.oldCategory)} - ${safeFileName(link.oldTitle)} - ${safeFileName(link.attachmentTitle)}${ext}`;
    const reviewPath = path.join(REVIEW_DIR, reviewName);

    try {
      let result;
      if (fs.existsSync(backupPath) && fs.statSync(backupPath).size > 0) {
        result = {size: fs.statSync(backupPath).size, contentType: 'existing'};
      } else {
        result = await download(link.oldUrl, backupPath);
      }

      fs.copyFileSync(backupPath, reviewPath);
      results.push({
        status: 'downloaded',
        ...link,
        localBackup: toPosix(path.relative(ROOT, backupPath)),
        reviewCopy: toPosix(path.relative(ROOT, reviewPath)),
        size: result.size,
        contentType: result.contentType,
        error: '',
      });
      console.log(`Downloaded ${index + 1}/${links.length}: ${toPosix(path.relative(ROOT, reviewPath))}`);
    } catch (error) {
      results.push({
        status: 'failed',
        ...link,
        localBackup: toPosix(path.relative(ROOT, backupPath)),
        reviewCopy: toPosix(path.relative(ROOT, reviewPath)),
        size: '',
        contentType: '',
        error: error.message,
      });
      console.log(`Failed ${index + 1}/${links.length}: ${link.oldUrl} (${error.message})`);
    }
  }

  const headers = [
    'status',
    'oldCategory',
    'oldTitle',
    'attachmentTitle',
    'sourceMarkdown',
    'line',
    'oldUrl',
    'localBackup',
    'reviewCopy',
    'size',
    'contentType',
    'error',
  ];
  const csvLines = [
    headers.map(csvEscape).join(','),
    ...results.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ];
  fs.writeFileSync(DOWNLOAD_REPORT, csvLines.join('\n'), 'utf8');
  fs.writeFileSync(REVIEW_CSV, csvLines.join('\n'), 'utf8');

  const mdLines = [
    '# ODPM后台板块操作指引附件审核索引',
    '',
    '用途：这份清单用于人工确认旧目录 `ODPM后台板块操作指引` 中的附件是否已经迁移到新项目，或是否仍需保留为附件。',
    '',
    `审核附件目录：\`migration/review/attachments-odpm/\``,
    '',
    '| # | 旧目录 | 旧文章 | 附件标题 | WordPress 导出源 | 审核副本 | 状态 |',
    '|---|---|---|---|---|---|---|',
    ...results.map(
      (row, index) =>
        `| ${index + 1} | ${row.oldCategory} | ${row.oldTitle} | ${row.attachmentTitle} | \`${row.sourceMarkdown}:${row.line}\` | \`${row.reviewCopy}\` | ${row.status}${row.error ? `: ${row.error}` : ''} |`,
    ),
    '',
  ];
  fs.writeFileSync(REVIEW_REPORT, mdLines.join('\n'), 'utf8');

  const success = results.filter((row) => row.status === 'downloaded').length;
  const failed = results.filter((row) => row.status === 'failed').length;
  console.log(`Prepared ${results.length} ODPM attachments: ${success} downloaded, ${failed} failed.`);
  console.log(toPosix(path.relative(ROOT, REVIEW_REPORT)));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
