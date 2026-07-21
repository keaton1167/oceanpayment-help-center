import 'dotenv/config';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {algoliasearch} from 'algoliasearch';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RECORDS_PATH = path.join(ROOT, 'artifacts', 'algolia-help-center-records.json');
const REPORT_PATH = path.join(ROOT, 'artifacts', 'algolia-help-center-export-report.json');
const shouldApply = process.argv.includes('--apply');
const shouldThrottle = process.argv.includes('--throttled');
const MAX_RATE_LIMIT_RETRIES = 2;
const RATE_LIMIT_RETRY_DELAY_MS = 65_000;
const INDEXING_OPERATION_DELAY_MS = 75_000;

const records = JSON.parse(await readFile(RECORDS_PATH, 'utf8'));
const report = JSON.parse(await readFile(REPORT_PATH, 'utf8'));
const indexName = process.env.ALGOLIA_INDEX_NAME;

if (!indexName) {
  throw new Error('ALGOLIA_INDEX_NAME is required.');
}

if (records.length !== report.records) {
  throw new Error('Export report and records file do not match. Run npm run export:algolia again.');
}

console.log(`Prepared ${records.length} records for ${report.publishedDocuments} published documents.`);
console.log(`Target index: ${indexName}`);
console.log(`Mode: ${shouldThrottle ? 'throttled atomic replace' : 'standard atomic replace'}`);

if (!shouldApply) {
  console.log('Dry run only. Re-run with --apply after configuring ALGOLIA_ADMIN_API_KEY.');
  process.exit(0);
}

const applicationId = process.env.ALGOLIA_APPLICATION_ID;
const adminApiKey = process.env.ALGOLIA_ADMIN_API_KEY;

if (!applicationId || !adminApiKey) {
  throw new Error('ALGOLIA_APPLICATION_ID and ALGOLIA_ADMIN_API_KEY are required for --apply.');
}

const client = algoliasearch(applicationId, adminApiKey);

function waitForIndexingWindow() {
  return new Promise((resolve) => setTimeout(resolve, INDEXING_OPERATION_DELAY_MS));
}

async function replaceAllObjects() {
  if (!shouldThrottle) {
    return client.replaceAllObjects({
      indexName,
      objects: records,
      scopes: ['settings', 'rules', 'synonyms'],
    });
  }

  const temporaryIndex = `${indexName}_tmp_${Date.now()}`;
  const copyResult = await client.operationIndex({
    indexName,
    operationIndexParams: {
      operation: 'copy',
      destination: temporaryIndex,
      scope: ['settings', 'rules', 'synonyms'],
    },
  });
  await client.waitForTask({indexName, taskID: copyResult.taskID});

  console.log('Copied index settings. Waiting before writing the temporary index.');
  await waitForIndexingWindow();
  await client.saveObjects({
    indexName: temporaryIndex,
    objects: records,
    waitForTasks: true,
  });

  console.log('Wrote temporary index. Waiting before replacing the live index.');
  await waitForIndexingWindow();
  const moveResult = await client.operationIndex({
    indexName: temporaryIndex,
    operationIndexParams: {
      operation: 'move',
      destination: indexName,
    },
  });
  await client.waitForTask({indexName: temporaryIndex, taskID: moveResult.taskID});
}

for (let attempt = 0; attempt <= MAX_RATE_LIMIT_RETRIES; attempt += 1) {
  try {
    await replaceAllObjects();

    console.log(`Replaced all objects in ${indexName} with ${records.length} records.`);
    break;
  } catch (error) {
    const status = error?.status;
    const canRetry = status === 429 && attempt < MAX_RATE_LIMIT_RETRIES;

    if (canRetry) {
      console.warn(
        `Algolia rate limit reached. Retrying in ${RATE_LIMIT_RETRY_DELAY_MS / 1000} seconds (${attempt + 1}/${MAX_RATE_LIMIT_RETRIES}).`,
      );
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_RETRY_DELAY_MS));
      continue;
    }

    const reason = status === 429 ? 'Algolia rate limit remained in effect.' : 'Algolia rejected the sync request.';
    console.error(`${reason} No API key or request details were logged.`);
    process.exitCode = 1;
  }
}
