# 中文站 XML 差异复核记录

生成时间：2026-07-06

## 复核目标

按旧帮助中心 `migration/input/WordPress.2026-07-01.xml` 的中文标题与正文口径，核对当前中文站是否仍存在英文残留或明显偏离旧站的问题，并区分：

- 必须回归旧站口径
- 已确认可保留的升级差异

## 本轮已修复的 XML 偏差

以下页面在中文站中原先存在英文标题、英文正文或英文说明，已按 XML 与 `migration/output/zh` 的中文口径修复：

- `docs/payment-faq/account-transfer/account-funds-and-reconciliation/index.mdx`
  - XML 标题：`如何掌握账户资金动态并进行对账？`
  - 修复内容：标题改回中文，正文首句改回“详细说明请参考文档”

- `docs/payment-faq/common-questions/high-risk-order-alert-email/index.mdx`
  - XML 标题：`为什么会收到高风险订单警报邮件？如何处理？`
  - 修复内容：标题改回中文，正文首句改回“关于高风险订单警报邮件的详情请查看下方指引”

- `docs/payment-faq/common-questions/klarna-consumer-bill-sample/index.mdx`
  - XML 标题：`Klarna消费者端账单展示`
  - 修复内容：标题改回中文

- `docs/payment-faq/info-update/mastercard-chargeback-assessment-criteria/index.mdx`
  - XML 标题：`Mastercard 拒付考核标准`
  - 修复内容：标题改回中文

- `docs/payment-faq/info-update/mastercard-chargeback-reason-update/index.mdx`
  - XML 标题：`Mastercard 拒付原因更新`
  - 修复内容：标题改回中文，正文改回 XML 中的中文说明

- `docs/payment-faq/info-update/visa-vamp-policy/index.mdx`
  - XML 标题：`Visa拒付管控政策（VAMP）`
  - 修复内容：标题改回中文，正文改回 XML 中的中文说明

## 复核后确认可保留的升级差异

### 1. 用户已确认不按旧标题回归

- `docs/op-card-faq/terms-conditions/terms-and-conditions/index.mdx`
  - XML 标题：`Terms and Conditions条款`
  - 当前标题：`Oceanpayment 卡条款和条件`
  - 口径：按用户明确要求，不回归旧标题

### 2. 正文从“附件入口”升级为飞书正文

以下页面在 XML 中原本仅为附件链接或简短入口，当前已升级为更完整的正文展示，属于允许保留的内容升级：

- `docs/payment-faq/common-questions/afterpay-shopify-plugin-installation/index.mdx`
- `docs/payment-faq/common-questions/ideal-merchant-operation-notes/index.mdx`
- `docs/payment-faq/common-questions/klarna-norway-market-update/index.mdx`
- `docs/products-services/oceanpayment-products/oceanpayment-recurring-introduction/index.mdx`
- `docs/payment-faq/common-questions/visa-vamp-program/index.mdx`
- `docs/payment-faq/info-update/japan-credit-card-security-guidelines-5/index.mdx`
- `docs/op-card-faq/terms-conditions/terms-and-conditions/index.mdx`

### 3. English-only 例外页

以下页面当前仍按既定口径保留为 English-only，不纳入中文回归范围：

- `docs/payment-faq/account-transfer/opasst-guideline/index.mdx`
- `docs/payment-faq/common-questions/klarna-apr-range-update-for-consumers/index.mdx`
- `docs/payment-faq/common-questions/reduce-fraudulent-chargeback-transactions/index.mdx`

## 本轮复核结论

- 本轮发现并修复的“中文站英文残留/偏离 XML 中文口径”页面：`6` 篇
- 当前已确认可保留的升级差异：
  - `OP Card 条款和条件` 标题升级：`1` 篇
  - 附件页升级为正文：`7` 篇
  - English-only 例外页：`3` 篇

除以上已确认项外，本轮未再发现需要立即回归 XML 中文口径的明显英文残留页面。

## 验证结果

- `npm run audit:docs` 通过
- `npm run build` 通过
- `node migration\tools\final-migration-validation.js` 通过
- `Final validation blockers: 0`
