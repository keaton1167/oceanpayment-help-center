const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOC_ROOTS = ['docs', path.join('i18n', 'en', 'docusaurus-plugin-content-docs', 'current')];
const BAD_ATTACHMENT_MARKER = '\u65e0\u6cd5\u63d0\u53d6\u4e0b\u8f7d\u94fe\u63a5';
const ENGLISH_DOC_IDS = [
  'compliance-certification/enterprise-certification-faq/klarna-payment-operations-guide',
  'odpm-guide/section-guide/digital-platform-guidelines-manual',
  'op-card-faq/common-questions/opccount-guideline',
  'payment-faq/info-update/assign-account-setting',
  'products-services/oceanpayment-products/reconciliation-guideline',
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (/\.mdx?$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseFrontmatter(content) {
  content = content.replace(/^\uFEFF/, '');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return {frontmatter: '', body: content};
  }
  return {frontmatter: match[1], body: content.slice(match[0].length)};
}

function report(issues, file, line, message) {
  const relative = path.relative(ROOT, file).replace(/\\/g, '/');
  issues.push(`${relative}:${line}: ${message}`);
}

function lineNumber(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

const issues = [];

for (const root of DOC_ROOTS) {
  for (const file of walk(path.join(ROOT, root))) {
    const content = fs.readFileSync(file, 'utf8');
    const {frontmatter, body} = parseFrontmatter(content);

    const badAttachmentIndex = content.indexOf(BAD_ATTACHMENT_MARKER);
    if (badAttachmentIndex !== -1) {
      report(issues, file, lineNumber(content, badAttachmentIndex), 'contains Feishu bad attachment placeholder');
    }

    const h1Match = body.match(/^#\s+/m);
    const docId = path
      .relative(path.join(ROOT, root), path.dirname(file))
      .replace(/\\/g, '/');

    const isFirstPhasePage = ENGLISH_DOC_IDS.includes(docId);

    if (isFirstPhasePage && h1Match) {
      report(issues, file, lineNumber(body, h1Match.index), 'contains H1 in body; right TOC only supports H2/H3');
    }

    if (isFirstPhasePage && !/^hide_title:\s*true\s*$/m.test(frontmatter)) {
      report(issues, file, 1, 'first-phase English page is missing hide_title: true');
    }
  }
}

if (issues.length) {
  console.error(`Docs audit failed with ${issues.length} issue(s):`);
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log('Docs audit passed.');
