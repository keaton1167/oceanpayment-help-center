const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const AUDIT_CSV = path.join(ROOT, 'migration', 'reports', 'doc-resource-audit.csv');
const OUTPUT_ROOT = path.join(ROOT, 'static', 'files', 'help-center', 'wordpress-attachments');
const REPORT_PATH = path.join(ROOT, 'migration', 'reports', 'old-support-attachment-downloads.csv');

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

function getDocSlug(filePath) {
  const parts = toPosix(filePath).split('/');
  return parts.length >= 2 ? parts[parts.length - 2] : 'unknown-doc';
}

function getExtension(url) {
  const pathname = new URL(url).pathname;
  const ext = path.extname(decodeURIComponent(pathname));
  return ext && ext.length <= 8 ? ext : '.bin';
}

function buildTargetPath(row, index) {
  const docSlug = getDocSlug(row.file);
  const ext = getExtension(row.target);
  const fileName = `attachment-${String(index + 1).padStart(2, '0')}-${row.line}${ext}`;
  return path.join(OUTPUT_ROOT, docSlug, fileName);
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

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const rows = parseCsv(AUDIT_CSV).filter((row) => row.type === 'old-support-upload-link');
  const seen = new Set();
  const uniqueRows = rows.filter((row) => {
    const key = `${row.file}|${row.line}|${row.target}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const report = [];

  for (let index = 0; index < uniqueRows.length; index += 1) {
    const row = uniqueRows[index];
    const targetPath = buildTargetPath(row, index);
    const localPath = toPosix(path.relative(ROOT, targetPath));

    if (dryRun) {
      report.push({...row, status: 'dry-run', localPath, size: '', contentType: '', error: ''});
      continue;
    }

    try {
      let result;
      if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 0) {
        result = {size: fs.statSync(targetPath).size, contentType: 'existing'};
      } else {
        result = await download(row.target, targetPath);
      }

      report.push({
        ...row,
        status: 'downloaded',
        localPath,
        size: result.size,
        contentType: result.contentType,
        error: '',
      });
      console.log(`Downloaded ${index + 1}/${uniqueRows.length}: ${localPath}`);
    } catch (error) {
      report.push({
        ...row,
        status: 'failed',
        localPath,
        size: '',
        contentType: '',
        error: error.message,
      });
      console.log(`Failed ${index + 1}/${uniqueRows.length}: ${row.target} (${error.message})`);
    }
  }

  const headers = ['status', 'file', 'line', 'target', 'localPath', 'size', 'contentType', 'error', 'context'];
  const lines = [
    headers.map(csvEscape).join(','),
    ...report.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ];
  fs.writeFileSync(REPORT_PATH, lines.join('\n'), 'utf8');

  const success = report.filter((row) => row.status === 'downloaded').length;
  const failed = report.filter((row) => row.status === 'failed').length;
  console.log(`${dryRun ? 'Planned' : 'Finished'} ${report.length} attachments: ${success} downloaded, ${failed} failed.`);
  console.log(toPosix(path.relative(ROOT, REPORT_PATH)));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
