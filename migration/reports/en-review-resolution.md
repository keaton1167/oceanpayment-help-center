# 英文待确认文档处理记录

生成时间：2026-07-02

## 本轮决策

- `How to reduce the incidence of fraudulent and chargeback transactions?`：先新增英文-only 页面。
- `OPASST Guideline`：先新增英文-only 页面。
- `Guideline of OPCCOUNT`：不新增，已存在 `Guideline of OPCCOUNT-New`。
- `Klarna's APR Range Update for Consumers`：先新增英文-only 页面。
- `Besides international credit cards, which countries' local payment products does Oceanpayment support?`：先新增英文-only 页面。
- `Do I need to re-apply when I change to a new domain for promotion?`：先新增英文-only 页面。

## 新增页面

- `payment-faq/common-questions/reduce-fraudulent-chargeback-transactions`
- `payment-faq/account-transfer/opasst-guideline`
- `payment-faq/common-questions/klarna-apr-range-update-for-consumers`
- `products-services/oceanpayment-products/supported-local-payment-products`
- `products-services/oceanpayment-products/change-domain-reapply-channel`

## 实现方式

- 以上 5 篇作为英文-only 文档处理。
- 在 `docs/...` 放置英文源文档，用于 Docusaurus 建立 docId。
- 在 `i18n/en/...` 放置英文页面内容，用于英文站展示。
- 已加入 `ENGLISH_ONLY_DOC_IDS`，因此中文站构建会排除这些英文-only 页面。

## 验证结果

- `npm.cmd run build` 通过。
- 5 篇页面均已进入 `build/en/docs/...`。
- 中文站 `build/docs/...` 未生成这 5 篇英文-only 页面。
- `images/?code` 破图扫描为 0。
