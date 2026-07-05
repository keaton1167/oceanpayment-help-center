# Oceanpayment 帮助中心迁移交接文档

生成时间：2026-07-03

## 当前状态

项目目录：

`D:\AI_Workspace\oceanpayment-help-center`

这是一个 Docusaurus 帮助中心项目。目前迁移任务仍在进行中，工作区里有大量未提交的新文档、附件、报告和脚本改动，这是正常状态。

请注意：新会话接手时不要执行 `git reset --hard`、`git clean`、批量删除、批量回退等操作，除非用户明确要求。

最近验证状态：

- `npm run audit:docs` 已通过。
- `npm run build` 已通过。
- `node migration\tools\final-migration-validation.js` 已通过。
- 最终迁移校验结果：`blockers: 0`。
- 如果本地预览服务还在运行，可访问 `http://127.0.0.1:3000/`。

## 当前迁移口径

- 新帮助中心文档统一使用 MDX。
- 每篇文档目录下使用 `index.mdx`，这是 Docusaurus 的正常规范。
- 英文-only 页面需要同时存在：
  - `docs/.../index.mdx`
  - `i18n/en/docusaurus-plugin-content-docs/current/.../index.mdx`
- 英文-only 页面会加入 `docusaurus.config.js` 的 `ENGLISH_ONLY_DOC_IDS`，避免中文构建生成不存在的页面。
- 中英文都有的页面会加入 `TRANSLATED_DOC_IDS`。
- 旧目录 `ODPM后台板块操作指引` 之前已经完成迁移，本次不要重复迁移。
- 旧站附件链接不能依赖老帮助中心，最终要本地化到项目的 `/files/...` 路径。
- 旧站或飞书导出的内容，如果正文里有 `# H1`，进入项目后不保留正文 H1。页面标题由 frontmatter 的 `title` 管理，正文从 `##` 开始。
- 标题、列表、加粗、表格等问题优先在导入脚本和审计脚本里处理，不建议只靠 CSS 补救。

## 新目录映射

当前项目目录大致对应关系：

- `docs/odpm-guide/section-guide/`：ODPM 账户后台操作指引 / 板块操作指引。
- `docs/payment-faq/info-update/`：Payment 收单信息更新专区。
- `docs/payment-faq/common-questions/`：Payment 收单常见问题。
- `docs/payment-faq/account-transfer/`：账户划款、提现、代付指引。
- `docs/op-card-faq/common-questions/`：OP Card 常见问题。
- `docs/op-card-faq/terms-conditions/`：OP Card 条款和条件。
- `docs/op-card-faq/google-pay-faq/`：OP Card 支持 Google Pay FAQ。该目录之前缺失，已补上。
- `docs/products-services/oceanpayment-products/`：产品与服务。
- `docs/compliance-certification/access-compliance/`：准入与合规管理。
- `docs/customer-service/customer-service-faq/`：客户服务常见问题。

## 已完成工作

### 中文基础迁移

- 中文旧 WordPress XML 已做过转换。
- 大量中文文档已经生成到 `docs/...`。
- 中文目录校验之前已通过。
- 相关报告：
  - `migration/reports/zh-directory-validation.md`
  - `migration/reports/zh-directory-validation.csv`
- 最终校验里中文目录数量为 `112/112`。

但中文仍有后续任务：附件本地化、页面质量复核、部分表格/列表/加粗问题检查。

### 英文迁移

英文版本目前已基本完成一轮闭环：

- 英文文档已迁入 `i18n/en/docusaurus-plugin-content-docs/current/...`。
- 英文-only 文档已配置到 `docusaurus.config.js`。
- 英文目录、侧边栏、分类名称已做适配。
- 英文构建通过。

### 英文附件本地化

英文附件处理已完成：

- 旧站 `support.oceanpayment.com/.../wp-content/uploads/...` 附件链接已替换为本地静态路径。
- 英文附件备份位置：
  - `static/files/help-center/wordpress-attachments-en/`
- ODPM 附件备份位置：
  - `static/files/help-center/wordpress-attachments-odpm/`
- 中文或通用附件备份位置：
  - `static/files/help-center/wordpress-attachments/`
- 附件预览支持：
  - 点击预览窗口打开文件。
  - 底部文件标题链接打开文件。
  - 下载按钮。
  - 中英文按钮和提示文案区分。
- 英文附件已生成可读文件名副本，避免用户打开乱码或无意义文件名。

相关文件：

- `static/js/attachment-preview.js`
- `migration/tools/localize-en-attachment-links.js`
- `migration/tools/create-readable-en-attachment-files.js`
- `migration/reports/en-attachment-links-localized.md`
- `migration/reports/en-readable-attachment-files.md`

### 语言切换

语言切换已经修复：

- 文件：`static/js/language-switcher.js`
- `docusaurus.config.js` 当前加载版本：
  - `language-switcher.js?v=20260703-1`
- 英文-only 页面切换中文时，不再跳到不存在页面导致 404，而是兜底到可用页面。
- 最终校验脚本已经同步检查该版本。

### 飞书 Markdown 导入清洗

已优化飞书导入脚本：

文件：

`scripts/import-feishu-markdown-docs.js`

目前能处理：

- `1\.` 这类被转义的有序列表。
- `- - - item` 这类异常无序列表。
- `**Q: ****...**` 这类飞书异常加粗。
- 和文档标题重复的 H1 会被移除。
- 真实正文 H1 会降级处理，不会误删。
- 导入日志会显示列表和加粗清洗数量。

已增强内容审计脚本：

文件：

`scripts/audit-docs-content.js`

目前会检查：

- 托管迁移文档正文是否残留 H1。
- 编号标题层级是否缺父级。
- 是否还有 `1\.` 这种转义有序列表。
- 是否还有 `- - -` 这类折叠无序列表。
- 是否还有异常 Q/A 加粗。
- 标题里是否有异常加粗。
- 静态图片或附件是否缺失。

### 新飞书文章导入

已导入一篇英文飞书文章：

源目录：

`C:\Users\ahui\Desktop\帮助中心文件\Oceanpayment-Merchant Batch Representment Submission Guide`

生成页面：

- `docs/odpm-guide/section-guide/merchant-batch-representment-submission-guide/index.mdx`
- `i18n/en/docusaurus-plugin-content-docs/current/odpm-guide/section-guide/merchant-batch-representment-submission-guide/index.mdx`

图片目录：

`static/img/help-center/merchant-batch-representment-submission-guide/`

处理结果：

- 该页面为英文-only。
- 已加入 `ENGLISH_ONLY_DOC_IDS`。
- 排序放在 `Oceanpayment Reconciliation Guide - English` 后面。
- 已恢复飞书截图中的标题编号，例如 `1. Feature Overview`。
- 已删除正文 H1。
- 构建和审计通过。

### 两个英文重点页面已单独优化

用户指出以下两个英文页面旧站排版混乱，已单独修复：

- `/en/docs/payment-faq/common-questions/visa-mastercard-refund-rules-update/`
- `/en/docs/payment-faq/common-questions/klarna-dispute-lifecycle/`

对应文件：

- `i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions/visa-mastercard-refund-rules-update/index.mdx`
- `i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions/klarna-dispute-lifecycle/index.mdx`

修复内容：

- 修复 `1. ##`、`2. ###` 这类错误标题结构。
- 恢复标准标题，例如 `## 1. Core Background...`。
- 修复箭头、引号、标点乱码。
- 表格里被压成一行的列表已恢复成真正的 `ul/ol`。
- 用户不希望表格出现横向滚动条，所以已移除 `doc-table-scroll` 和 `doc-merged-table`。
- 这两个页面的表格现在使用全局表格样式。

验证结果：

- `npm run audit:docs` 通过。
- `npm run build` 通过。
- 最终迁移校验 `blockers: 0`。
- 两个页面本地访问均返回 `200`。

## 重要报告文件

- 最终迁移校验：
  - `migration/reports/final-migration-validation.md`
- 英文迁移审计：
  - `migration/reports/en-migration-audit.csv`
- 英文迁移总结：
  - `migration/reports/en-migration-summary.md`
- 英文导入校验：
  - `migration/reports/en-import-validation.md`
- 英文附件本地化报告：
  - `migration/reports/en-attachment-links-localized.md`
- 英文可读附件文件名报告：
  - `migration/reports/en-readable-attachment-files.md`
- 中文目录校验：
  - `migration/reports/zh-directory-validation.md`
- 资源审计：
  - `migration/reports/doc-resource-audit.md`

注意：部分旧报告在 PowerShell 里可能显示乱码，这是历史编码/终端显示问题。新会话优先以最新构建和最终校验结果为准。

## 当前工作区注意事项

当前工作区有大量未提交迁移文件，这是正常状态。

不要执行：

- `git reset --hard`
- `git clean`
- `git checkout --`
- 批量删除文件
- 批量移动文件

除非用户明确要求。

当前涉及的重要改动包括：

- `docusaurus.config.js`
- `static/js/attachment-preview.js`
- `static/js/language-switcher.js`
- `scripts/import-feishu-markdown-docs.js`
- `scripts/audit-docs-content.js`
- `migration/tools/final-migration-validation.js`
- 大量 `docs/...` 中文迁移文档
- 大量 `i18n/en/...` 英文迁移文档
- `static/files/help-center/...` 附件目录
- `static/img/help-center/...` 图片目录

## 下一步建议任务

下一步建议进入：**中文版本调整，优先处理中文附件本地化与上线口径确认**。

建议执行顺序：

1. 扫描中文 `docs` 里仍然引用旧帮助中心附件链接的页面。
2. 整理中文附件清单，字段包括：
   - 文档标题
   - 文档路径
   - 旧附件 URL
   - 建议本地目标路径
   - 是否疑似已经转正文
   - 是否可能重复迁移
   - 备注
3. 确认哪些中文附件页要上线，哪些是重复的旧附件页。
4. 检查 `static/files/help-center/wordpress-attachments/` 中文附件备份是否完整。
5. 把中文页面里的旧站附件链接替换为本地 `/files/help-center/wordpress-attachments/...` 路径。
6. 生成中文可读文件名副本，避免用户打开乱码或无意义文件名。
7. 复核中文附件预览：
   - 预览窗口可点击。
   - 底部标题链接可点击。
   - 下载按钮显示中文 `下载`。
   - 不再依赖旧站链接。
8. 抽查中文页面的转换质量：
   - H1
   - 有序列表
   - 无序列表
   - 加粗
   - 乱码
   - 表格布局
9. 最后运行：
   - `npm run audit:docs`
   - `npm run build`
   - `node migration\tools\final-migration-validation.js`

## 新会话交接提示词

新开 Codex 会话后，可以直接复制下面这段：

```text
请继续 Oceanpayment 帮助中心迁移任务。项目目录是：
D:\AI_Workspace\oceanpayment-help-center

请先阅读交接文档：
D:\AI_Workspace\oceanpayment-help-center\migration\reports\project-handoff-2026-07-03.md

当前状态：
- 英文版本迁移、附件本地化、语言切换兜底、飞书导入清洗、两个重点英文页面优化都已完成。
- 最近验证通过：npm run audit:docs、npm run build、node migration\tools\final-migration-validation.js。
- 最终迁移校验 blockers: 0。
- 工作区有大量未提交迁移文件，这是正常状态。不要 reset、clean、删除或回退未提交内容。

下一步任务：
进入中文版本调整，优先做中文附件本地化与上线口径确认。

请从第 1 步开始：
扫描中文 docs 里仍然引用旧帮助中心附件链接的页面，整理中文附件清单。

清单需要包含：
- 文档标题
- 文档路径
- 旧附件 URL
- 建议本地目标路径
- 是否疑似已转正文或可能重复迁移
- 备注

注意：
- 不要改动旧的 ODPM 已完成迁移内容，避免重复迁移。
- 不要删除已有文档或附件。
- 先输出扫描结果和建议处理口径，确认后再批量替换中文附件链接。
- 后续中文附件本地化要对齐英文已完成标准：本地 /files 路径、可读文件名、预览可点击、底部标题链接、下载按钮中文文案。
```
