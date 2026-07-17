# Unified Document Import Workflow

`document-registry.json` is the single source of truth for newly imported documents. It records where the Feishu export came from, where the document belongs, which languages are available, and the presentation rules that cannot be inferred safely from Markdown.

## Import workflow

1. Put the exported Feishu Markdown and any `图片和附件` folder in one intake folder under `imports/`.
2. Add or update the document entry in `document-registry.json`.
3. Run `npm.cmd run import:documents`.
4. Run `npm.cmd run verify:docs`.
5. Review the local preview before publishing.

## Chatbase Sitemap

`npm run build` also generates `build/chatbase-sitemap.xml`. It scans the actual
Chinese and English Docusaurus output, so the sitemap contains only routes that
are published for each language. Every document URL includes `?source=odpm`,
which allows Chatbase to access each page without relying on a browser session.

After deploying the build, add this URL in Chatbase under `Data sources > Website > Sitemap`:

`https://support.oceanpayment.com/chatbase-sitemap.xml?source=odpm`

When a document release changes production content, refresh this sitemap source
and retrain the Agent. Remove temporary crawl-link and individual-link sources
once the sitemap is verified to avoid duplicate training data.

The import command cleans Feishu escape characters, whitespace, list markers, bold syntax, duplicated page titles, heading markup, images, attachments, and compact image rows. It also generates the required Docusaurus source and English translation paths.

## Language modes

- `english-only`: one English entry. The document is generated for English and excluded from the Chinese sidebar and search index.
- `translated`: two entries with the same `docId`, one `zh-CN` and one `en`. The Chinese source is written under `docs/`; the English source is written under `i18n/en/`. The locale switcher receives the document ID automatically.

## Required confirmation

Feishu Markdown cannot always infer the intended document outline. If a source exports all sections as H1, use `headingLevelMap` to state the intended mapping once. For example, `{ "1": 2, "3": 3 }` creates page sections as H2 and their subsections as H3. The import audit will then enforce the resulting hierarchy and numbering.

## Validation coverage

`verify:docs` runs the content audit and a full Chinese/English Docusaurus build. The audit checks for repeated H1 titles, missing numbered headings where required, invalid heading parents, malformed list and bold syntax, inconsistent Markdown table columns, missing images or attachments, and missing language files for English-only documents.
