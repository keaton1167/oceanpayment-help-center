const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const AUDIT_PATH = path.join(ROOT, 'migration', 'reports', 'en-migration-audit.csv');
const REPORT_DIR = path.join(ROOT, 'migration', 'reports');

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

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\n[\s\S]*?\n---\n*/, '').trim();
}

function yamlString(value) {
  return JSON.stringify(value);
}

function buildFrontmatter(row) {
  return [
    '---',
    `title: ${yamlString(row.title)}`,
    `sidebar_label: ${yamlString(row.title)}`,
    `sidebar_position: ${row.sidebar_position}`,
    '---',
    '',
  ].join('\n');
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, {recursive: true});
}

function main() {
  const dryRun = process.argv.includes('--dry-run');
  const rows = parseCsv(AUDIT_PATH).filter((row) => row.action === 'migrate');
  const imported = [];
  const skipped = [];

  for (const row of rows) {
    const sourcePath = path.join(ROOT, row.markdown_output);
    const targetPath = path.join(ROOT, row.target_path);
    const targetDir = path.dirname(targetPath);

    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Missing source markdown: ${sourcePath}`);
    }

    if (fs.existsSync(targetPath)) {
      skipped.push({
        title: row.title,
        target: row.target_path,
        reason: 'target document already exists',
      });
      continue;
    }

    const sourceMarkdown = fs.readFileSync(sourcePath, 'utf8');
    const output = `${buildFrontmatter(row)}${stripFrontmatter(sourceMarkdown)}\n`;

    if (!dryRun) {
      ensureDir(targetDir);
      fs.writeFileSync(targetPath, output, 'utf8');
    }

    imported.push({
      title: row.title,
      target: row.target_path,
      sidebarPosition: row.sidebar_position,
    });
  }

  const reportLines = [
    '# 英文文档导入报告',
    '',
    `生成时间：${new Date().toISOString()}`,
    '',
    `导入数量：${imported.length}`,
    `跳过数量：${skipped.length}`,
    '',
    '## 已导入',
    '',
    ...imported.map((entry) => `- ${entry.sidebarPosition}. ${entry.title} -> \`${entry.target}\``),
    '',
    '## 跳过',
    '',
    ...skipped.map((entry) => `- ${entry.title} -> \`${entry.target}\` (${entry.reason})`),
    '',
  ];

  if (!dryRun) {
    ensureDir(REPORT_DIR);
    fs.writeFileSync(path.join(REPORT_DIR, 'en-import-report.md'), reportLines.join('\n'), 'utf8');
  }

  console.log(`${dryRun ? 'Would import' : 'Imported'} ${imported.length} English docs; skipped ${skipped.length}.`);
}

main();
