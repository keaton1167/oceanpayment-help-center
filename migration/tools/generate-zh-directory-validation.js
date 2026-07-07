const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const AUDIT_PATH = path.join(ROOT, 'migration', 'reports', 'zh-migration-audit.csv');
const REPORT_MD = path.join(ROOT, 'migration', 'reports', 'zh-directory-validation.md');
const REPORT_CSV = path.join(ROOT, 'migration', 'reports', 'zh-directory-validation.csv');

const VALIDATED_DIRECTORIES = [
  {
    level1: '产品与服务',
    level2: 'Oceanpayment产品与服务',
    dir: 'docs/products-services/oceanpayment-products',
  },
  {
    level1: '客户服务',
    level2: '客户服务常见问题',
    dir: 'docs/customer-service/customer-service-faq',
  },
  {
    level1: '合规与认证',
    level2: '企业认证常见问题',
    dir: 'docs/compliance-certification/enterprise-certification-faq',
  },
  {
    level1: '合规与认证',
    level2: '准入与合规管理',
    dir: 'docs/compliance-certification/access-compliance',
  },
  {
    level1: 'Payment收单常见FAQ',
    level2: '信息更新专区',
    dir: 'docs/payment-faq/info-update',
  },
  {
    level1: 'Payment收单常见FAQ',
    level2: '常见问题',
    dir: 'docs/payment-faq/common-questions',
  },
  {
    level1: 'Payment收单常见FAQ',
    level2: '账户划款、提现、代付指引',
    dir: 'docs/payment-faq/account-transfer',
  },
  {
    level1: 'OP Card 常见FAQ',
    level2: '常见问题',
    dir: 'docs/op-card-faq/common-questions',
  },
  {
    level1: 'OP Card 常见FAQ',
    level2: '条款和条件',
    dir: 'docs/op-card-faq/terms-conditions',
  },
  {
    level1: 'OP Card 常见FAQ',
    level2: '支持Google Pay FAQ',
    dir: 'docs/op-card-faq/google-pay-faq',
  },
];

const SKIPPED_DIRECTORIES = [
  {
    level1: 'ODPM账户后台操作指引',
    level2: '板块操作指引',
    oldCategory: 'ODPM后台板块操作指引',
    dir: 'docs/odpm-guide/section-guide',
    reason: '该目录中英文内容已完成迁移，本次按规则跳过，避免重复迁移。',
  },
];

const EXCLUDED_REVIEW_TITLES = [
  '除国际信用卡，Oceanpayment支持哪些国家的本地支付产品？',
  '换了新的网站域名进行推广，是否需要重新申请通道？',
  '如何降低欺诈交易拒付的发生',
  '伪冒处理说明',
  '调单处理说明',
  '拒付处理说明',
];

const RESOLVED_ELSEWHERE_TITLES = new Set([
  'IAM申请OPCCOUNT全球账户业务操作手册',
  'OPCard操作教程',
]);

const EXISTING_RETAINED_DOCS = [
  {
    auditTitle: 'OPCCOUNT操作教程',
    actualTitle: 'OPCCOUNT平台操作手册-2026-4-23',
    dir: 'docs/payment-faq/account-transfer',
    slug: 'opccount-platform-manual',
    reason: '保留本地已迁移的完整手册，不导入 WordPress 中仅 PDF 链接的旧文档。',
  },
];

const ENGLISH_ONLY_DOC_IDS = new Set([
  'payment-faq/common-questions/reduce-fraudulent-chargeback-transactions',
  'payment-faq/account-transfer/opasst-guideline',
  'payment-faq/common-questions/klarna-apr-range-update-for-consumers',
  'products-services/oceanpayment-products/supported-local-payment-products',
  'products-services/oceanpayment-products/change-domain-reapply-channel',
]);

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

function stripQuotes(value) {
  return String(value || '').replace(/^["']|["']$/g, '');
}

function parseFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const frontmatter = {};

  if (!match) {
    return frontmatter;
  }

  for (const line of match[1].split(/\r?\n/)) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    frontmatter[key] = stripQuotes(value);
  }

  return frontmatter;
}

function readCategoryLabel(dir) {
  const filePath = path.join(ROOT, dir, '_category_.json');
  if (!fs.existsSync(filePath)) return '';

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')).label || '';
  } catch {
    return '';
  }
}

function listDocsInDir(dir) {
  const absoluteDir = path.join(ROOT, dir);
  if (!fs.existsSync(absoluteDir)) return [];

  return fs
    .readdirSync(absoluteDir, {withFileTypes: true})
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !ENGLISH_ONLY_DOC_IDS.has(`${dir.replace(/^docs\//, '')}/${entry.name}`))
    .map((entry) => {
      const docPath = path.join(absoluteDir, entry.name, 'index.mdx');
      if (!fs.existsSync(docPath)) return null;
      const frontmatter = parseFrontmatter(docPath);
      return {
        dir,
        slug: entry.name,
        file: toPosix(path.relative(ROOT, docPath)),
        title: frontmatter.title || '',
        sidebarLabel: frontmatter.sidebar_label || '',
        sidebarPosition: Number(frontmatter.sidebar_position || NaN),
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const posA = Number.isFinite(a.sidebarPosition) ? a.sidebarPosition : Number.MAX_SAFE_INTEGER;
      const posB = Number.isFinite(b.sidebarPosition) ? b.sidebarPosition : Number.MAX_SAFE_INTEGER;
      if (posA !== posB) return posA - posB;
      return a.slug.localeCompare(b.slug);
    });
}

function getExpectedRows(auditRows, dir) {
  const retained = EXISTING_RETAINED_DOCS.filter((doc) => doc.dir === dir);
  const retainedAuditTitles = new Set(retained.map((doc) => doc.auditTitle));

  const rows = auditRows
    .filter((row) => row.action === 'migrate' && row.target_directory === dir)
    .filter((row) => !RESOLVED_ELSEWHERE_TITLES.has(row.title))
    .map((row) => {
      const retainedDoc = retained.find((doc) => doc.auditTitle === row.title);
      if (retainedDoc) {
        return {
          title: retainedDoc.actualTitle,
          slug: retainedDoc.slug,
          sidebarPosition: Number(row.sidebar_position || NaN),
          note: retainedDoc.reason,
        };
      }

      return {
        title: row.title,
        slug: row.candidate_slug,
        sidebarPosition: Number(row.sidebar_position || NaN),
        note: row.notes || '',
      };
    });

  for (const retainedDoc of retained) {
    if (!retainedAuditTitles.has(retainedDoc.auditTitle)) {
      rows.push({
        title: retainedDoc.actualTitle,
        slug: retainedDoc.slug,
        sidebarPosition: NaN,
        note: retainedDoc.reason,
      });
    }
  }

  return rows.sort((a, b) => {
    const posA = Number.isFinite(a.sidebarPosition) ? a.sidebarPosition : Number.MAX_SAFE_INTEGER;
    const posB = Number.isFinite(b.sidebarPosition) ? b.sidebarPosition : Number.MAX_SAFE_INTEGER;
    if (posA !== posB) return posA - posB;
    return a.slug.localeCompare(b.slug);
  });
}

function validateDirectory(auditRows, config) {
  const actual = listDocsInDir(config.dir);
  const expected = getExpectedRows(auditRows, config.dir);
  const actualBySlug = new Map(actual.map((doc) => [doc.slug, doc]));
  const expectedBySlug = new Map(expected.map((doc) => [doc.slug, doc]));
  const missing = expected.filter((doc) => !actualBySlug.has(doc.slug));
  const extra = actual.filter((doc) => !expectedBySlug.has(doc.slug));
  const mismatchedTitles = expected
    .map((doc) => {
      const actualDoc = actualBySlug.get(doc.slug);
      if (!actualDoc || actualDoc.title === doc.title) return null;
      return {expected: doc, actual: actualDoc};
    })
    .filter(Boolean);
  const mismatchedPositions = expected
    .map((doc) => {
      const actualDoc = actualBySlug.get(doc.slug);
      if (!actualDoc || actualDoc.sidebarPosition === doc.sidebarPosition) return null;
      return {expected: doc, actual: actualDoc};
    })
    .filter(Boolean);
  const duplicatePositions = Object.entries(
    actual.reduce((acc, doc) => {
      if (!Number.isFinite(doc.sidebarPosition)) return acc;
      acc[doc.sidebarPosition] = acc[doc.sidebarPosition] || [];
      acc[doc.sidebarPosition].push(doc);
      return acc;
    }, {}),
  ).filter(([, docs]) => docs.length > 1);
  const missingPositions = actual.filter((doc) => !Number.isFinite(doc.sidebarPosition));

  return {
    ...config,
    categoryLabel: readCategoryLabel(config.dir),
    actual,
    expected,
    missing,
    extra,
    mismatchedTitles,
    mismatchedPositions,
    duplicatePositions,
    missingPositions,
    ok:
      missing.length === 0 &&
      extra.length === 0 &&
      mismatchedTitles.length === 0 &&
      mismatchedPositions.length === 0 &&
      duplicatePositions.length === 0 &&
      missingPositions.length === 0,
  };
}

function buildMarkdown(results, skippedResults, excludedRows) {
  const okCount = results.filter((result) => result.ok).length;
  const issueCount = results.length - okCount;
  const totalExpected = results.reduce((sum, result) => sum + result.expected.length, 0);
  const totalActual = results.reduce((sum, result) => sum + result.actual.length, 0);

  const lines = [
    '# 中文目录与顺序校验报告',
    '',
    `生成时间：${new Date().toISOString()}`,
    '',
    '## 结论',
    '',
    `- 校验新二级目录数：${results.length}`,
    `- 通过目录数：${okCount}`,
    `- 存在待确认项目录数：${issueCount}`,
    `- 迁移审计期望文章数：${totalExpected}`,
    `- 当前实际文章数：${totalActual}`,
    `- 不计入本次迁移的未归类文章数：${excludedRows.length}`,
    `- ODPM 旧目录：按规则跳过，不重复迁移。`,
    '',
    '## 新目录校验',
    '',
  ];

  for (const result of results) {
    lines.push(
      `### ${result.level1} / ${result.level2}`,
      '',
      `- 目录：\`${result.dir}\``,
      `- 分类标签：${result.categoryLabel || '(未读取到)'}`,
      `- 期望 / 实际：${result.expected.length} / ${result.actual.length}`,
      `- 状态：${result.ok ? '通过' : '需复核'}`,
      '',
      '| 顺序 | 标题 | slug | 文件 |',
      '|---:|---|---|---|',
    );

    for (const doc of result.actual) {
      lines.push(`| ${Number.isFinite(doc.sidebarPosition) ? doc.sidebarPosition : ''} | ${doc.title} | \`${doc.slug}\` | \`${doc.file}\` |`);
    }

    if (!result.ok) {
      lines.push('', '待复核项：');
      for (const doc of result.missing) {
        lines.push(`- 缺失：${doc.title} -> \`${doc.slug}\``);
      }
      for (const doc of result.extra) {
        lines.push(`- 额外：${doc.title} -> \`${doc.slug}\``);
      }
      for (const item of result.mismatchedTitles) {
        lines.push(`- 标题不一致：\`${item.actual.slug}\` 期望「${item.expected.title}」，实际「${item.actual.title}」`);
      }
      for (const item of result.mismatchedPositions) {
        lines.push(`- 顺序不一致：\`${item.actual.slug}\` 期望 ${item.expected.sidebarPosition}，实际 ${item.actual.sidebarPosition}`);
      }
      for (const [position, docs] of result.duplicatePositions) {
        lines.push(`- 顺序重复：sidebar_position ${position} -> ${docs.map((doc) => doc.title).join(' / ')}`);
      }
      for (const doc of result.missingPositions) {
        lines.push(`- 缺少 sidebar_position：${doc.title} -> \`${doc.slug}\``);
      }
    }

    lines.push('');
  }

  lines.push('## 本次不迁移项', '');
  lines.push('### 未归类旧文档');
  lines.push('');
  lines.push('以下文章不在用户此前截图目录中，本次不计入迁移、不导入：');
  lines.push('');
  for (const row of excludedRows) {
    lines.push(`- ${row.title} -> \`${row.markdown_output}\``);
  }

  lines.push('', '### ODPM后台板块操作指引', '');
  for (const skipped of skippedResults) {
    lines.push(`- ${skipped.level1} / ${skipped.level2}：\`${skipped.dir}\`，${skipped.reason}`);
    lines.push(`- 当前本地目录文章数：${skipped.actual.length}`);
  }

  lines.push('', '## 后续建议', '');
  lines.push('- 如果本报告显示“通过”，可将当前中文版目录作为英文迁移的结构基线。');
  lines.push('- 26 个非 ODPM 附件和 19 个 ODPM 附件已备份并建立审核区；本轮暂保留旧站外链，不替换为本地链接。');
  lines.push('- 英文迁移前建议先确认英文旧目录截图/文章顺序，避免中英文顺序不一致。');
  lines.push('');

  return lines.join('\n');
}

function buildCsv(results) {
  const headers = [
    'level1',
    'level2',
    'directory',
    'status',
    'sidebarPosition',
    'title',
    'slug',
    'file',
    'notes',
  ];
  const rows = [];

  for (const result of results) {
    for (const doc of result.actual) {
      rows.push({
        level1: result.level1,
        level2: result.level2,
        directory: result.dir,
        status: result.ok ? 'ok' : 'review',
        sidebarPosition: Number.isFinite(doc.sidebarPosition) ? doc.sidebarPosition : '',
        title: doc.title,
        slug: doc.slug,
        file: doc.file,
        notes: '',
      });
    }

    for (const doc of result.missing) {
      rows.push({
        level1: result.level1,
        level2: result.level2,
        directory: result.dir,
        status: 'missing',
        sidebarPosition: Number.isFinite(doc.sidebarPosition) ? doc.sidebarPosition : '',
        title: doc.title,
        slug: doc.slug,
        file: '',
        notes: doc.note,
      });
    }
  }

  return [
    headers.map(csvEscape).join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ].join('\n');
}

function main() {
  const auditRows = parseCsv(AUDIT_PATH);
  const results = VALIDATED_DIRECTORIES.map((config) => validateDirectory(auditRows, config));
  const skippedResults = SKIPPED_DIRECTORIES.map((config) => ({
    ...config,
    actual: listDocsInDir(config.dir),
  }));
  const excludedTitleSet = new Set(EXCLUDED_REVIEW_TITLES);
  const excludedRows = auditRows.filter((row) => row.action === 'review' && excludedTitleSet.has(row.title));

  fs.writeFileSync(REPORT_MD, buildMarkdown(results, skippedResults, excludedRows), 'utf8');
  fs.writeFileSync(REPORT_CSV, buildCsv(results), 'utf8');

  const okCount = results.filter((result) => result.ok).length;
  console.log(`Validated ${results.length} directories: ${okCount} passed, ${results.length - okCount} need review.`);
  console.log(toPosix(path.relative(ROOT, REPORT_MD)));
  console.log(toPosix(path.relative(ROOT, REPORT_CSV)));
}

main();
