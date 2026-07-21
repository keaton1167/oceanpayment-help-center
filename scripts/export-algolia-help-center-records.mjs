import {createHash} from 'node:crypto';
import {mkdir, readdir, readFile, writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requireFromRoot = createRequire(path.join(ROOT, 'package.json'));
const OUTPUT_PATH = path.join(ROOT, 'artifacts', 'algolia-help-center-records.json');
const REPORT_PATH = path.join(ROOT, 'artifacts', 'algolia-help-center-export-report.json');
const CONFIG_URL = new URL('../docusaurus.config.js', import.meta.url);
const SITE_URL = (process.env.ALGOLIA_SITE_URL || 'https://support.oceanpayment.com').replace(/\/$/, '');
const MAX_CONTENT_BYTES = 5000;

async function listMdxFiles(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return listMdxFiles(entryPath);
      }
      return entry.isFile() && entry.name.endsWith('.mdx') ? [entryPath] : [];
    }),
  );

  return files.flat();
}

function frontMatterValue(source, field) {
  const frontMatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const value = frontMatter?.[1].match(new RegExp(`^${field}:\\s*["']?(.+?)["']?\\s*$`, 'm'));
  return value?.[1]?.trim() || '';
}

function toPlainText(source) {
  return source
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
    .replace(/^import .*$/gm, '')
    .replace(/^export .*$/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_`>#|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstHeading(source) {
  const heading = source.match(/^#\s+(.+)$/m);
  return heading?.[1]?.replace(/[*_`]/g, '').trim() || '';
}

function splitByByteLength(text, maxBytes) {
  const chunks = [];
  let chunk = '';

  for (const character of text) {
    if (Buffer.byteLength(chunk + character, 'utf8') > maxBytes && chunk) {
      chunks.push(chunk);
      chunk = '';
    }

    chunk += character;
  }

  if (chunk) {
    chunks.push(chunk);
  }

  return chunks;
}

function routeFor(filePath, locale) {
  const relativePath = path.relative(locale.root, filePath).replace(/\\/g, '/');
  const docPath = relativePath.replace(/\/index\.mdx$/, '').replace(/\.mdx$/, '');
  const route = docPath === 'intro' ? 'intro' : docPath;
  const prefix = locale.code === 'en' ? '/en/docs/' : '/docs/';
  return `${SITE_URL}${prefix}${route}/`.replace(/intro\/$/, 'intro');
}

function normalizeRelativePath(root, filePath) {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function isPublishedFile(relativePath, docsOptions) {
  if (docsOptions.include) {
    return docsOptions.include.includes(relativePath);
  }

  return !docsOptions.exclude?.some((pattern) => {
    if (!pattern.endsWith('/**')) {
      return relativePath === pattern;
    }

    return relativePath.startsWith(pattern.slice(0, -3));
  });
}

async function loadDocsOptions(locale) {
  const previousLocale = process.env.DOCUSAURUS_CURRENT_LOCALE;
  process.env.DOCUSAURUS_CURRENT_LOCALE = locale;

  try {
    // Docusaurus provides this global while evaluating its config.
    globalThis.require ??= requireFromRoot;
    const {default: config} = await import(`${CONFIG_URL.href}?algoliaExportLocale=${locale}`);
    const classicPreset = config.presets.find(
      (preset) => Array.isArray(preset) && preset[0] === 'classic',
    );
    const docsOptions = classicPreset?.[1]?.docs;

    if (!docsOptions) {
      throw new Error(`Unable to read Docusaurus docs options for locale ${locale}.`);
    }

    return docsOptions;
  } finally {
    if (previousLocale === undefined) {
      delete process.env.DOCUSAURUS_CURRENT_LOCALE;
    } else {
      process.env.DOCUSAURUS_CURRENT_LOCALE = previousLocale;
    }
  }
}

async function buildRecords(locale, docsOptions) {
  const files = (await listMdxFiles(locale.root)).sort();
  const publishedFiles = files.filter((filePath) =>
    isPublishedFile(normalizeRelativePath(locale.root, filePath), docsOptions),
  );
  const missingIncludedFiles = docsOptions.include?.filter(
    (relativePath) => !files.some((filePath) => normalizeRelativePath(locale.root, filePath) === relativePath),
  );

  if (missingIncludedFiles?.length) {
    throw new Error(
      `Published ${locale.code} documents are missing: ${missingIncludedFiles.join(', ')}`,
    );
  }

  const skippedEmptyDocuments = [];
  const records = await Promise.all(
    publishedFiles.map(async (filePath) => {
      const source = await readFile(filePath, 'utf8');
      const content = toPlainText(source);

      if (!content) {
        skippedEmptyDocuments.push({
          path: normalizeRelativePath(locale.root, filePath),
          url: routeFor(filePath, locale),
        });
        return [];
      }

      const title =
        frontMatterValue(source, 'title') ||
        firstHeading(source) ||
        path.basename(path.dirname(filePath));
      const description = frontMatterValue(source, 'description') || content.slice(0, 240);
      const url = routeFor(filePath, locale);

      return splitByByteLength(content, MAX_CONTENT_BYTES).map((chunk, chunkIndex) => ({
        objectID: createHash('sha256')
          .update(`${locale.code}:${url}:${chunkIndex}`)
          .digest('hex'),
        title,
        description,
        content: chunk,
        url,
        locale: locale.code,
        source: 'help-center',
        chunkIndex,
      }));
    }),
  );

  const flattenedRecords = records.flat();
  return {
    records: flattenedRecords,
    report: {
      locale: locale.code,
      publishedDocuments: publishedFiles.length,
      indexedDocuments: new Set(flattenedRecords.map((record) => record.url)).size,
      records: flattenedRecords.length,
      skippedEmptyDocuments: skippedEmptyDocuments.sort((a, b) => a.path.localeCompare(b.path)),
    },
  };
}

const locales = [
  {code: 'zh-Hans', root: path.join(ROOT, 'docs')},
  {code: 'en', root: path.join(ROOT, 'i18n', 'en', 'docusaurus-plugin-content-docs', 'current')},
];
const localeOptions = [];
for (const locale of locales) {
  localeOptions.push([locale, await loadDocsOptions(locale.code)]);
}

const exports = await Promise.all(
  localeOptions.map(([locale, docsOptions]) => buildRecords(locale, docsOptions)),
);
const records = exports.flatMap((result) => result.records);
const report = {
  generatedAt: new Date().toISOString(),
  publishedDocuments: exports.reduce((total, result) => total + result.report.publishedDocuments, 0),
  indexedDocuments: new Set(records.map((record) => record.url)).size,
  records: records.length,
  locales: exports.map((result) => result.report),
};

await mkdir(path.dirname(OUTPUT_PATH), {recursive: true});
await writeFile(OUTPUT_PATH, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(
  `Exported ${records.length} Algolia records for ${report.publishedDocuments} published documents to ${path.relative(ROOT, OUTPUT_PATH)}.`,
);
console.log(`Validation report: ${path.relative(ROOT, REPORT_PATH)}.`);
