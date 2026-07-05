# 中文飞书正文替换记录

生成时间：2026-07-06

## 本批处理范围

将以下原本以附件页或附件入口形式上线的中文文档，替换为飞书导出的正文内容：

- `docs/payment-faq/common-questions/afterpay-shopify-plugin-installation/index.mdx`
- `docs/payment-faq/common-questions/ideal-merchant-operation-notes/index.mdx`
- `docs/payment-faq/common-questions/klarna-norway-market-update/index.mdx`
- `docs/products-services/oceanpayment-products/oceanpayment-recurring-introduction/index.mdx`
- `docs/payment-faq/common-questions/visa-vamp-program/index.mdx`
- `docs/payment-faq/info-update/japan-credit-card-security-guidelines-5/index.mdx`

## 资源处理

- `iDEAL商户运营端注意事项` 页内图片已本地化到：
  - `static/img/help-center/ideal-merchant-operation-notes/image4.png`
- 其余 5 篇无需新增本地图片资源。

## 处理口径

- 移除仅作为附件入口的正文写法，改为直接展示中文正文内容。
- 恢复中文站点标题、`sidebar_label`、`sidebar_position` 到中文目录校验口径。
- 保留既有英文页、英文附件例外页和其他未提交迁移文件，不做回退或删除。

## 验证结果

- `npm run audit:docs` 通过
- `npm run build` 通过
- `node migration\tools\final-migration-validation.js` 通过
- `Final validation blockers: 0`
