import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD_DIR = path.join(ROOT, 'build');
const OUTPUT_PATH = path.join(BUILD_DIR, 'chatbase-sitemap.xml');
const SITE_URL = (process.env.CHATBASE_SITE_URL || 'https://support.oceanpayment.com').replace(/\/$/, '');
const SOURCE_QUERY = 'source=odpm';
const DOC_ROOTS = ['docs', path.join('en', 'docs')];

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function findDocumentRoutes(directory, routePrefix) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const routes = [];
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    if (!entry.isDirectory()) {
      continue;
    }

    const entryPath = path.join(directory, entry.name);
    const route = `${routePrefix}/${entry.name}`;
    if (fs.existsSync(path.join(entryPath, 'index.html'))) {
      routes.push(route);
    }
    routes.push(...findDocumentRoutes(entryPath, route));
  }
  return routes;
}

if (!fs.existsSync(BUILD_DIR)) {
  throw new Error('Missing build output. Run the Docusaurus build before generating the Chatbase sitemap.');
}

const routes = DOC_ROOTS.flatMap((docRoot) =>
  findDocumentRoutes(path.join(BUILD_DIR, docRoot), `/${docRoot.replaceAll(path.sep, '/')}`),
).sort((left, right) => left.localeCompare(right));

if (routes.length === 0) {
  throw new Error('No documentation routes were found in the build output.');
}

const urls = [...new Set(routes)].map((route) => `${SITE_URL}${route}/?${SOURCE_QUERY}`);
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
  '</urlset>',
  '',
].join('\n');

fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');
console.log(`Generated ${urls.length} Chatbase sitemap URLs at ${path.relative(ROOT, OUTPUT_PATH)}.`);
