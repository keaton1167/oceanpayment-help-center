# 中文迁移待处理清单

生成时间：2026-07-02

## 当前基线

- 已按新目录映射导入中文版非 ODPM 内容：产品与服务、客户服务、合规与认证、Payment 收单常见 FAQ、OP Card 常见 FAQ。
- `ODPM后台板块操作指引` 已按约定跳过，避免重复迁移已完成内容。
- `OPCCOUNT平台操作手册-2026-4-23` 保留现有完整文档，不使用 WordPress 里仅 PDF 链接的旧文档覆盖。
- 文档落地方式统一为 `文章 slug/index.mdx`，标题与侧边栏标签保留旧文档标题，目录 slug 使用英文 kebab-case。
- 已完成中文版目录与顺序校验：`migration/reports/zh-directory-validation.md`，CSV：`migration/reports/zh-directory-validation.csv`。10 个新二级目录全部通过，期望文章数 112，实际文章数 112。

## 待处理：资源与链接

- 已根据旧帮助中心页面截图确认，`如何暂停或注销我的卡片？` 和 `交易/结算流程中的币种换算说明` 实际页面没有显示图片。4 个 `images/?code=...` 属于 WordPress XML 中残留的飞书临时图片块，已从新 MDX 中移除。
- 已生成资源明细报告：`migration/reports/doc-resource-audit.md`，CSV 明细：`migration/reports/doc-resource-audit.csv`。
- 多篇新导入文档仍保留 `support.oceanpayment.com/wp-content/uploads/...` PDF 或附件链接，当前盘点到 26 个旧站上传附件外链。
- 26 个旧站附件已备份到 `static/files/help-center/wordpress-attachments/`，下载报告为 `migration/reports/old-support-attachment-downloads.csv`。当前只完成本地备份，MDX 文档里的链接尚未替换为本地链接。
- 已额外生成一份人工审核副本目录：`migration/review/attachments/`。文件名包含编号、旧目录、旧文章和附件标题，便于先人工判断是否已被迁移正文替代。
- 附件审核索引：`migration/review/attachment-review-index.md`，CSV：`migration/review/attachment-review-index.csv`。
- `ODPM后台板块操作指引` 此前未包含在 26 个已导入文档附件中，已单独补充审核区。
- ODPM 旧目录共找到 19 个附件，已备份到 `static/files/help-center/wordpress-attachments-odpm/`，并复制到人工审核目录 `migration/review/attachments-odpm/`。
- ODPM 附件审核索引：`migration/review/attachment-review-odpm-index.md`，CSV：`migration/review/attachment-review-odpm-index.csv`，下载报告：`migration/reports/old-support-attachment-downloads-odpm.csv`。
- 后续可执行附件本地化替换：将 MDX 中的旧站附件 URL 替换为 `/files/help-center/wordpress-attachments/...`。

## 待处理：未归类旧文档

以下 6 篇在当前目录映射中未能稳定归入新二级目录，暂不导入，后续统一确认：

- `除国际信用卡，Oceanpayment支持哪些国家的本地支付产品？`
- `换了新的网站域名进行推广，是否需要重新申请通道？`
- `如何降低欺诈交易拒付的发生`
- `伪冒处理说明`
- `调单处理说明`
- `拒付处理说明`

处理结论：用户确认如果不在此前截图中，则不计入本次迁移。本批 6 篇保持待处理，不导入、不参与本次目录顺序。

## 待处理：顺序复核

- 新一级目录顺序按当前本地项目新架构保留。
- 新二级目录顺序按用户确认的新目录映射保留。
- 每个二级目录里的文章顺序已尽量按截图/旧目录顺序写入 `sidebar_position`。
- OP Card 常见问题文章数量较多，后续如果用户提供英文截图或更完整旧目录截图，建议再做一次严格顺序复核。

## 后续建议

- 先完成中文版资源清理：图片、PDF、附件链接。
- 再处理 6 篇未归类旧文档的目标目录。
- 最后开始英文导入；英文 XML 已准备好，但英文目录截图/顺序尚未完全确认。
