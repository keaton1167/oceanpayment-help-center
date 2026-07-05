const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const AUDIT_PATH = path.join(ROOT, 'migration', 'reports', 'zh-migration-audit.csv');
const REPORT_DIR = path.join(ROOT, 'migration', 'reports');

const TARGET_GROUPS = {
  initial: new Set([
    'docs/products-services/oceanpayment-products',
    'docs/customer-service/customer-service-faq',
    'docs/compliance-certification/enterprise-certification-faq',
    'docs/compliance-certification/access-compliance',
  ]),
  payment: new Set([
    'docs/payment-faq/info-update',
    'docs/payment-faq/common-questions',
    'docs/payment-faq/account-transfer',
  ]),
  'op-card': new Set([
    'docs/op-card-faq/common-questions',
    'docs/op-card-faq/terms-conditions',
    'docs/op-card-faq/google-pay-faq',
  ]),
};

const EXISTING_DOCS_BY_TITLE = {
  'OPCCOUNT操作教程': 'docs/payment-faq/account-transfer/opccount-platform-manual/index.mdx',
};

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
  const groupArg = process.argv.find((arg) => arg.startsWith('--group='));
  const group = groupArg ? groupArg.split('=')[1] : 'initial';
  const targets = TARGET_GROUPS[group];

  if (!targets) {
    throw new Error(`Unknown group "${group}". Expected one of: ${Object.keys(TARGET_GROUPS).join(', ')}`);
  }

  const rows = parseCsv(AUDIT_PATH).filter(
    (row) =>
      row.action === 'migrate' &&
      targets.has(row.target_directory) &&
      row.sidebar_position &&
      row.markdown_output,
  );

  const report = [];
  const skipped = [];

  for (const row of rows) {
    if (EXISTING_DOCS_BY_TITLE[row.title]) {
      skipped.push({
        title: row.title,
        target: EXISTING_DOCS_BY_TITLE[row.title],
        reason: 'existing richer document retained',
      });
      continue;
    }

    const sourcePath = path.join(ROOT, row.markdown_output);
    const targetDir = path.join(ROOT, row.target_directory, row.candidate_slug);
    const targetPath = path.join(targetDir, 'index.mdx');

    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Missing source markdown: ${sourcePath}`);
    }

    if (fs.existsSync(targetPath)) {
      skipped.push({
        title: row.title,
        target: path.relative(ROOT, targetPath).replace(/\\/g, '/'),
        reason: 'target document already exists',
      });
      continue;
    }

    const sourceMarkdown = fs.readFileSync(sourcePath, 'utf8');
    const body = stripFrontmatter(sourceMarkdown);
    const output = `${buildFrontmatter(row)}${body}\n`;

    if (!dryRun) {
      ensureDir(targetDir);
      fs.writeFileSync(targetPath, output, 'utf8');
    }

    report.push({
      title: row.title,
      target: path.relative(ROOT, targetPath).replace(/\\/g, '/'),
      sidebarPosition: row.sidebar_position,
    });
  }

  const lines = [
    `# 中文导入报告：${group}`,
    '',
    `生成时间：${new Date().toISOString()}`,
    '',
    `导入数量：${report.length}`,
    `跳过数量：${skipped.length}`,
    '',
    '## 文档',
    '',
    ...report.map((entry) => `- ${entry.sidebarPosition}. ${entry.title} -> \`${entry.target}\``),
    '',
    '## 跳过',
    '',
    ...skipped.map((entry) => `- ${entry.title} -> \`${entry.target}\` (${entry.reason})`),
    '',
  ];

  if (!dryRun) {
    const reportPath = path.join(REPORT_DIR, `zh-import-${group}-report.md`);
    fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
  }

  console.log(`${dryRun ? 'Would import' : 'Imported'} ${report.length} documents; skipped ${skipped.length}.`);
}

main();
