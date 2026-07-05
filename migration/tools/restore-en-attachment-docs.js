const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT_PATH = path.join(ROOT, 'migration', 'reports', 'en-attachment-docs-restored.md');

const DOCS = [
  {
    id: 'payment-faq/common-questions/reduce-fraudulent-chargeback-transactions',
    title: 'How to reduce the incidence of fraudulent and chargeback transactions?',
    sidebarPosition: 6,
    source: 'migration/output/en/custom/lsvr_kba/how-to-reduce-the-incidence-of-fraudulent-and-chargeback-transactions/index.md',
    mode: 'english-only',
  },
  {
    id: 'payment-faq/info-update/mastercard-chargeback-assessment-criteria',
    title: 'Mastercard Chargeback Assessment Criteria',
    sidebarPosition: 1,
    source: 'migration/output/en/custom/lsvr_kba/mastercard-chargeback-assessment-criteria/index.md',
    mode: 'english-only',
  },
  {
    id: 'payment-faq/common-questions/high-risk-order-alert-email',
    title: 'Why do I get high-risk order alert emails? How do I handle it?',
    sidebarPosition: 6,
    source: 'migration/output/en/custom/lsvr_kba/why-do-i-get-high-risk-order-alert-emails-how-do-i-handle-it/index.md',
    mode: 'english-only',
  },
  {
    id: 'payment-faq/common-questions/chargeback-fraud-retrieval-orders',
    title: 'What is a Chargeback/Retrieval/Fraud order? How should it be handled?',
    sidebarPosition: 7,
    source: 'migration/output/en/custom/lsvr_kba/what-is-a-chargeback-retrieval-fraud-order-how-should-it-be-handled/index.md',
    mode: 'english-only',
  },
  {
    id: 'payment-faq/info-update/mastercard-chargeback-reason-update',
    title: 'Update on Mastercard Chargeback Reasons',
    sidebarPosition: 2,
    source: 'migration/output/en/custom/lsvr_kba/update-on-mastercard-chargeback-reasons/index.md',
    mode: 'english-only',
  },
  {
    id: 'products-services/oceanpayment-products/oceanpayment-recurring-introduction',
    title: 'Recurring Payment Introduction',
    sidebarPosition: 1,
    source: 'migration/output/en/custom/lsvr_kba/recurring-payment-introduction/index.md',
    mode: 'english-only',
  },
  {
    id: 'payment-faq/info-update/japan-credit-card-security-guidelines-5',
    title: 'Implementation of Japan Credit Card Security Guidelines',
    sidebarPosition: 3,
    source: 'migration/output/en/custom/lsvr_kba/implementation-of-japan-credit-card-security-guidelines/index.md',
    mode: 'english-only',
  },
  {
    id: 'payment-faq/info-update/visa-vamp-policy',
    title: 'Visa’s monitoring programs updated-VAMP Enhancements and Retirement of VDMP and VFMP',
    sidebarPosition: 4,
    source: 'migration/output/en/custom/lsvr_kba/visas-monitoring-programs-updated-vamp-enhancements-and-retirement-of-vdmp-and-vfmp/index.md',
    mode: 'english-only',
  },
  {
    id: 'payment-faq/account-transfer/account-funds-and-reconciliation',
    title: 'How do I keep track of my account funds and reconcile them?',
    sidebarPosition: 1,
    source: 'migration/output/en/custom/lsvr_kba/how-do-i-keep-track-of-my-account-funds-and-reconcile-them/index.md',
    mode: 'english-only',
  },
  {
    id: 'payment-faq/account-transfer/opasst-guideline',
    title: 'OPASST Guideline',
    sidebarPosition: 6,
    source: 'migration/output/en/custom/lsvr_kba/opasst-guideline/index.md',
    mode: 'english-only',
  },
  {
    id: 'payment-faq/common-questions/uk-klarna-advertising-requirements',
    title: 'UK Regulatory Requirements for Advertising Klarna',
    sidebarPosition: 12,
    source: 'migration/output/en/custom/lsvr_kba/uk-regulatory-requirements-for-advertising-klarna/index.md',
    mode: 'english-only',
  },
  {
    id: 'payment-faq/common-questions/klarna-norway-market-update',
    title: 'Klarna Norway Newsletter Update',
    sidebarPosition: 13,
    source: 'migration/output/en/custom/lsvr_kba/klarna-norway-newsletter-update/index.md',
    mode: 'english-only',
  },
  {
    id: 'payment-faq/common-questions/klarna-dispute-improvement-guide',
    title: 'Klarna Dispute Resolution Guideline',
    sidebarPosition: 14,
    source: 'migration/output/en/custom/lsvr_kba/klarna-dispute-resolution-guideline/index.md',
    mode: 'translated',
  },
  {
    id: 'payment-faq/common-questions/klarna-apr-range-update-for-consumers',
    title: "Klarna's APR Range Update for Consumers",
    sidebarPosition: 15,
    source: 'migration/output/en/custom/lsvr_kba/klarnas-apr-range-update-for-consumers/index.md',
    mode: 'english-only',
  },
  {
    id: 'payment-faq/common-questions/klarna-consumer-bill-sample',
    title: 'Klarna Bill Sample on the Customer',
    sidebarPosition: 16,
    source: 'migration/output/en/custom/lsvr_kba/klarna-bill-sample-on-the-customer/index.md',
    mode: 'english-only',
  },
  {
    id: 'payment-faq/common-questions/ideal-merchant-operation-notes',
    title: 'iDEAL Operational Details For The Merchant Side',
    sidebarPosition: 17,
    source: 'migration/output/en/custom/lsvr_kba/ideal-operational-details-for-the-merchant-side/index.md',
    mode: 'english-only',
  },
  {
    id: 'op-card-faq/terms-conditions/terms-and-conditions',
    title: 'Terms and Conditions',
    sidebarPosition: 1,
    source: 'migration/output/en/custom/lsvr_kba/terms-and-conditions/index.md',
    mode: 'english-only',
  },
  {
    id: 'compliance-certification/access-compliance/prohibited-and-restricted-businesses',
    title: 'Oceanpayment Introduction of Prohibited Business',
    sidebarPosition: 1,
    source: 'migration/output/en/custom/lsvr_kba/oceanpayment-introduction-of-prohibited-business/index.md',
    mode: 'translated',
  },
];

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n*/, '').trim();
}

function frontmatter(doc) {
  return [
    '---',
    `title: ${JSON.stringify(doc.title)}`,
    `sidebar_label: ${JSON.stringify(doc.title)}`,
    `sidebar_position: ${doc.sidebarPosition}`,
    '---',
    '',
  ].join('\n');
}

function writeDoc(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, content, 'utf8');
}

function targetPaths(doc) {
  const docsPath = path.join(ROOT, 'docs', ...doc.id.split('/'), 'index.mdx');
  const i18nPath = path.join(
    ROOT,
    'i18n',
    'en',
    'docusaurus-plugin-content-docs',
    'current',
    ...doc.id.split('/'),
    'index.mdx',
  );
  return {docsPath, i18nPath};
}

function main() {
  const restored = [];

  for (const doc of DOCS) {
    const sourcePath = path.join(ROOT, doc.source);
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Missing source markdown: ${doc.source}`);
    }

    const content = `${frontmatter(doc)}${stripFrontmatter(fs.readFileSync(sourcePath, 'utf8'))}\n`;
    const {docsPath, i18nPath} = targetPaths(doc);

    if (doc.mode === 'english-only') {
      writeDoc(docsPath, content);
    }

    writeDoc(i18nPath, content);
    restored.push(doc);
  }

  const lines = [
    '# 英文附件外链文档恢复记录',
    '',
    `生成时间：${new Date().toISOString()}`,
    '',
    '## 处理口径',
    '',
    '- 本次仅恢复英文版本中允许上线的附件外链文档。',
    '- ODPM 已转正文的操作手册类文档不恢复外链版，避免与现有文档重复。',
    '- 中文基准页不存在的文档按英文-only 处理，并由 Docusaurus 配置排除出中文站。',
    '- 中文基准页已存在且无附件外链的文档，只恢复英文译文。',
    '',
    '## 恢复清单',
    '',
    '| Doc ID | 模式 | 标题 |',
    '|---|---|---|',
    ...restored.map((doc) => `| \`${doc.id}\` | ${doc.mode} | ${doc.title} |`),
    '',
  ];

  fs.mkdirSync(path.dirname(REPORT_PATH), {recursive: true});
  fs.writeFileSync(REPORT_PATH, lines.join('\n'), 'utf8');

  console.log(`Restored ${restored.length} English attachment docs.`);
}

main();
