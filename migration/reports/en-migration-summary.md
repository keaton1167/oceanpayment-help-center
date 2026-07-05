# 英文迁移审核清单

生成时间：2026-07-02T03:48:35.146Z

## 汇总

- 截图内英文文档：41
- 建议可迁入：31
- 需要确认：6
- 跳过/复核避免重复：4
- 源文件缺失：0

## 处理原则

- 英文文档先不直接导入，先以本清单确认目录、slug、顺序。
- 目标路径使用 `i18n/en/docusaurus-plugin-content-docs/current/...`，尽量复用中文已确认的 slug，方便 Docusaurus 识别为同一文档的英文翻译。
- ODPM 操作手册类内容继续跳过本轮迁移，避免和已迁移的英文 ODPM 板块重复。
- 英文截图中存在、但中文本轮未纳入的文档标为 `review`，需要确认是否补中文基准页或接受英文单独处理。

## 按旧英文目录审核

### Account Login FAQs

| 顺序 | 标题 | 动作 | 目标目录 | slug | 备注 |
|---:|---|---|---|---|---|
| 1 | ODPM Digital Platform Guideline | skip-review | i18n/en/docusaurus-plugin-content-docs/current/odpm-guide/section-guide | digital-platform-guidelines-manual | ODPM manual content. English ODPM section already has this migrated; do not duplicate. |
| 2 | Does ODPM support multiple account logins? | migrate | i18n/en/docusaurus-plugin-content-docs/current/customer-service/customer-service-faq | multiple-account-logins | Customer service login FAQ. |
| 3 | I forgot my ODPM login password, how do I reset it? | migrate | i18n/en/docusaurus-plugin-content-docs/current/customer-service/customer-service-faq | reset-oceanpayment-dashboard-password | Customer service login FAQ. |

### Credit Card Acquiring FAQs

| 顺序 | 标题 | 动作 | 目标目录 | slug | 备注 |
|---:|---|---|---|---|---|
| 1 | Visa and MasterCard Refund Processing Rules Update | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions | visa-mastercard-refund-rules-update | Matches migrated Chinese payment FAQ. |
| 2 | Merchant Batch Representment Submission Guide | skip-review | i18n/en/docusaurus-plugin-content-docs/current/odpm-guide/section-guide | - | ODPM/representment operation attachment. Review against existing migrated ODPM manuals before adding. |
| 3 | How to reduce the incidence of fraudulent and chargeback transactions? | review | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions | reduce-fraudulent-chargeback-transactions | English screenshot includes it, but the Chinese counterpart was excluded from this migration because it was not in the confirmed Chinese screenshots. |
| 4 | How to add a blacklist or whitelist in ODPM? | skip-review | i18n/en/docusaurus-plugin-content-docs/current/odpm-guide/section-guide | blacklist-operation-manual; whitelist-operation-manual | ODPM blacklist/whitelist manuals already exist in the migrated English ODPM section. |
| 5 | What should I do with a risky and successful deal? | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions | risky-successful-transaction-handling | Matches migrated Chinese payment FAQ. |
| 6 | The order is intercepted by the risk control to show 10000: Payment is declined, how to deal with it? | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions | payment-declined-10000-risk-control | Matches migrated Chinese payment FAQ. |
| 7 | What currencies are supported by Oceanpayment credit card channel? | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions | credit-card-channel-supported-currencies | Matches migrated Chinese payment FAQ. |
| 8 | Mastercard Chargeback Assessment Criteria | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/info-update | mastercard-chargeback-assessment-criteria | Rule update; place in info update section. |
| 9 | Why do I get high-risk order alert emails? How do I handle it? | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions | high-risk-order-alert-email | Matches migrated Chinese payment FAQ. |
| 10 | What is a Chargeback/Retrieval/Fraud order? How should it be handled? | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions | chargeback-fraud-retrieval-orders | Matches migrated Chinese payment FAQ. |
| 11 | Update on Mastercard Chargeback Reasons | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/info-update | mastercard-chargeback-reason-update | Rule update; place in info update section. |
| 12 | Recurring Payment Introduction | migrate | i18n/en/docusaurus-plugin-content-docs/current/products-services/oceanpayment-products | oceanpayment-recurring-introduction | Product/service introduction. |
| 13 | Implementation of Japan Credit Card Security Guidelines | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/info-update | japan-credit-card-security-guidelines-5 | Rule update; place in info update section. |
| 14 | Visa’s monitoring programs updated-VAMP Enhancements and Retirement of VDMP and VFMP | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/info-update | visa-vamp-policy | Rule update; maps to the migrated Chinese VAMP policy page. |

### Funding Operation FAQs

| 顺序 | 标题 | 动作 | 目标目录 | slug | 备注 |
|---:|---|---|---|---|---|
| 1 | Merchant Final Settlement at Oceanpayment | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions | merchant-fund-settlement-at-oceanpayment | Matches migrated Chinese payment FAQ. |
| 2 | Understanding Currency Conversion in Your Payment and Settlement Process | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions | currency-conversion-in-transaction-settlement | Matches migrated Chinese payment FAQ. |
| 3 | How do I keep track of my account funds and reconcile them? | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/account-transfer | account-funds-and-reconciliation | Account/fund operation FAQ. |
| 4 | How are funds from successful transactions settled? | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/account-transfer | successful-transaction-settlement | Account/fund operation FAQ. |
| 5 | What currencies can Oceanpayment settlement support? | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions | supported-settlement-currencies | Matches migrated Chinese payment FAQ. |
| 6 | OPASST Guideline | review | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/account-transfer | opasst-guideline | Attachment-only guideline. Review whether it should become a page or remain linked from a richer account-transfer article. |
| 7 | Guideline of OPCCOUNT | review | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/account-transfer | opccount-platform-manual | Attachment-only guideline. Do not overwrite the retained OPCCOUNT platform manual without comparing versions. |

### Local Payments Acquiring FAQs

| 顺序 | 标题 | 动作 | 目标目录 | slug | 备注 |
|---:|---|---|---|---|---|
| 1 | Klarna Dispute Lifecycle | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions | klarna-dispute-lifecycle | Matches migrated Chinese payment FAQ. |
| 2 | Klarna Merchant Operations Guide | skip-review | i18n/en/docusaurus-plugin-content-docs/current/odpm-guide/section-guide | klarna-payment-operations-guide | Source is an ODPM Klarna operations attachment. Existing English ODPM section already has a Klarna operation guide. |
| 3 | UK Regulatory Requirements for Advertising Klarna | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions | uk-klarna-advertising-requirements | Matches migrated Chinese payment FAQ. |
| 4 | Klarna Norway Newsletter Update | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions | klarna-norway-market-update | Matches migrated Chinese payment FAQ. |
| 5 | Klarna Dispute Resolution Guideline | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions | klarna-dispute-improvement-guide | Matches migrated Chinese payment FAQ. |
| 6 | Klarna’s APR Range Update for Consumers | review | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions | klarna-apr-range-update-for-consumers | English screenshot includes it, but there is no confirmed Chinese base page yet. Confirm whether to add a Chinese/base doc too. |
| 7 | Klarna Bill Sample on the Customer | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions | klarna-consumer-bill-sample | Matches migrated Chinese payment FAQ. |
| 8 | iDEAL Operational Details For The Merchant Side | migrate | i18n/en/docusaurus-plugin-content-docs/current/payment-faq/common-questions | ideal-merchant-operation-notes | Matches migrated Chinese payment FAQ. |

### OP Card

| 顺序 | 标题 | 动作 | 目标目录 | slug | 备注 |
|---:|---|---|---|---|---|
| 1 | Terms and Conditions | migrate | i18n/en/docusaurus-plugin-content-docs/current/op-card-faq/terms-conditions | terms-and-conditions | OP Card terms page. |

### Products and Services

| 顺序 | 标题 | 动作 | 目标目录 | slug | 备注 |
|---:|---|---|---|---|---|
| 1 | Oceanpayment Introduction of Prohibited Business | migrate | i18n/en/docusaurus-plugin-content-docs/current/compliance-certification/access-compliance | prohibited-and-restricted-businesses | Compliance/access content, not product-service content. |
| 2 | What payment products does Oceanpayment offer? | migrate | i18n/en/docusaurus-plugin-content-docs/current/products-services/oceanpayment-products | available-payment-products | Product/service introduction. |
| 3 | Besides international credit cards, which countries' local payment products does Oceanpayment support? | review | i18n/en/docusaurus-plugin-content-docs/current/products-services/oceanpayment-products | supported-local-payment-products | English screenshot includes it, but the Chinese counterpart was excluded from this migration because it was not in the confirmed Chinese screenshots. |
| 4 | Does Oceanpayment support Mobile payment? | migrate | i18n/en/docusaurus-plugin-content-docs/current/products-services/oceanpayment-products | support-mobile-payment | Product/service introduction. |
| 5 | Can Oceanpayment support Shopify or other website builders? | migrate | i18n/en/docusaurus-plugin-content-docs/current/products-services/oceanpayment-products | support-shopify-or-other-platforms | Product/service introduction. |
| 6 | If I need to activate a new payment method, how do I get the product price to activate it? | migrate | i18n/en/docusaurus-plugin-content-docs/current/products-services/oceanpayment-products | activate-new-payment-method-pricing | Product/service introduction. |
| 7 | Do I need to re-apply when I change to a new domain for promotion? | review | i18n/en/docusaurus-plugin-content-docs/current/products-services/oceanpayment-products | change-domain-reapply-channel | English screenshot includes it, but the Chinese counterpart was excluded from this migration because it was not in the confirmed Chinese screenshots. |
| 8 | Oceanpayment complaints and suggestions contact information | migrate | i18n/en/docusaurus-plugin-content-docs/current/customer-service/customer-service-faq | oceanpayment-complaints-and-suggestions-contact | Customer service contact page. |

