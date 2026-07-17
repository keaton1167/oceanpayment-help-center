# Oceanpayment Help Center

这是 Oceanpayment 新帮助中心本地项目，基于 Docusaurus。当前公开帮助中心阶段已基本收尾，下一阶段进入“帮助中心运营 Agent 工作台”的规划和开工准备。

## 当前状态

- 公开帮助中心：Docusaurus 双语站点，中文默认语言为 `zh-Hans`，英文语言为 `en`。
- 已完成：文档整理、双语结构、来源限制、搜索修复、附件预览优化、目录折叠、footer 优化、构建包整理。
- 当前主维护清单已按项目实际文档重新生成，建议使用 `帮助中心文档清单_主维护版_2026-07-10.xlsx`。
- 新阶段：规划“帮助中心运营 Agent 工作台”，用于让运营人员维护文档、导入飞书内容、生成 MDX、审核、构建 build 包并通知技术支持部。

## 新会话入口

如果是新会话或新同事接手，建议先阅读：

```text
project-progress-summary-2026-07-10.md
notes/帮助中心运营Agent工作台_新会话交接_2026-07-10.md
notes/帮助中心运营Agent工作台_文档索引_2026-07-10.md
```

公开帮助中心旧阶段参考：

```text
project-handoff-2026-07-09.md
```

## 关键目录

公开帮助中心正文：

```text
docs
i18n/en/docusaurus-plugin-content-docs/current
```

静态资源：

```text
static/img/help-center
static/files/help-center
static/js/attachment-preview.js
```

关键配置与逻辑：

```text
docusaurus.config.js
sidebars.js
src/theme/Root.js
scripts/
```

新阶段规划资料：

```text
notes/
```

旧妙搭参考系统：

```text
miaoda-app/
```

说明：`miaoda-app` 只作为参考，不迁移旧数据，不继续作为正式新系统开发目录。

## 本地预览

开发预览：

```powershell
& "C:\Program Files\nodejs\npm.cmd" run start -- --host 127.0.0.1 --port 3010
```

常用访问地址：

```text
http://127.0.0.1:3010/docs/intro?source=odpm
http://127.0.0.1:3010/en/docs/intro?source=iam
```

## 构建

```powershell
& "C:\Program Files\nodejs\npm.cmd" run build
```

当前已有构建包：

```text
build-oceanpayment-help-center-20260709-search-fixed.zip
```

说明：这是公开帮助中心静态站点部署包，不包含后续管理系统。

## 搜索方案

当前全文搜索由 `@easyops-cn/docusaurus-search-local` 提供，并非 Docusaurus 内置搜索。索引随静态站点构建，不依赖外部搜索服务。

现阶段继续使用本地搜索，暂不切换 Algolia。当前文档量仍适合静态索引；Algolia 的主要增益是错别字容错、相关性调优、同义词、搜索分析和大规模索引性能，但会增加外部服务、索引同步、访问凭据、隐私评估和费用管理。由于站点还有 `source`/IAM 入口限制，Algolia 爬虫或索引上传也需要额外设计。

建议在出现以下情况时重新评估 Algolia：

- 需要查看无结果关键词、热门搜索和点击转化。
- 用户明显受到拼写错误、同义词或中英文混搜影响。
- 文档数量或本地索引体积显著增长，首搜加载速度不可接受。
- 客服机器人对搜索日志和知识缺口的分析不能覆盖运营需求。

## 来源限制

外部系统入口必须带参数：

- ODPM：`?source=odpm`
- IAM：`?source=iam`

首次访问没有有效 `source` 参数时，会跳转到 IAM 登录页。首次带有效来源进入后，站内跳转不需要每个链接都手动补参数。

## 下一阶段建议

下一阶段建议新建独立目录：

```text
help-center-admin/
  client/
  server/
  packages/
    help-center-core/
```

该系统应独立于 Docusaurus 公开站点，不应打进公开帮助中心 `build` 包。

## 工作区注意事项

- 不要直接 `git add .`。
- 不要删除 `miaoda-app/`。
- 不要把管理后台代码写进 Docusaurus `src/`。
- 不要把 App Secret、API Key、Token 写进前端或文档。
- 不要自动部署公司服务器。
- `.docusaurus`、日志、缓存、旧预览文件和构建压缩包属于可再生成或本地交付文件，通常不作为源码提交。
