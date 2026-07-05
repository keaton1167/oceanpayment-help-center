const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(ROOT, 'docusaurus.config.js');
const REPORT_PATH = path.join(ROOT, 'migration', 'reports', 'final-migration-validation.md');
const LANGUAGE_SWITCHER_VERSION = '20260706-1';

function readConfigList(name) {
  const config = fs.readFileSync(CONFIG_PATH, 'utf8');
  const match = config.match(new RegExp(`const\\s+${name}\\s+=\\s+\\[([\\s\\S]*?)\\];`));
  if (!match) {
    throw new Error(`Cannot find ${name} in docusaurus.config.js`);
  }

  return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]);
}

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function walk(dir, predicate, files = []) {
  if (!fs.existsSync(dir)) return files;

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

function countPattern(files, pattern) {
  let count = 0;
  const details = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(pattern);
    if (!matches) continue;
    count += matches.length;
    details.push({
      file: path.relative(ROOT, file).replace(/\\/g, '/'),
      count: matches.length,
    });
  }

  return {count, details};
}

function parseZhDirectoryStatus() {
  const reportPath = path.join(ROOT, 'migration', 'reports', 'zh-directory-validation.md');
  if (!fs.existsSync(reportPath)) {
    return {ok: false, summary: 'missing report'};
  }

  const report = fs.readFileSync(reportPath, 'utf8');
  const passed = report.match(/通过目录数：(\d+)/)?.[1] || '?';
  const review = report.match(/存在待确认项目录数：(\d+)/)?.[1] || '?';
  const expected = report.match(/迁移审计期望文章数：(\d+)/)?.[1] || '?';
  const actual = report.match(/当前实际文章数：(\d+)/)?.[1] || '?';

  return {
    ok: passed === '10' && review === '0',
    summary: `${passed}/10 passed, ${review} review, expected ${expected}, actual ${actual}`,
  };
}

function main() {
  const englishOnlyDocIds = readConfigList('ENGLISH_ONLY_DOC_IDS');
  const translatedDocIds = readConfigList('TRANSLATED_DOC_IDS');
  const englishDocIds = [...englishOnlyDocIds, ...translatedDocIds];

  const englishRows = englishDocIds.map((docId) => ({
    docId,
    source: exists(`docs/${docId}/index.mdx`),
    i18n: exists(`i18n/en/docusaurus-plugin-content-docs/current/${docId}/index.mdx`),
    buildEn: exists(`build/en/docs/${docId}/index.html`),
    buildZh: exists(`build/docs/${docId}/index.html`),
    englishOnly: englishOnlyDocIds.includes(docId),
  }));

  const englishFailures = englishRows.filter((row) => {
    if (!row.source || !row.i18n || !row.buildEn) return true;
    if (row.englishOnly && row.buildZh) return true;
    if (!row.englishOnly && !row.buildZh) return true;
    return false;
  });

  const textFiles = [
    ...walk(path.join(ROOT, 'docs'), (file) => file.endsWith('.mdx')),
    ...walk(path.join(ROOT, 'i18n', 'en', 'docusaurus-plugin-content-docs', 'current'), (file) =>
      file.endsWith('.mdx'),
    ),
    ...walk(path.join(ROOT, 'static', 'js'), (file) => file.endsWith('.js')),
  ];

  const brokenImages = countPattern(textFiles, /images\/\?code=/g);
  const chromeLinks = countPattern(textFiles, /chrome-extension:\/\//g);
  const oldUploadLinks = countPattern(
    textFiles,
    /https?:\/\/support\.oceanpayment\.com\/(?:en\/)?wp-content\/uploads\//gi,
  );

  const zhStatus = parseZhDirectoryStatus();
  const languageSwitcherChecks = [
    exists('static/js/language-switcher.js'),
    exists('build/en/docs/payment-faq/common-questions/visa-mastercard-refund-rules-update/index.html') &&
      fs
        .readFileSync(
          path.join(
            ROOT,
            'build/en/docs/payment-faq/common-questions/visa-mastercard-refund-rules-update/index.html',
          ),
          'utf8',
        )
        .includes(`js/language-switcher.js?v=${LANGUAGE_SWITCHER_VERSION}`),
    exists('build/docs/payment-faq/common-questions/visa-mastercard-refund-rules-update/index.html') &&
      fs
        .readFileSync(
          path.join(ROOT, 'build/docs/payment-faq/common-questions/visa-mastercard-refund-rules-update/index.html'),
          'utf8',
        )
        .includes(`js/language-switcher.js?v=${LANGUAGE_SWITCHER_VERSION}`),
  ];

  const blockers = [
    ...englishFailures.map((row) => `English doc validation failed: ${row.docId}`),
    ...(zhStatus.ok ? [] : [`Chinese directory validation failed: ${zhStatus.summary}`]),
    ...(brokenImages.count ? [`Broken WordPress image code count: ${brokenImages.count}`] : []),
    ...(chromeLinks.count ? [`Chrome extension link count: ${chromeLinks.count}`] : []),
    ...(languageSwitcherChecks.every(Boolean) ? [] : ['Language switcher script is not fully loaded in build output']),
  ];

  const lines = [
    '# 最终迁移收尾校验报告',
    '',
    `生成时间：${new Date().toISOString()}`,
    '',
    '## 结论',
    '',
    `- 阻塞项：${blockers.length}`,
    `- 中文目录校验：${zhStatus.summary}`,
    `- 英文构建文档：${englishRows.filter((row) => row.buildEn).length}/${englishRows.length}`,
    `- 中英文对齐文档：${translatedDocIds.length}`,
    `- 英文-only 文档：${englishOnlyDocIds.length}`,
    `- 英文-only 未进入中文构建：${
      englishRows.filter((row) => row.englishOnly && !row.buildZh).length
    }/${englishOnlyDocIds.length}`,
    `- WordPress images/?code 破图：${brokenImages.count}`,
    `- Chrome extension 临时链接：${chromeLinks.count}`,
    `- 旧站附件外链：${oldUploadLinks.count}`,
    `- 语言切换脚本加载：${languageSwitcherChecks.every(Boolean) ? '通过' : '需复核'}`,
    '',
    '## 阻塞明细',
    '',
    ...(blockers.length ? blockers.map((item) => `- ${item}`) : ['- 无']),
    '',
    '## 英文-only 文档',
    '',
    ...englishOnlyDocIds.map((docId) => `- ${docId}`),
    '',
    '## 旧站附件外链说明',
    '',
    '- 当前上线口径：英文版本附件文档允许上线，附件链接已替换为本地静态文件路径。',
    '- ODPM 已转正文的操作手册类文档不恢复外链版，避免重复。',
    '- 附件备份与审核区已保留，后续仍可逐篇转为正文文档。',
    '',
  ];

  fs.mkdirSync(path.dirname(REPORT_PATH), {recursive: true});
  fs.writeFileSync(REPORT_PATH, `${lines.join('\n')}\n`, 'utf8');

  console.log(`Final validation blockers: ${blockers.length}`);
  console.log(path.relative(ROOT, REPORT_PATH).replace(/\\/g, '/'));
}

main();
