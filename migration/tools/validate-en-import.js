const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const AUDIT_PATH = path.join(ROOT, 'migration', 'reports', 'en-migration-audit.csv');
const REPORT_DIR = path.join(ROOT, 'migration', 'reports');
const REPORT_PATH = path.join(REPORT_DIR, 'en-import-validation.md');
const CSV_PATH = path.join(REPORT_DIR, 'en-import-validation.csv');

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
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toDocId(targetPath) {
  return targetPath
    .replace(/^i18n\/en\/docusaurus-plugin-content-docs\/current\//, '')
    .replace(/\/index\.mdx$/, '');
}

function toChineseBasePath(targetPath) {
  return targetPath.replace(/^i18n\/en\/docusaurus-plugin-content-docs\/current\//, 'docs/');
}

function toBuildPath(docId) {
  return path.join(ROOT, 'build', 'en', 'docs', ...docId.split('/'), 'index.html');
}

function countMatches(content, regex) {
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

function main() {
  const rows = parseCsv(AUDIT_PATH).filter((row) => row.action === 'migrate');
  const validationRows = rows.map((row) => {
    const docId = toDocId(row.target_path);
    const targetAbs = path.join(ROOT, row.target_path);
    const sourceAbs = path.join(ROOT, row.markdown_output);
    const basePath = toChineseBasePath(row.target_path);
    const baseAbs = path.join(ROOT, basePath);
    const buildAbs = toBuildPath(docId);
    const content = fs.existsSync(targetAbs) ? fs.readFileSync(targetAbs, 'utf8') : '';

    return {
      title: row.title,
      doc_id: docId,
      target_path: row.target_path,
      source_exists: fs.existsSync(sourceAbs) ? 'yes' : 'no',
      target_exists: fs.existsSync(targetAbs) ? 'yes' : 'no',
      chinese_base_exists: fs.existsSync(baseAbs) ? 'yes' : 'no',
      build_page_exists: fs.existsSync(buildAbs) ? 'yes' : 'no',
      broken_wordpress_image_code: countMatches(content, /images\/\?code=/g),
      old_support_upload_links: countMatches(content, /https?:\/\/support\.oceanpayment\.com\/(?:en\/)?wp-content\/uploads\//gi),
    };
  });

  const failures = validationRows.filter(
    (row) =>
      row.source_exists !== 'yes' ||
      row.target_exists !== 'yes' ||
      row.chinese_base_exists !== 'yes' ||
      row.build_page_exists !== 'yes' ||
      row.broken_wordpress_image_code > 0,
  );
  const oldUploadTotal = validationRows.reduce((sum, row) => sum + row.old_support_upload_links, 0);
  const brokenImageTotal = validationRows.reduce((sum, row) => sum + row.broken_wordpress_image_code, 0);

  const headers = [
    'title',
    'doc_id',
    'target_path',
    'source_exists',
    'target_exists',
    'chinese_base_exists',
    'build_page_exists',
    'broken_wordpress_image_code',
    'old_support_upload_links',
  ];
  const csv = [
    headers.join(','),
    ...validationRows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ];

  const byDirectory = validationRows.reduce((acc, row) => {
    const directory = row.doc_id.split('/').slice(0, -1).join('/');
    acc[directory] = (acc[directory] || 0) + 1;
    return acc;
  }, {});

  const lines = [
    '# 英文导入页面校验报告',
    '',
    `生成时间：${new Date().toISOString()}`,
    '',
    '## 汇总',
    '',
    `- 校验英文导入文档：${validationRows.length}`,
    `- 源文件存在：${validationRows.filter((row) => row.source_exists === 'yes').length}/${validationRows.length}`,
    `- 英文 MDX 存在：${validationRows.filter((row) => row.target_exists === 'yes').length}/${validationRows.length}`,
    `- 中文基准页存在：${validationRows.filter((row) => row.chinese_base_exists === 'yes').length}/${validationRows.length}`,
    `- 英文构建页面存在：${validationRows.filter((row) => row.build_page_exists === 'yes').length}/${validationRows.length}`,
    `- WordPress images/?code 破图：${brokenImageTotal}`,
    `- 保留旧站附件外链：${oldUploadTotal}`,
    `- 阻塞问题：${failures.length}`,
    '',
    '## 按目录数量',
    '',
    ...Object.entries(byDirectory)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([directory, count]) => `- ${directory}: ${count}`),
    '',
    '## 说明',
    '',
    '- `build_page_exists` 用于确认页面已经实际进入 `build/en/docs/...`，不是只停留在源文件目录。',
    '- 旧站附件外链按前序决策暂时保留，不作为阻塞项。',
    '- 6 篇待确认文档未纳入本次校验，因为尚未导入。',
    '',
  ];

  if (failures.length) {
    lines.push('## 阻塞明细', '');
    for (const row of failures) {
      lines.push(`- ${row.title} -> ${row.doc_id}`);
    }
    lines.push('');
  }

  lines.push('## 明细', '');
  lines.push(`完整 CSV：\`migration/reports/${path.basename(CSV_PATH)}\``, '');

  fs.mkdirSync(REPORT_DIR, {recursive: true});
  fs.writeFileSync(REPORT_PATH, `${lines.join('\n')}\n`, 'utf8');
  fs.writeFileSync(CSV_PATH, `${csv.join('\n')}\n`, 'utf8');

  console.log(
    `Validated ${validationRows.length} English docs; failures ${failures.length}; old upload links ${oldUploadTotal}.`,
  );
}

main();
