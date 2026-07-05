const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_ROOT = 'D:\\AI_Workspace\\markdown';

const DOCS = [
  {
    sourceDir: 'Ocenapayment\u00a0ODPM - Blacklist\u00a0Operation\u00a0Manual\u00a02025-07-25',
    title: 'Oceanpayment ODPM - Blacklist Operation Manual 2025-07-25',
    slug: 'blacklist-operation-manual',
    language: 'en',
    docId: 'odpm-guide/section-guide/blacklist-operation-manual',
    sidebarPosition: 3,
  },
  {
    sourceDir: 'Ocenapayment\u00a0ODPM - Whitelist\u00a0Operation\u00a0Manual\u00a02025-07-25',
    title: 'Oceanpayment ODPM - Whitelist Operation Manual 2025-07-25',
    slug: 'whitelist-operation-manual',
    language: 'en',
    docId: 'odpm-guide/section-guide/whitelist-operation-manual',
    sidebarPosition: 4,
  },
  {
    sourceDir: 'Ocenapayment\u00a0ODPM - High Fraud Risk Alert Manual 2025-07-25',
    title: 'Oceanpayment ODPM - High Fraud Risk Alert Manual 2025-07-25',
    slug: 'high-fraud-risk-alert-manual',
    language: 'en',
    docId: 'odpm-guide/section-guide/high-fraud-risk-alert-manual',
    sidebarPosition: 5,
  },
  {
    sourceDir: 'Oceanpayment-ODPM Digital Platform Guidelines Manual-All Exceptions',
    title: 'Oceanpayment ODPM Digital Platform Guidelines Manual - All Exceptions',
    slug: 'digital-platform-guidelines-manual-all-exceptions',
    language: 'en',
    docId: 'odpm-guide/section-guide/digital-platform-guidelines-manual-all-exceptions',
    sidebarPosition: 6,
  },
  {
    sourceDir: 'Oceanpayment-Guidelines for Merchant Initiated Chargeback Recall',
    title: 'Oceanpayment Guidelines for Merchant Initiated Chargeback Recall',
    slug: 'merchant-initiated-chargeback-recall-guidelines',
    language: 'en',
    docId: 'odpm-guide/section-guide/merchant-initiated-chargeback-recall-guidelines',
    sidebarPosition: 7,
  },
  {
    sourceDir: 'Oceanpayment对账说明 - English',
    title: 'Oceanpayment Reconciliation Guide',
    slug: 'reconciliation-guide',
    language: 'en',
    docId: 'odpm-guide/section-guide/reconciliation-guide',
    sidebarPosition: 8,
  },
  {
    sourceDir: 'Oceanpayment ODPM-协议签署操作手册',
    title: 'Oceanpayment ODPM-协议签署操作手册',
    slug: 'agreement-signing-operation-manual',
    language: 'zh-CN',
    docId: 'odpm-guide/section-guide/agreement-signing-operation-manual',
    sidebarPosition: 4,
  },
  {
    sourceDir: 'Oceanpayment-ODPM数字平台操作指引手册-异常交易管理',
    title: 'Oceanpayment ODPM-数字平台操作指引手册-异常交易管理',
    slug: 'digital-platform-guide-exception-transaction-management',
    language: 'zh-CN',
    docId: 'odpm-guide/section-guide/digital-platform-guide-exception-transaction-management',
    sidebarPosition: 5,
  },
];

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, {recursive: true});
}

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
}

function yamlString(value) {
  return JSON.stringify(value);
}

function normalizeText(value) {
  return value.replace(/\u00a0/g, ' ').trim();
}

function unescapeMarkdown(value) {
  return value.replace(/\\([\\`*{}\[\]()#+\-.!_])/g, '$1');
}

function normalizeListMarkers(markdown, stats) {
  return markdown
    .split('\n')
    .map((line) => {
      const original = line;
      let next = line.replace(/^(\s*)(\d+)\\([.)])\s+/, '$1$2$3 ');
      const nestedBullet = next.match(/^(\s*)((?:-\s+){2,})(.+)$/);

      if (nestedBullet) {
        const depth = nestedBullet[2].trim().split(/\s+/).length;
        next = `${nestedBullet[1]}${'  '.repeat(depth - 1)}- ${nestedBullet[3].trim()}`;
      }

      if (next !== original) {
        stats.normalizedListMarkers += 1;
      }
      return next;
    })
    .join('\n');
}

function normalizeBoldMarkup(markdown, stats) {
  return markdown
    .split('\n')
    .map((line) => {
      const original = line;
      let next = line;

      next = next.replace(/\*\*([QA]):\s*\*\*\s*/g, '**$1:** ');
      next = next.replace(/\*\*([^*\n]+?)\s*\*\*\*\s*([^*\n]+?)\*\*/g, '**$1 $2**');

      if (next !== original) {
        stats.normalizedBoldMarkup += 1;
      }
      return next;
    })
    .join('\n');
}

function stripHeadingMarkup(value) {
  return unescapeMarkdown(value)
    .replace(/^\s*#+\s*/, '')
    .replace(/\s*#+\s*$/, '')
    .replace(/\*\*/g, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .trim();
}

function removeLeadingNumber(value) {
  return value.replace(/^\s*(?:chapter\s+)?\d+(?:\.\d+)*[.)、:：]?\s*/i, '').trim();
}

function isSentenceMisreadAsHeading(text) {
  const textWithoutNumber = removeLeadingNumber(text);
  return (
    /^持卡人对信用卡账单/.test(textWithoutNumber) ||
    textWithoutNumber.length > 110 ||
    /[。!?？]\s*.+[。!?？]/.test(textWithoutNumber)
  );
}

function cleanAssetName(fileName, usedNames) {
  const parsed = path.parse(fileName.replace(/\\/g, '/'));
  const ext = parsed.ext.toLowerCase();
  const safeBase =
    parsed.name
      .normalize('NFKC')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'asset';
  let candidate = `${safeBase}${ext}`;
  if (!usedNames.has(candidate.toLowerCase())) {
    usedNames.add(candidate.toLowerCase());
    return candidate;
  }

  const hash = crypto.createHash('sha1').update(fileName).digest('hex').slice(0, 8);
  candidate = `${safeBase}-${hash}${ext}`;
  usedNames.add(candidate.toLowerCase());
  return candidate;
}

function removeTargetDir(dirPath) {
  const resolved = path.resolve(dirPath);
  const allowedRoot = path.resolve(ROOT, 'static');
  if (!resolved.startsWith(allowedRoot + path.sep)) {
    throw new Error(`Refusing to clean outside static directory: ${resolved}`);
  }
  fs.rmSync(resolved, {recursive: true, force: true});
  ensureDir(resolved);
}

function buildAssetMap(doc, sourceDir) {
  const sourceAssetDir = path.join(sourceDir, '图片和附件');
  const imgTargetDir = path.join(ROOT, 'static', 'img', 'help-center', doc.slug);
  const fileTargetDir = path.join(ROOT, 'static', 'files', 'help-center', doc.slug);
  const map = new Map();
  const usedImageNames = new Set();
  const usedFileNames = new Set();
  const stats = {copiedImages: 0, copiedFiles: 0};

  removeTargetDir(imgTargetDir);
  removeTargetDir(fileTargetDir);

  if (!fs.existsSync(sourceAssetDir)) {
    return {map, stats};
  }

  for (const fileName of fs.readdirSync(sourceAssetDir)) {
    const sourcePath = path.join(sourceAssetDir, fileName);
    if (!fs.statSync(sourcePath).isFile()) {
      continue;
    }

    const ext = path.extname(fileName).toLowerCase();
    const isImage = IMAGE_EXTENSIONS.has(ext);
    const targetName = cleanAssetName(fileName, isImage ? usedImageNames : usedFileNames);
    const targetDir = isImage ? imgTargetDir : fileTargetDir;
    const publicBase = isImage ? `/img/help-center/${doc.slug}` : `/files/help-center/${doc.slug}`;
    fs.copyFileSync(sourcePath, path.join(targetDir, targetName));

    const normalizedOriginal = fileName.replace(/\\/g, '/');
    map.set(normalizedOriginal, `${publicBase}/${targetName}`);
    map.set(`图片和附件/${normalizedOriginal}`, `${publicBase}/${targetName}`);
    map.set(encodeURI(`图片和附件/${normalizedOriginal}`), `${publicBase}/${targetName}`);

    if (isImage) {
      stats.copiedImages += 1;
    } else {
      stats.copiedFiles += 1;
    }
  }

  return {map, stats};
}

function findMarkdownFile(sourceDir) {
  const files = fs.readdirSync(sourceDir).filter((fileName) => /\.md$/i.test(fileName));
  if (files.length !== 1) {
    throw new Error(`Expected one Markdown file in ${sourceDir}, found ${files.length}`);
  }
  return path.join(sourceDir, files[0]);
}

function rewriteAssetLinks(markdown, assetMap, stats) {
  return markdown.replace(/(!?)\[([^\]]*)]\(([^)]+)\)/g, (match, bang, label, rawHref) => {
    const href = unescapeMarkdown(rawHref.trim());
    const cleanHref = decodeURIComponent(href).replace(/\\/g, '/').replace(/^\.?\//, '');
    const mapped = assetMap.get(cleanHref) || assetMap.get(path.basename(cleanHref));
    if (!mapped) {
      return match;
    }

    if (bang) {
      stats.imageRefs += 1;
      return `![${unescapeMarkdown(label)}](${mapped})`;
    }

    stats.fileRefs += 1;
    return `[${unescapeMarkdown(label)}](${mapped})`;
  });
}

function normalizeHeadings(markdown, doc, stats) {
  const lines = markdown.split('\n');
  const docTitle = normalizeText(doc.title).toLowerCase();
  let titleRemoved = false;

  const withoutDocTitle = lines
    .map((line) => {
      if (!/^#\s+/.test(line) || titleRemoved) {
        return line;
      }

      const headingText = normalizeText(stripHeadingMarkup(line)).toLowerCase();
      if (headingText === docTitle || headingText.replace(/^ocenapayment\b/, 'oceanpayment') === docTitle) {
        titleRemoved = true;
        stats.removedTitleHeadings += 1;
        return '';
      }

      return line;
    })
    .join('\n');

  const hasH1 = /^#\s+/m.test(withoutDocTitle);
  const counters = {2: 0, 3: 0, 4: 0};

  return withoutDocTitle
    .split('\n')
    .map((line) => {
      if (/^#{1,6}\s*$/.test(line)) {
        return '';
      }

      const match = line.match(/^(#{1,6})\s+(.+?)\s*$/);
      if (!match) {
        return line;
      }

      let text = stripHeadingMarkup(match[2]);
      if (!text) {
        return '';
      }

      if (isSentenceMisreadAsHeading(text)) {
        stats.demotedHeadings += 1;
        return text;
      }

      let level = match[1].length;
      if (hasH1) {
        level += 1;
      }
      level = Math.max(2, Math.min(level, 4));

      if (level === 2) {
        counters[2] += 1;
        counters[3] = 0;
        counters[4] = 0;
      } else if (level === 3) {
        if (!counters[2]) counters[2] = 1;
        counters[3] += 1;
        counters[4] = 0;
      } else {
        if (!counters[2]) counters[2] = 1;
        if (!counters[3]) counters[3] = 1;
        counters[4] += 1;
      }

      text = removeLeadingNumber(text);
      const prefix =
        level === 2
          ? `${counters[2]}.`
          : level === 3
            ? `${counters[2]}.${counters[3]}`
            : `${counters[2]}.${counters[3]}.${counters[4]}`;

      stats.numberedHeadings += 1;
      return `${'#'.repeat(level)} ${prefix} ${text}`;
    })
    .join('\n');
}

function parseImageLine(line) {
  const trimmed = line.trim();
  const match = trimmed.match(/^!\[([^\]]*)]\((\/img\/help-center\/[^)]+)\)$/);
  if (!match) {
    return null;
  }
  return {alt: match[1], src: match[2]};
}

function pngSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') {
    return null;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function imageIsCompact(src) {
  const imagePath = path.join(ROOT, 'static', src.replace(/^\//, ''));
  if (!fs.existsSync(imagePath)) {
    return false;
  }

  const size = pngSize(imagePath);
  if (!size) {
    return false;
  }
  return size.width <= 520 || size.height >= size.width * 1.25;
}

function groupCompactImageRuns(markdown, stats) {
  const lines = markdown.split('\n');
  const out = [];

  for (let i = 0; i < lines.length; i += 1) {
    const run = [];
    let j = i;
    while (j < lines.length) {
      if (!lines[j].trim()) {
        const next = parseImageLine(lines[j + 1] || '');
        if (next && run.length > 0) {
          j += 1;
          continue;
        }
        break;
      }

      const image = parseImageLine(lines[j]);
      if (!image) {
        break;
      }
      run.push(image);
      j += 1;
    }

    if (run.length > 1 && run.every((image) => imageIsCompact(image.src))) {
      out.push('<div className="doc-image-row">');
      for (const image of run) {
        out.push(`  <img src="${image.src}" alt="${image.alt || ''}" />`);
      }
      out.push('</div>');
      stats.groupedImageRows += 1;
      i = j - 1;
      continue;
    }

    out.push(lines[i]);
  }

  return out.join('\n');
}

function normalizeSpacing(markdown) {
  return markdown
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function buildFrontmatter(doc) {
  return [
    '---',
    `title: ${yamlString(doc.title)}`,
    `sidebar_label: ${yamlString(doc.title)}`,
    `sidebar_position: ${doc.sidebarPosition}`,
    'hide_title: true',
    '---',
    '',
  ].join('\n');
}

function transformMarkdown(doc, sourceDir, assetMap) {
  const sourceMdPath = findMarkdownFile(sourceDir);
  const stats = {
    imageRefs: 0,
    fileRefs: 0,
    numberedHeadings: 0,
    removedTitleHeadings: 0,
    demotedHeadings: 0,
    normalizedListMarkers: 0,
    normalizedBoldMarkup: 0,
    groupedImageRows: 0,
  };

  let markdown = readUtf8(sourceMdPath).replace(/\u00a0/g, ' ');
  markdown = rewriteAssetLinks(markdown, assetMap, stats);
  markdown = normalizeListMarkers(markdown, stats);
  markdown = unescapeMarkdown(markdown);
  markdown = normalizeListMarkers(markdown, stats);
  markdown = normalizeBoldMarkup(markdown, stats);
  markdown = normalizeHeadings(markdown, doc, stats);
  markdown = groupCompactImageRuns(markdown, stats);
  markdown = normalizeSpacing(markdown);

  return {
    content: `${buildFrontmatter(doc)}${markdown}\n`,
    stats,
  };
}

function writeDoc(doc, content) {
  const sourcePath = path.join(ROOT, 'docs', doc.docId, 'index.mdx');
  ensureDir(path.dirname(sourcePath));
  fs.writeFileSync(sourcePath, content, 'utf8');

  const written = [sourcePath];
  if (doc.language === 'en') {
    const localizedPath = path.join(
      ROOT,
      'i18n',
      'en',
      'docusaurus-plugin-content-docs',
      'current',
      doc.docId,
      'index.mdx',
    );
    ensureDir(path.dirname(localizedPath));
    fs.writeFileSync(localizedPath, content, 'utf8');
    written.push(localizedPath);
  }

  return written;
}

function main() {
  const dryRun = process.argv.includes('--dry-run');
  const report = [];

  for (const doc of DOCS) {
    const sourceDir = path.join(SOURCE_ROOT, doc.sourceDir);
    if (!fs.existsSync(sourceDir)) {
      throw new Error(`Missing source directory: ${sourceDir}`);
    }

    const {map, stats: assetStats} = dryRun
      ? {map: new Map(), stats: {copiedImages: 0, copiedFiles: 0}}
      : buildAssetMap(doc, sourceDir);
    const {content, stats} = transformMarkdown(doc, sourceDir, map);
    const written = dryRun ? [] : writeDoc(doc, content);

    report.push({
      language: doc.language,
      slug: doc.slug,
      ...assetStats,
      ...stats,
      written: written.length,
    });
  }

  for (const entry of report) {
    console.log(
      [
        entry.language,
        entry.slug,
        `images=${entry.copiedImages}`,
        `files=${entry.copiedFiles}`,
        `refs=${entry.imageRefs}`,
        `fileRefs=${entry.fileRefs}`,
        `headings=${entry.numberedHeadings}`,
        `titleHeadingsRemoved=${entry.removedTitleHeadings}`,
        `listMarkers=${entry.normalizedListMarkers}`,
        `bold=${entry.normalizedBoldMarkup}`,
        `imageRows=${entry.groupedImageRows}`,
        `written=${entry.written}`,
      ].join(' | '),
    );
  }
}

main();
