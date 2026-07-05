const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const AUDIT_PATH = path.join(ROOT, 'migration', 'reports', 'en-migration-audit.csv');
const REVIEW_DIR = path.join(ROOT, 'migration', 'review');
const REPORT_MD = path.join(REVIEW_DIR, 'attachment-review-en-index.md');
const REPORT_CSV = path.join(REVIEW_DIR, 'attachment-review-en-index.csv');

const REVIEW_RESOLUTION_OVERRIDES = {
  'How to reduce the incidence of fraudulent and chargeback transactions?': {
    action: 'english-only',
    targetPath:
      'i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions/reduce-fraudulent-chargeback-transactions/index.mdx',
    duplicateCheck: '新增英文-only 页面，需确认附件是否仍需保留。',
  },
  'OPASST Guideline': {
    action: 'english-only',
    targetPath: 'i18n/en/docusaurus-plugin-content-docs/current/payment-faq/account-transfer/opasst-guideline/index.mdx',
    duplicateCheck: '新增英文-only 页面；中文“成功交易资金如何进行结算？”已有 OPASST 附件链接，需运营确认是否重复。',
  },
  'Guideline of OPCCOUNT': {
    action: 'skip-existing',
    targetPath: 'i18n/en/docusaurus-plugin-content-docs/current/odpm-guide/section-guide/opccount-guideline/index.mdx',
    duplicateCheck: '已存在 Guideline of OPCCOUNT-New，本轮不重复导入旧附件版。',
  },
  "Klarna’s APR Range Update for Consumers": {
    action: 'english-only',
    targetPath:
      'i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions/klarna-apr-range-update-for-consumers/index.mdx',
    duplicateCheck: '新增英文-only 页面，需确认附件是否仍需保留。',
  },
};

const KNOWN_DUPLICATE_HINTS = {
  'ODPM Digital Platform Guideline': '英文 ODPM 已有 digital-platform-guidelines-manual，不重复导入。',
  'How to add a blacklist or whitelist in ODPM?': '英文 ODPM 已有 blacklist-operation-manual / whitelist-operation-manual。',
  'Klarna Merchant Operations Guide': '英文 ODPM 已有 klarna-payment-operations-guide。',
  'Guideline of OPCCOUNT': '英文 ODPM 已有 opccount-guideline（Guideline of OPCCOUNT-New）。',
};

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

function extractTitle(markdown, url) {
  const fileName = decodeURIComponent(url.split('/').pop() || 'attachment')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const linkRe = new RegExp(`\\[([^\\]]+)\\]\\(${escapedUrl}\\)`);
  const linkMatch = markdown.match(linkRe);

  if (linkMatch && linkMatch[1]) {
    const title = linkMatch[1].replace(/\\_/g, '_').replace(/\s+/g, ' ').trim();
    return /^https?:\/\//i.test(title) || title.includes('/wp-content/uploads/') ? fileName : title;
  }

  return fileName;
}

function extractAttachments(markdown) {
  const urls = [];
  const markdownLinkRe = /!?\[[^\]]*]\((https?:\/\/support\.oceanpayment\.com\/(?:en\/)?wp-content\/uploads\/[^)]+)\)/gi;
  let linkMatch;

  while ((linkMatch = markdownLinkRe.exec(markdown))) {
    const cleanUrl = linkMatch[1].trim().replace(/[.,;]+$/, '');
    if (!urls.includes(cleanUrl)) {
      urls.push(cleanUrl);
    }
  }

  const re = /https?:\/\/support\.oceanpayment\.com\/(?:en\/)?wp-content\/uploads\/[^\s)>]+/gi;
  let match;

  while ((match = re.exec(markdown))) {
    const cleanUrl = match[0].replace(/\]\(.*/, '').replace(/[.,;\]]+$/, '');
    if (!urls.includes(cleanUrl)) {
      urls.push(cleanUrl);
    }
  }

  return urls.map((url) => ({
    title: extractTitle(markdown, url),
    url,
    type: (url.match(/\.([a-z0-9]+)(?:$|\?)/i)?.[1] || '').toLowerCase(),
  }));
}

function normalizeAction(row) {
  const override = REVIEW_RESOLUTION_OVERRIDES[row.title];
  if (override) return override.action;
  if (row.action === 'migrate') return 'migrated';
  if (row.action === 'skip-review') return 'skip-review';
  if (row.action === 'review') return 'pending-review';
  return row.action || '';
}

function targetPath(row) {
  const override = REVIEW_RESOLUTION_OVERRIDES[row.title];
  if (override) return override.targetPath;
  return row.target_path || '';
}

function duplicateHint(row) {
  const override = REVIEW_RESOLUTION_OVERRIDES[row.title];
  if (override) return override.duplicateCheck;
  return KNOWN_DUPLICATE_HINTS[row.title] || row.notes || '';
}

function main() {
  const auditRows = parseCsv(AUDIT_PATH);
  const rows = [];

  for (const row of auditRows) {
    const sourcePath = path.join(ROOT, row.markdown_output || '');
    if (!row.markdown_output || !fs.existsSync(sourcePath)) continue;

    const markdown = fs.readFileSync(sourcePath, 'utf8');
    const attachments = extractAttachments(markdown);
    if (!attachments.length) continue;

    for (const attachment of attachments) {
      rows.push({
        old_category: row.old_category,
        old_category_order: row.old_category_order,
        source_order: row.source_order,
        title: row.title,
        current_action: normalizeAction(row),
        target_path: targetPath(row),
        attachment_title: attachment.title,
        attachment_type: attachment.type,
        attachment_url: attachment.url,
        duplicate_check: duplicateHint(row),
        ops_result: '',
        ops_notes: '',
      });
    }
  }

  rows.sort((left, right) => Number(left.source_order) - Number(right.source_order));

  const headers = [
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
    'ops_result',
    'ops_notes',
  ];

  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ];

  const articleCount = new Set(rows.map((row) => row.title)).size;
  const lines = [
    '# 英文附件审核索引',
    '',
    '用途：这份清单用于让运营确认英文旧站附件是否已经迁移过、是否需要保留外链，避免重复迁入。',
    '',
    `生成时间：${new Date().toISOString()}`,
    '',
    '## 汇总',
    '',
    `- 带附件英文文章数：${articleCount}`,
    `- 附件外链数：${rows.length}`,
    '- 审核范围：`migration/reports/en-migration-audit.csv` 中的英文 WordPress 源文档。',
    '- 说明：当前仍按前序决策保留旧站外链，本表只用于运营确认是否重复或是否后续替换。',
    '',
    '## 审核表',
    '',
    '| # | 旧目录 | 顺序 | 英文文章 | 当前处理 | 当前目标文档 | 附件标题 | 类型 | 附件链接 | 疑似重复/备注 | 运营结论 | 运营备注 |',
    '|---:|---|---:|---|---|---|---|---|---|---|---|---|',
  ];

  rows.forEach((row, index) => {
    lines.push(
      `| ${index + 1} | ${row.old_category} | ${row.old_category_order} | ${row.title} | ${row.current_action} | \`${
        row.target_path || '-'
      }\` | ${row.attachment_title} | ${row.attachment_type || '-'} | ${row.attachment_url} | ${
        row.duplicate_check || ''
      } |  |  |`,
    );
  });

  lines.push(
    '',
    '## 当前处理状态说明',
    '',
    '- `migrated`：已进入英文站正式页面。',
    '- `english-only`：已作为英文-only 页面进入英文站，中文站不展示。',
    '- `skip-review`：本轮未导入，通常因为 ODPM 或已有内容疑似重复。',
    '- `skip-existing`：已有新版/完整页面，本轮不重复导入旧附件版。',
    '- `pending-review`：仍需后续确认。',
    '',
    '## 运营建议填写',
    '',
    '- `已迁移，可删除外链`：附件内容已经完整转成 MDX 正文。',
    '- `仍需保留附件`：附件仍是必要资料，后续可考虑下载并替换为本地链接。',
    '- `重复，不迁入`：已有同等或新版文档，不再迁入。',
    '- `需新版替换`：旧附件不是最终版本，需要运营提供新版。',
    '',
  );

  fs.mkdirSync(REVIEW_DIR, {recursive: true});
  fs.writeFileSync(REPORT_MD, `${lines.join('\n')}\n`, 'utf8');
  fs.writeFileSync(REPORT_CSV, `${csv.join('\n')}\n`, 'utf8');

  console.log(`English attachment review: ${articleCount} articles, ${rows.length} links.`);
  console.log(path.relative(ROOT, REPORT_MD).replace(/\\/g, '/'));
  console.log(path.relative(ROOT, REPORT_CSV).replace(/\\/g, '/'));
}

main();
