const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE_ROOT = path.join(ROOT, 'migration', 'output', 'en', 'custom', 'lsvr_kba');
const REPORT_DIR = path.join(ROOT, 'migration', 'reports');
const I18N_DOCS_ROOT = 'i18n/en/docusaurus-plugin-content-docs/current';

const entries = [
  {
    oldCategory: 'Account Login FAQs',
    items: [
      {
        title: 'ODPM Digital Platform Guideline',
        action: 'skip-review',
        target: 'odpm-guide/section-guide',
        slug: 'digital-platform-guidelines-manual',
        notes: 'ODPM manual content. English ODPM section already has this migrated; do not duplicate.',
      },
      {
        title: 'Does ODPM support multiple account logins?',
        action: 'migrate',
        target: 'customer-service/customer-service-faq',
        slug: 'multiple-account-logins',
        notes: 'Customer service login FAQ.',
      },
      {
        title: 'I forgot my ODPM login password, how do I reset it?',
        action: 'migrate',
        target: 'customer-service/customer-service-faq',
        slug: 'reset-oceanpayment-dashboard-password',
        notes: 'Customer service login FAQ.',
      },
    ],
  },
  {
    oldCategory: 'Credit Card Acquiring FAQs',
    items: [
      {
        title: 'Visa and MasterCard Refund Processing Rules Update',
        action: 'migrate',
        target: 'payment-faq/common-questions',
        slug: 'visa-mastercard-refund-rules-update',
        notes: 'Matches migrated Chinese payment FAQ.',
      },
      {
        title: 'Merchant Batch Representment Submission Guide',
        action: 'skip-review',
        target: 'odpm-guide/section-guide',
        slug: '',
        notes: 'ODPM/representment operation attachment. Review against existing migrated ODPM manuals before adding.',
      },
      {
        title: 'How to reduce the incidence of fraudulent and chargeback transactions?',
        action: 'review',
        target: 'payment-faq/common-questions',
        slug: 'reduce-fraudulent-chargeback-transactions',
        notes: 'English screenshot includes it, but the Chinese counterpart was excluded from this migration because it was not in the confirmed Chinese screenshots.',
      },
      {
        title: 'How to add a blacklist or whitelist in ODPM?',
        action: 'skip-review',
        target: 'odpm-guide/section-guide',
        slug: 'blacklist-operation-manual; whitelist-operation-manual',
        notes: 'ODPM blacklist/whitelist manuals already exist in the migrated English ODPM section.',
      },
      {
        title: 'What should I do with a risky and successful deal?',
        action: 'migrate',
        target: 'payment-faq/common-questions',
        slug: 'risky-successful-transaction-handling',
        notes: 'Matches migrated Chinese payment FAQ.',
      },
      {
        title: 'The order is intercepted by the risk control to show 10000: Payment is declined, how to deal with it?',
        action: 'migrate',
        target: 'payment-faq/common-questions',
        slug: 'payment-declined-10000-risk-control',
        notes: 'Matches migrated Chinese payment FAQ.',
      },
      {
        title: 'What currencies are supported by Oceanpayment credit card channel?',
        action: 'migrate',
        target: 'payment-faq/common-questions',
        slug: 'credit-card-channel-supported-currencies',
        notes: 'Matches migrated Chinese payment FAQ.',
      },
      {
        title: 'Mastercard Chargeback Assessment Criteria',
        action: 'migrate',
        target: 'payment-faq/info-update',
        slug: 'mastercard-chargeback-assessment-criteria',
        notes: 'Rule update; place in info update section.',
      },
      {
        title: 'Why do I get high-risk order alert emails? How do I handle it?',
        action: 'migrate',
        target: 'payment-faq/common-questions',
        slug: 'high-risk-order-alert-email',
        notes: 'Matches migrated Chinese payment FAQ.',
      },
      {
        title: 'What is a Chargeback/Retrieval/Fraud order? How should it be handled?',
        action: 'migrate',
        target: 'payment-faq/common-questions',
        slug: 'chargeback-fraud-retrieval-orders',
        notes: 'Matches migrated Chinese payment FAQ.',
      },
      {
        title: 'Update on Mastercard Chargeback Reasons',
        action: 'migrate',
        target: 'payment-faq/info-update',
        slug: 'mastercard-chargeback-reason-update',
        notes: 'Rule update; place in info update section.',
      },
      {
        title: 'Recurring Payment Introduction',
        action: 'migrate',
        target: 'products-services/oceanpayment-products',
        slug: 'oceanpayment-recurring-introduction',
        notes: 'Product/service introduction.',
      },
      {
        title: 'Implementation of Japan Credit Card Security Guidelines',
        action: 'migrate',
        target: 'payment-faq/info-update',
        slug: 'japan-credit-card-security-guidelines-5',
        notes: 'Rule update; place in info update section.',
      },
      {
        title: 'Visa’s monitoring programs updated-VAMP Enhancements and Retirement of VDMP and VFMP',
        action: 'migrate',
        target: 'payment-faq/info-update',
        slug: 'visa-vamp-policy',
        notes: 'Rule update; maps to the migrated Chinese VAMP policy page.',
      },
    ],
  },
  {
    oldCategory: 'Funding Operation FAQs',
    items: [
      {
        title: 'Merchant Final Settlement at Oceanpayment',
        action: 'migrate',
        target: 'payment-faq/common-questions',
        slug: 'merchant-fund-settlement-at-oceanpayment',
        notes: 'Matches migrated Chinese payment FAQ.',
      },
      {
        title: 'Understanding Currency Conversion in Your Payment and Settlement Process',
        action: 'migrate',
        target: 'payment-faq/common-questions',
        slug: 'currency-conversion-in-transaction-settlement',
        notes: 'Matches migrated Chinese payment FAQ.',
      },
      {
        title: 'How do I keep track of my account funds and reconcile them?',
        action: 'migrate',
        target: 'payment-faq/account-transfer',
        slug: 'account-funds-and-reconciliation',
        notes: 'Account/fund operation FAQ.',
      },
      {
        title: 'How are funds from successful transactions settled?',
        action: 'migrate',
        target: 'payment-faq/account-transfer',
        slug: 'successful-transaction-settlement',
        notes: 'Account/fund operation FAQ.',
      },
      {
        title: 'What currencies can Oceanpayment settlement support?',
        action: 'migrate',
        target: 'payment-faq/common-questions',
        slug: 'supported-settlement-currencies',
        notes: 'Matches migrated Chinese payment FAQ.',
      },
      {
        title: 'OPASST Guideline',
        action: 'review',
        target: 'payment-faq/account-transfer',
        slug: 'opasst-guideline',
        notes: 'Attachment-only guideline. Review whether it should become a page or remain linked from a richer account-transfer article.',
      },
      {
        title: 'Guideline of OPCCOUNT',
        action: 'review',
        target: 'payment-faq/account-transfer',
        slug: 'opccount-platform-manual',
        notes: 'Attachment-only guideline. Do not overwrite the retained OPCCOUNT platform manual without comparing versions.',
      },
    ],
  },
  {
    oldCategory: 'Local Payments Acquiring FAQs',
    items: [
      {
        title: 'Klarna Dispute Lifecycle',
        action: 'migrate',
        target: 'payment-faq/common-questions',
        slug: 'klarna-dispute-lifecycle',
        notes: 'Matches migrated Chinese payment FAQ.',
      },
      {
        title: 'Klarna Merchant Operations Guide',
        action: 'skip-review',
        target: 'odpm-guide/section-guide',
        slug: 'klarna-payment-operations-guide',
        notes: 'Source is an ODPM Klarna operations attachment. Existing English ODPM section already has a Klarna operation guide.',
      },
      {
        title: 'UK Regulatory Requirements for Advertising Klarna',
        action: 'migrate',
        target: 'payment-faq/common-questions',
        slug: 'uk-klarna-advertising-requirements',
        notes: 'Matches migrated Chinese payment FAQ.',
      },
      {
        title: 'Klarna Norway Newsletter Update',
        action: 'migrate',
        target: 'payment-faq/common-questions',
        slug: 'klarna-norway-market-update',
        notes: 'Matches migrated Chinese payment FAQ.',
      },
      {
        title: 'Klarna Dispute Resolution Guideline',
        action: 'migrate',
        target: 'payment-faq/common-questions',
        slug: 'klarna-dispute-improvement-guide',
        notes: 'Matches migrated Chinese payment FAQ.',
      },
      {
        title: 'Klarna’s APR Range Update for Consumers',
        action: 'review',
        target: 'payment-faq/common-questions',
        slug: 'klarna-apr-range-update-for-consumers',
        notes: 'English screenshot includes it, but there is no confirmed Chinese base page yet. Confirm whether to add a Chinese/base doc too.',
      },
      {
        title: 'Klarna Bill Sample on the Customer',
        action: 'migrate',
        target: 'payment-faq/common-questions',
        slug: 'klarna-consumer-bill-sample',
        notes: 'Matches migrated Chinese payment FAQ.',
      },
      {
        title: 'iDEAL Operational Details For The Merchant Side',
        action: 'migrate',
        target: 'payment-faq/common-questions',
        slug: 'ideal-merchant-operation-notes',
        notes: 'Matches migrated Chinese payment FAQ.',
      },
    ],
  },
  {
    oldCategory: 'OP Card',
    items: [
      {
        title: 'Terms and Conditions',
        action: 'migrate',
        target: 'op-card-faq/terms-conditions',
        slug: 'terms-and-conditions',
        notes: 'OP Card terms page.',
      },
    ],
  },
  {
    oldCategory: 'Products and Services',
    items: [
      {
        title: 'Oceanpayment Introduction of Prohibited Business',
        action: 'migrate',
        target: 'compliance-certification/access-compliance',
        slug: 'prohibited-and-restricted-businesses',
        notes: 'Compliance/access content, not product-service content.',
      },
      {
        title: 'What payment products does Oceanpayment offer?',
        action: 'migrate',
        target: 'products-services/oceanpayment-products',
        slug: 'available-payment-products',
        notes: 'Product/service introduction.',
      },
      {
        title: "Besides international credit cards, which countries' local payment products does Oceanpayment support?",
        action: 'review',
        target: 'products-services/oceanpayment-products',
        slug: 'supported-local-payment-products',
        notes: 'English screenshot includes it, but the Chinese counterpart was excluded from this migration because it was not in the confirmed Chinese screenshots.',
      },
      {
        title: 'Does Oceanpayment support Mobile payment?',
        action: 'migrate',
        target: 'products-services/oceanpayment-products',
        slug: 'support-mobile-payment',
        notes: 'Product/service introduction.',
      },
      {
        title: 'Can Oceanpayment support Shopify or other website builders?',
        action: 'migrate',
        target: 'products-services/oceanpayment-products',
        slug: 'support-shopify-or-other-platforms',
        notes: 'Product/service introduction.',
      },
      {
        title: 'If I need to activate a new payment method, how do I get the product price to activate it?',
        action: 'migrate',
        target: 'products-services/oceanpayment-products',
        slug: 'activate-new-payment-method-pricing',
        notes: 'Product/service introduction.',
      },
      {
        title: 'Do I need to re-apply when I change to a new domain for promotion?',
        action: 'review',
        target: 'products-services/oceanpayment-products',
        slug: 'change-domain-reapply-channel',
        notes: 'English screenshot includes it, but the Chinese counterpart was excluded from this migration because it was not in the confirmed Chinese screenshots.',
      },
      {
        title: 'Oceanpayment complaints and suggestions contact information',
        action: 'migrate',
        target: 'customer-service/customer-service-faq',
        slug: 'oceanpayment-complaints-and-suggestions-contact',
        notes: 'Customer service contact page.',
      },
    ],
  },
];

function readSourceDocs() {
  const sourceByTitle = new Map();
  const sourceBySlug = new Map();

  for (const dirent of fs.readdirSync(SOURCE_ROOT, {withFileTypes: true})) {
    if (!dirent.isDirectory() || dirent.name === '_drafts') {
      continue;
    }

    const markdownPath = path.join(SOURCE_ROOT, dirent.name, 'index.md');
    if (!fs.existsSync(markdownPath)) {
      continue;
    }

    const markdown = fs.readFileSync(markdownPath, 'utf8');
    const titleMatch = markdown.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    const title = titleMatch ? titleMatch[1] : '';
    const rel = path.relative(ROOT, markdownPath).replace(/\\/g, '/');

    sourceByTitle.set(title, {slug: dirent.name, rel});
    sourceBySlug.set(dirent.name, {title, rel});
  }

  return {sourceByTitle, sourceBySlug};
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function targetDirectory(target) {
  return target ? `${I18N_DOCS_ROOT}/${target}` : '';
}

function targetPath(row) {
  if (!row.target_directory || !row.target_slug || row.target_slug.includes(';')) {
    return '';
  }

  return `${row.target_directory}/${row.target_slug}/index.mdx`;
}

function buildRows() {
  const {sourceByTitle} = readSourceDocs();
  const targetCounters = new Map();
  const rows = [];
  let sourceOrder = 0;

  for (const group of entries) {
    let oldCategoryOrder = 0;
    for (const item of group.items) {
      sourceOrder += 1;
      oldCategoryOrder += 1;

      const source = sourceByTitle.get(item.title);
      const targetDir = targetDirectory(item.target);
      const key = targetDir || item.target || 'none';
      const nextSidebarPosition = (targetCounters.get(key) || 0) + 1;
      targetCounters.set(key, nextSidebarPosition);

      rows.push({
        source_order: sourceOrder,
        old_category: group.oldCategory,
        old_category_order: oldCategoryOrder,
        title: item.title,
        action: item.action,
        target_directory: targetDir,
        target_slug: item.slug,
        sidebar_position: item.action === 'migrate' ? nextSidebarPosition : '',
        source_slug: source ? source.slug : '',
        markdown_output: source ? source.rel : '',
        target_path: '',
        source_found: source ? 'yes' : 'no',
        notes: item.notes,
      });
    }
  }

  for (const row of rows) {
    row.target_path = targetPath(row);
  }

  return rows;
}

function writeCsv(rows) {
  const headers = [
    'source_order',
    'old_category',
    'old_category_order',
    'title',
    'action',
    'target_directory',
    'target_slug',
    'sidebar_position',
    'source_slug',
    'markdown_output',
    'target_path',
    'source_found',
    'notes',
  ];

  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ];

  fs.mkdirSync(REPORT_DIR, {recursive: true});
  fs.writeFileSync(path.join(REPORT_DIR, 'en-migration-audit.csv'), `${lines.join('\n')}\n`, 'utf8');
}

function writeSummary(rows) {
  const counts = rows.reduce((acc, row) => {
    acc[row.action] = (acc[row.action] || 0) + 1;
    return acc;
  }, {});
  const missing = rows.filter((row) => row.source_found !== 'yes');
  const grouped = new Map();

  for (const row of rows) {
    if (!grouped.has(row.old_category)) {
      grouped.set(row.old_category, []);
    }
    grouped.get(row.old_category).push(row);
  }

  const lines = [
    '# 英文迁移审核清单',
    '',
    `生成时间：${new Date().toISOString()}`,
    '',
    '## 汇总',
    '',
    `- 截图内英文文档：${rows.length}`,
    `- 建议可迁入：${counts.migrate || 0}`,
    `- 需要确认：${counts.review || 0}`,
    `- 跳过/复核避免重复：${counts['skip-review'] || 0}`,
    `- 源文件缺失：${missing.length}`,
    '',
    '## 处理原则',
    '',
    '- 英文文档先不直接导入，先以本清单确认目录、slug、顺序。',
    '- 目标路径使用 `i18n/en/docusaurus-plugin-content-docs/current/...`，尽量复用中文已确认的 slug，方便 Docusaurus 识别为同一文档的英文翻译。',
    '- ODPM 操作手册类内容继续跳过本轮迁移，避免和已迁移的英文 ODPM 板块重复。',
    '- 英文截图中存在、但中文本轮未纳入的文档标为 `review`，需要确认是否补中文基准页或接受英文单独处理。',
    '',
    '## 按旧英文目录审核',
    '',
  ];

  for (const [category, categoryRows] of grouped) {
    lines.push(`### ${category}`, '');
    lines.push('| 顺序 | 标题 | 动作 | 目标目录 | slug | 备注 |');
    lines.push('|---:|---|---|---|---|---|');
    for (const row of categoryRows) {
      lines.push(
        `| ${row.old_category_order} | ${row.title} | ${row.action} | ${row.target_directory || '-'} | ${row.target_slug || '-'} | ${row.notes} |`,
      );
    }
    lines.push('');
  }

  if (missing.length) {
    lines.push('## 源文件缺失', '');
    for (const row of missing) {
      lines.push(`- ${row.title}`);
    }
    lines.push('');
  }

  fs.mkdirSync(REPORT_DIR, {recursive: true});
  fs.writeFileSync(path.join(REPORT_DIR, 'en-migration-summary.md'), `${lines.join('\n')}\n`, 'utf8');
}

function main() {
  const rows = buildRows();
  writeCsv(rows);
  writeSummary(rows);

  const counts = rows.reduce((acc, row) => {
    acc[row.action] = (acc[row.action] || 0) + 1;
    return acc;
  }, {});

  console.log(
    `Generated English audit: ${rows.length} rows, ${counts.migrate || 0} migrate, ${
      counts.review || 0
    } review, ${counts['skip-review'] || 0} skip-review.`,
  );
}

main();
