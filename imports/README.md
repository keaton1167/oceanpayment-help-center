# Document Import Intake

Each new document must have one entry in `content/document-registry.json` before it is imported.

Place the exported Feishu Markdown and its `图片和附件` folder in one document-specific folder under `imports/`, then set `sourceDir` in the registry entry. A document without assets may use `sourceFile` instead.

Required registry fields:

- `docId`: destination path below `docs/`, without `index.mdx`.
- `title`: page and sidebar title.
- `language`: `zh-CN` or `en`.
- `publicationMode`: `translated` or `english-only`.
- `sidebarPosition`: ordering within its destination category.
- `sourceDir` or `sourceFile`: exported Markdown source.

Use `headingLevelMap` only when the Feishu export has an invalid heading structure that cannot be inferred safely. For example, `{ "1": 2, "3": 3 }` maps exported H1 sections to page H2 sections and H3 subsections to H3.

Run the import and validation workflow with:

```powershell
npm.cmd run import:documents
npm.cmd run verify:docs
```
