const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REVIEW_CSV = path.join(ROOT, 'migration', 'review', 'attachment-review-en-index.csv');
const OUTPUT_ROOT = path.join(ROOT, 'static', 'files', 'help-center', 'wordpress-attachments-en');
const REVIEW_DIR = path.join(ROOT, 'migration', 'review', 'attachments-en');
const REPORT_PATH = path.join(ROOT, 'migration', 'reports', 'old-support-attachment-downloads-en.csv');
const REVIEW_INDEX_MD = path.join(ROOT, 'migration', 'review', 'attachment-review-en-files.md');
const REVIEW_INDEX_CSV = path.join(ROOT, 'migration', 'review', 'attachment-review-en-files.csv');

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

function csvEscape(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function toPosix(filePath) {
  return filePath.replace(/\\/g, '/');
}

function safeFileName(value) {
  return String(value || 'attachment')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'attachment';
}

function getExtension(url, fallbackType) {
  try {
    const ext = path.extname(decodeURIComponent(new URL(url).pathname));
    if (ext && ext.length <= 10) return ext;
  } catch {
    // Fall through to type-based extension.
  }

  return fallbackType ? `.${fallbackType}` : '.bin';
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

function buildFileNames(row, index) {
  const ext = getExtension(row.attachment_url, row.attachment_type);
  const serial = String(index + 1).padStart(2, '0');
  const baseName = `${serial} - ${safeFileName(row.old_category)} - ${safeFileName(row.title)} - ${safeFileName(
    row.attachment_title,
  )}${ext}`;

  return {
    backupPath: path.join(OUTPUT_ROOT, `attachment-${serial}${ext}`),
    reviewPath: path.join(REVIEW_DIR, baseName),
  };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const rows = parseCsv(REVIEW_CSV);
  const report = [];

  fs.mkdirSync(OUTPUT_ROOT, {recursive: true});
  fs.mkdirSync(REVIEW_DIR, {recursive: true});

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const {backupPath, reviewPath} = buildFileNames(row, index);
    const backupRel = toPosix(path.relative(ROOT, backupPath));
    const reviewRel = toPosix(path.relative(ROOT, reviewPath));

    if (dryRun) {
      report.push({...row, status: 'dry-run', local_backup: backupRel, review_copy: reviewRel, size: '', content_type: '', error: ''});
      continue;
    }

    try {
      let result;
      if (fs.existsSync(backupPath) && fs.statSync(backupPath).size > 0) {
        result = {size: fs.statSync(backupPath).size, contentType: 'existing'};
      } else {
        result = await download(row.attachment_url, backupPath);
      }

      fs.copyFileSync(backupPath, reviewPath);

      report.push({
        ...row,
        status: 'downloaded',
        local_backup: backupRel,
        review_copy: reviewRel,
        size: result.size,
        content_type: result.contentType,
        error: '',
      });
      console.log(`Downloaded ${index + 1}/${rows.length}: ${reviewRel}`);
    } catch (error) {
      report.push({
        ...row,
        status: 'failed',
        local_backup: backupRel,
        review_copy: reviewRel,
        size: '',
        content_type: '',
        error: error.message,
      });
      console.log(`Failed ${index + 1}/${rows.length}: ${row.attachment_url} (${error.message})`);
    }
  }

  const headers = [
    'status',
    'old_category',
    'old_category_order',
    'source_order',
    'title',
    'current_action',
    'target_path',
    'attachment_title',
    'attachment_type',
    'attachment_url',
    'duplicate_check',
    'local_backup',
    'review_copy',
    'size',
    'content_type',
    'error',
  ];
  const csv = [
    headers.map(csvEscape).join(','),
    ...report.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ];

  const downloaded = report.filter((row) => row.status === 'downloaded');
  const failed = report.filter((row) => row.status === 'failed');
  const mdLines = [
    '# 英文附件本地备份索引',
    '',
    '用途：这份清单用于查看英文旧站附件的本地备份文件和运营审核副本。',
    '',
    `生成时间：${new Date().toISOString()}`,
    '',
    '## 汇总',
    '',
    `- 附件链接数：${report.length}`,
    `- 下载成功：${downloaded.length}`,
    `- 下载失败：${failed.length}`,
    `- 本地备份目录：\`${toPosix(path.relative(ROOT, OUTPUT_ROOT))}/\``,
    `- 审核副本目录：\`${toPosix(path.relative(ROOT, REVIEW_DIR))}/\``,
    '',
    '## 文件索引',
    '',
    '| # | 状态 | 英文文章 | 附件标题 | 当前处理 | 本地备份 | 审核副本 | 错误 |',
    '|---:|---|---|---|---|---|---|---|',
    ...report.map(
      (row, index) =>
        `| ${index + 1} | ${row.status} | ${row.title} | ${row.attachment_title} | ${row.current_action} | \`${
          row.local_backup
        }\` | \`${row.review_copy}\` | ${row.error || ''} |`,
    ),
    '',
  ];

  fs.writeFileSync(REPORT_PATH, `${csv.join('\n')}\n`, 'utf8');
  fs.writeFileSync(REVIEW_INDEX_MD, `${mdLines.join('\n')}\n`, 'utf8');
  fs.writeFileSync(REVIEW_INDEX_CSV, `${csv.join('\n')}\n`, 'utf8');

  console.log(`Finished ${report.length} English attachments: ${downloaded.length} downloaded, ${failed.length} failed.`);
  console.log(toPosix(path.relative(ROOT, REPORT_PATH)));
  console.log(toPosix(path.relative(ROOT, REVIEW_INDEX_MD)));
  console.log(toPosix(path.relative(ROOT, REVIEW_INDEX_CSV)));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
