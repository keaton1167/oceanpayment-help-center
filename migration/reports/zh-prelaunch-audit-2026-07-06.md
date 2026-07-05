# 中文上线前抽检记录

生成时间：2026-07-06

## 本轮抽检范围

- 最近由附件页改为正文的中文页面
- 仍保留附件展示的中文页面
- OP Card 条款和条件页面
- 中文页到英文页的语言切换

## 本轮已修复

### 1. 中文路由未生成

问题原因：

- 多篇已存在中文文档的页面仍被配置在 `ENGLISH_ONLY_DOC_IDS` 中，导致中文构建不生成对应 `/docs/...` 路由。

本轮处理：

- 将以下页面从 `ENGLISH_ONLY_DOC_IDS` 调整为 `TRANSLATED_DOC_IDS`：
  - `payment-faq/account-transfer/account-funds-and-reconciliation`
  - `payment-faq/common-questions/chargeback-fraud-retrieval-orders`
  - `payment-faq/common-questions/high-risk-order-alert-email`
  - `payment-faq/common-questions/ideal-merchant-operation-notes`
  - `payment-faq/common-questions/klarna-consumer-bill-sample`
  - `payment-faq/common-questions/klarna-norway-market-update`
  - `payment-faq/common-questions/uk-klarna-advertising-requirements`
  - `products-services/oceanpayment-products/oceanpayment-recurring-introduction`
  - `payment-faq/info-update/japan-credit-card-security-guidelines-5`
  - `payment-faq/info-update/mastercard-chargeback-assessment-criteria`
  - `payment-faq/info-update/mastercard-chargeback-reason-update`
  - `payment-faq/info-update/visa-vamp-policy`
  - `op-card-faq/terms-conditions/terms-and-conditions`

说明：

- 3 个已确认 English-only 例外页未改动：
  - `payment-faq/account-transfer/opasst-guideline`
  - `payment-faq/common-questions/klarna-apr-range-update-for-consumers`
  - `payment-faq/common-questions/reduce-fraudulent-chargeback-transactions`

### 2. 语言切换错误兜底

问题原因：

- `static/js/language-switcher.js` 中的 `translatedDocIds` 列表未同步新增的中英对应页面，导致中文页切英文时误跳到分区兜底页。

本轮处理：

- 已同步补齐上述 13 个页面到 `translatedDocIds`。

## 抽检结果

- 旧帮助中心附件外链残留：未发现
- 中文页面 404：本轮抽查样本已恢复正常
- 中英语言切换：本轮抽查样本已指向正确英文对应页
- 最终迁移校验：`blockers: 0`

## 当前仍需关注

### 1. 仍按附件页/附件嵌入口径上线的页面

当前源码中仍保留本地附件引用的页面包括：

- `docs/payment-faq/account-transfer/opasst-guideline/index.mdx`
- `docs/payment-faq/account-transfer/account-funds-and-reconciliation/index.mdx`
- `docs/payment-faq/common-questions/high-risk-order-alert-email/index.mdx`
- `docs/payment-faq/common-questions/chargeback-fraud-retrieval-orders/index.mdx`
- `docs/payment-faq/common-questions/uk-klarna-advertising-requirements/index.mdx`
- `docs/payment-faq/common-questions/klarna-consumer-bill-sample/index.mdx`
- `docs/payment-faq/info-update/mastercard-chargeback-assessment-criteria/index.mdx`
- `docs/payment-faq/info-update/mastercard-chargeback-reason-update/index.mdx`
- `docs/payment-faq/info-update/visa-vamp-policy/index.mdx`
- `docs/payment-faq/common-questions/klarna-apr-range-update-for-consumers/index.mdx`
- `docs/payment-faq/common-questions/reduce-fraudulent-chargeback-transactions/index.mdx`

其中：

- `opasst-guideline`
- `klarna-apr-range-update-for-consumers`
- `reduce-fraudulent-chargeback-transactions`

仍按已确认的 English-only 例外口径保留。

### 2. 未下载源文件的页面

- 仍需等待用户补充无下载权限的飞书源文件后，再决定是否从附件页改为正文页。

## 验证结果

- `npm run audit:docs` 通过
- `npm run build` 通过
- `node migration\tools\final-migration-validation.js` 通过
