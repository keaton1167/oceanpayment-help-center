# 带旧站附件外链文档下线记录

生成时间：2026-07-02

> 口径更新：英文版本带旧站附件外链的文档已按新决策恢复上线。本文档仅保留上一轮“暂不上线”处理记录；英文恢复结果以 `migration/reports/en-attachment-docs-restored.md` 和 `migration/reports/final-migration-validation.md` 为准。

## 处理口径

- 本次迁移中，仍直接引用 `support.oceanpayment.com/.../wp-content/uploads/...` 旧站附件外链的文档暂不上线。
- 迁移旧帮助中心之前已经存在、且已经把外部附件转换为正文形式的中英文文档不处理。
- 截图中的 `Guidelines for Plate Operations` / ODPM 操作手册类文档不在本次删除范围。
- 附件本地备份和审核清单继续保留，后续确认后可以逐篇转成正文文档再恢复上线。

## 汇总

- 受影响 doc id：28
- 删除 MDX 文件：47
- 其中中文基准页存在旧站附件外链：26
- 其中仅英文译文存在旧站附件外链：2
- 因中文基准页下线而同步下线的英文译文：3

## 本次暂不上线的文档

| Doc ID | 处理范围 | 原因 |
|---|---|---|
| `compliance-certification/enterprise-certification-faq/enterprise-certification-materials` | 中文 | 中文基准页仍为旧站附件外链 |
| `customer-service/customer-service-faq/multiple-account-logins` | 中文、英文 | 中文基准页仍为旧站附件外链，英文译文同步下线 |
| `op-card-faq/common-questions/iam-opccount-global-account-application-guide` | 中文 | 中文基准页仍为旧站附件外链 |
| `op-card-faq/common-questions/op-card-application-materials` | 中文 | 中文基准页仍为旧站附件外链 |
| `op-card-faq/common-questions/opcard-operation-guide` | 中文 | 中文基准页仍为旧站附件外链 |
| `op-card-faq/common-questions/op-card-prohibited-industries` | 中文 | 中文基准页仍为旧站附件外链 |
| `op-card-faq/terms-conditions/terms-and-conditions` | 中文、英文 | 中英文均仍为旧站附件外链 |
| `payment-faq/account-transfer/account-funds-and-reconciliation` | 中文、英文 | 中英文均仍为旧站附件外链 |
| `payment-faq/account-transfer/opasst-guideline` | 中文、英文 | 中英文均仍为旧站附件外链 |
| `payment-faq/account-transfer/successful-transaction-settlement` | 中文、英文 | 中文基准页仍为旧站附件外链，英文译文同步下线 |
| `payment-faq/common-questions/afterpay-shopify-plugin-installation` | 中文 | 中文基准页仍为旧站附件外链 |
| `payment-faq/common-questions/chargeback-fraud-retrieval-orders` | 中文、英文 | 中英文均仍为旧站附件外链 |
| `payment-faq/common-questions/high-risk-order-alert-email` | 中文、英文 | 中英文均仍为旧站附件外链 |
| `payment-faq/common-questions/ideal-merchant-operation-notes` | 中文、英文 | 中英文均仍为旧站附件外链 |
| `payment-faq/common-questions/klarna-apr-range-update-for-consumers` | 中文、英文 | 中英文均仍为旧站附件外链 |
| `payment-faq/common-questions/klarna-consumer-bill-sample` | 中文、英文 | 中英文均仍为旧站附件外链 |
| `payment-faq/common-questions/klarna-dispute-improvement-guide` | 英文 | 仅英文译文仍为旧站附件外链，中文正文保留 |
| `payment-faq/common-questions/klarna-norway-market-update` | 中文、英文 | 中英文均仍为旧站附件外链 |
| `payment-faq/common-questions/payment-declined-10000-risk-control` | 中文、英文 | 中文基准页仍为旧站附件外链，英文译文同步下线 |
| `payment-faq/common-questions/reduce-fraudulent-chargeback-transactions` | 中文、英文 | 中英文均仍为旧站附件外链 |
| `payment-faq/common-questions/uk-klarna-advertising-requirements` | 中文、英文 | 中英文均仍为旧站附件外链 |
| `payment-faq/info-update/bulk-address-fraud-attack` | 中文 | 中文基准页仍为旧站附件外链 |
| `payment-faq/info-update/japan-credit-card-security-guidelines-5` | 中文、英文 | 中英文均仍为旧站附件外链 |
| `payment-faq/info-update/mastercard-chargeback-assessment-criteria` | 中文、英文 | 中英文均仍为旧站附件外链 |
| `payment-faq/info-update/mastercard-chargeback-reason-update` | 中文、英文 | 中英文均仍为旧站附件外链 |
| `payment-faq/info-update/visa-vamp-policy` | 中文、英文 | 中英文均仍为旧站附件外链 |
| `products-services/oceanpayment-products/oceanpayment-recurring-introduction` | 中文、英文 | 中英文均仍为旧站附件外链 |
| `compliance-certification/access-compliance/prohibited-and-restricted-businesses` | 英文 | 仅英文译文仍为旧站附件外链，中文正文保留 |

## 后续恢复规则

后续如果运营确认某个附件内容需要上线，建议不要恢复旧站附件外链，而是按以下顺序处理：

1. 使用本地备份附件作为内容来源。
2. 将附件内容整理为 MDX 正文页面。
3. 重新放回对应新目录。
4. 再加入英文 include / language switcher 对齐清单。
