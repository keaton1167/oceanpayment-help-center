import 'dotenv/config';
import {algoliasearch} from 'algoliasearch';

const shouldApply = process.argv.includes('--apply');
const indexName = process.env.ALGOLIA_INDEX_NAME;
const applicationId = process.env.ALGOLIA_APPLICATION_ID;
const adminApiKey = process.env.ALGOLIA_ADMIN_API_KEY;

if (!indexName) {
  throw new Error('ALGOLIA_INDEX_NAME is required.');
}

if (!shouldApply) {
  console.log(`Dry run: ${indexName} will make locale filterable.`);
  console.log('Re-run with --apply after configuring ALGOLIA_ADMIN_API_KEY.');
  process.exit(0);
}

if (!applicationId || !adminApiKey) {
  throw new Error('ALGOLIA_APPLICATION_ID and ALGOLIA_ADMIN_API_KEY are required for --apply.');
}

const client = algoliasearch(applicationId, adminApiKey);
const settings = await client.getSettings({indexName});
const attributesForFaceting = settings.attributesForFaceting || [];
const localeFacet = 'filterOnly(locale)';

if (attributesForFaceting.includes(localeFacet)) {
  console.log('locale is already filterable.');
  process.exit(0);
}

const task = await client.setSettings({
  indexName,
  indexSettings: {
    attributesForFaceting: [...attributesForFaceting, localeFacet],
  },
});

await client.waitForTask({indexName, taskID: task.taskID});
console.log('Configured locale as a filter-only attribute.');
