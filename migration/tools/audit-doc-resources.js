const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const REPORT_DIR = path.join(ROOT, 'migration', 'reports');
const REPORT_PATH = path.join(REPORT_DIR, 'doc-resource-audit.md');
const CSV_PATH = path.join(REPORT_DIR, 'doc-resource-audit.csv');

const URL_RE = /https?:\/\/[^\s)>\]]+/g;
const MARKDOWN_LINK_RE = /!?\[[^\]]*]\(([^)]+)\)/g;
const RAW_CHROME_EXTENSION_RE = /chrome-extension:\/\/[^\s)>\]]+/g;

function walk(dir, predicate, files = []) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, predicate, files);
      continue;
    }

    if (!predicate || predicate(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

function csvEscape(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function relative(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}

function getLineNumber(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function classify(target, isImage) {
  if (/^images\/\?code=/.test(target)) {
    return 'broken-wordpress-image-code';
  }

  if (/^chrome-extension:\/\//.test(target)) {
    return 'chrome-extension-url';
  }

  if (/^https?:\/\/support\.oceanpayment\.com\/wp-content\/uploads\//i.test(target)) {
    return 'old-support-upload-link';
  }

  if (/^https?:\/\/support\.oceanpayment\.com\//i.test(target)) {
    return 'old-support-link';
  }

  if (/^https?:\/\//i.test(target)) {
    return isImage ? 'external-image' : 'external-reference';
  }

  if (/^\//.test(target)) {
    return 'local-absolute-resource';
  }

  return isImage ? 'local-relative-image' : 'local-relative-link';
}

function addIssue(issues, file, line, type, target, context) {
  issues.push({
    file: relative(file),
    line,
    type,
    target,
    context: context.trim(),
  });
}

function scanFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const issues = [];
  const seenAtIndex = new Set();
  let match;

  while ((match = MARKDOWN_LINK_RE.exec(content))) {
    const whole = match[0];
    const target = match[1].trim();
    const isImage = whole.startsWith('!');
    const line = getLineNumber(content, match.index);
    const type = classify(target, isImage);

    seenAtIndex.add(match.index);

    if (
      type === 'broken-wordpress-image-code' ||
      type === 'chrome-extension-url' ||
      type === 'old-support-upload-link' ||
      type === 'old-support-link' ||
      type === 'external-image'
    ) {
      addIssue(issues, file, line, type, target, whole);
    }
  }

  while ((match = RAW_CHROME_EXTENSION_RE.exec(content))) {
    const line = getLineNumber(content, match.index);
    addIssue(issues, file, line, 'chrome-extension-url', match[0], match[0]);
  }

  while ((match = URL_RE.exec(content))) {
    const target = match[0];
    if (!/^https?:\/\/support\.oceanpayment\.com\//i.test(target)) {
      continue;
    }

    const line = getLineNumber(content, match.index);
    const type = classify(target, false);
    if (!issues.some((issue) => issue.file === relative(file) && issue.line === line && issue.target === target)) {
      addIssue(issues, file, line, type, target, target);
    }
  }

  return issues;
}

function summarize(issues) {
  return issues.reduce((acc, issue) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1;
    return acc;
  }, {});
}

function main() {
  const docs = walk(DOCS_DIR, (filePath) => filePath.endsWith('.mdx'));
  const issues = docs.flatMap(scanFile).sort((a, b) => {
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    if (a.file !== b.file) return a.file.localeCompare(b.file);
    return a.line - b.line;
  });
  const counts = summarize(issues);
  const generatedAt = new Date().toISOString();

  const csv = [
    ['type', 'file', 'line', 'target', 'context'].map(csvEscape).join(','),
    ...issues.map((issue) =>
      [issue.type, issue.file, issue.line, issue.target, issue.context].map(csvEscape).join(','),
    ),
  ];

  const oldUploadIssues = issues.filter((issue) => issue.type === 'old-support-upload-link');
  const brokenImageIssues = issues.filter((issue) => issue.type === 'broken-wordpress-image-code');
  const chromeIssues = issues.filter((issue) => issue.type === 'chrome-extension-url');
  const otherSupportIssues = issues.filter((issue) => issue.type === 'old-support-link');

  const lines = [
    '# 文档资源盘点报告',
    '',
    `生成时间：${generatedAt}`,
    '',
    '## 汇总',
    '',
    `- 扫描 MDX 文件数：${docs.length}`,
    `- 需处理资源项：${issues.length}`,
    `- WordPress 图片 code 破图风险：${counts['broken-wordpress-image-code'] || 0}`,
    `- 旧站上传附件外链：${counts['old-support-upload-link'] || 0}`,
    `- 旧站普通链接：${counts['old-support-link'] || 0}`,
    `- Chrome 插件临时链接：${counts['chrome-extension-url'] || 0}`,
    '',
    '## 必须处理：WordPress 图片 code',
    '',
    ...brokenImageIssues.map((issue) => `- ${issue.file}:${issue.line} -> \`${issue.target}\``),
    '',
    '## 必须处理：Chrome 插件临时链接',
    '',
    ...chromeIssues.map((issue) => `- ${issue.file}:${issue.line} -> \`${issue.target}\``),
    '',
    '## 建议决策：旧站上传附件外链',
    '',
    '这些链接当前可作为外链保留，但如果旧站下线或权限变化，帮助中心会失效。建议后续决定是否下载到 `static/files/help-center/` 并替换为本地链接。',
    '',
    ...oldUploadIssues.map((issue) => `- ${issue.file}:${issue.line} -> ${issue.target}`),
    '',
    '## 其他旧站链接',
    '',
    ...otherSupportIssues.map((issue) => `- ${issue.file}:${issue.line} -> ${issue.target}`),
    '',
    '## 明细',
    '',
    `完整 CSV：\`migration/reports/${path.basename(CSV_PATH)}\``,
    '',
  ];

  fs.mkdirSync(REPORT_DIR, {recursive: true});
  fs.writeFileSync(REPORT_PATH, lines.join('\n'), 'utf8');
  fs.writeFileSync(CSV_PATH, csv.join('\n'), 'utf8');

  console.log(`Scanned ${docs.length} MDX files; found ${issues.length} resource items.`);
  console.log(`Report: ${relative(REPORT_PATH)}`);
  console.log(`CSV: ${relative(CSV_PATH)}`);
}

main();
