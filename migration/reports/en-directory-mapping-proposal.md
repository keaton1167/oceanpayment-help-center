# 英文旧目录到新目录映射建议

生成时间：2026-07-02

## 结论摘要

英文旧帮助中心共有 6 个旧目录、41 篇截图内文章。英文旧目录没有直接对应当前新目录，因此建议以中文版已校验通过的新目录为基线迁移。

原则：

- 英文文章顺序按用户提供的英文截图顺序。
- 新目录结构按中文版已确认的 10 个新二级目录。
- 能整体迁入的旧目录尽量整体迁入。
- 内容明显跨领域的旧目录建议拆分，避免破坏新信息架构。
- `ODPM后台板块操作指引` 对应内容此前已完成迁移，本轮仍不重复迁移；英文中如有明显 ODPM 操作手册类文章，建议先标记为跳过或与现有 ODPM 英文文档比对后处理。

## 旧目录整体建议

| 英文旧目录 | 截图数量 | 整体建议迁入的新目录 | 是否建议拆分 | 说明 |
|---|---:|---|---|---|
| Account Login FAQs | 3 | 客户服务 / 客户服务常见问题 | 是 | 登录密码、多账号登录属于客户服务；`ODPM Digital Platform Guideline` 属于 ODPM 手册类，建议不随客户服务导入，先与现有 ODPM 文档比对。 |
| Credit Card Acquiring FAQs | 14 | Payment收单常见FAQ / 常见问题 | 是 | 大部分是收单常见问题；其中部分规则更新类建议进入信息更新专区，`Recurring Payment Introduction` 建议进入产品与服务，ODPM 风控操作类需复核是否已迁移。 |
| Funding Operation FAQs | 7 | Payment收单常见FAQ / 账户划款、提现、代付指引 | 是 | 资金追踪、成功交易结算、OPASST、OPCCOUNT 适合账户划款/提现/代付；资金清算、币种换算、结算币种更像 Payment 常见问题。 |
| Local Payments Acquiring FAQs | 8 | Payment收单常见FAQ / 常见问题 | 否 | Klarna、iDEAL 等本地支付收单文章，建议整体放入 Payment 常见问题，并按截图顺序。 |
| OP Card | 1 | OP Card 常见FAQ / 条款和条件 | 否 | `Terms and Conditions` 对应 OP Card 条款和条件。 |
| Products and Services | 8 | 产品与服务 / Oceanpayment产品与服务 | 是 | 产品介绍类整体放产品与服务；禁入行业建议放合规与认证/准入与合规管理；投诉建议联系方式建议放客户服务；更换域名和本地支付产品需与中文版是否补齐一起确认。 |

## 逐篇建议

### Account Login FAQs

| 顺序 | 英文标题 | 建议新目录 | 建议动作 |
|---:|---|---|---|
| 1 | ODPM Digital Platform Guideline | ODPM账户后台操作指引 / 板块操作指引 | 暂不导入，先与已迁移 ODPM 英文文档比对，避免重复。 |
| 2 | Does ODPM support multiple account logins? | 客户服务 / 客户服务常见问题 | 导入。 |
| 3 | I forgot my ODPM login password, how do I reset it? | 客户服务 / 客户服务常见问题 | 导入。 |

### Credit Card Acquiring FAQs

| 顺序 | 英文标题 | 建议新目录 | 建议动作 |
|---:|---|---|---|
| 1 | Visa and MasterCard Refund Processing Rules Update | Payment收单常见FAQ / 常见问题 | 导入。 |
| 2 | Merchant Batch Representment Submission Guide | ODPM账户后台操作指引 / 板块操作指引 | 暂不导入，疑似 ODPM 操作指引/申诉批量操作，先比对已迁移内容。 |
| 3 | How to reduce the incidence of fraudulent and chargeback transactions? | Payment收单常见FAQ / 常见问题 | 截图内存在，建议导入；中文版同名旧文档本轮未迁入，需确认是否接受英文有对应页面。 |
| 4 | How to add a blacklist or whitelist in ODPM? | ODPM账户后台操作指引 / 板块操作指引 | 暂不导入，疑似 ODPM 黑白名单操作，先比对已迁移内容。 |
| 5 | What should I do with a risky and successful deal? | Payment收单常见FAQ / 常见问题 | 导入。 |
| 6 | The order is intercepted by the risk control to show 10000: Payment is declined, how to deal with it? | Payment收单常见FAQ / 常见问题 | 导入。 |
| 7 | What currencies are supported by Oceanpayment credit card channel? | Payment收单常见FAQ / 常见问题 | 导入。 |
| 8 | Mastercard Chargeback Assessment Criteria | Payment收单常见FAQ / 信息更新专区 | 导入。 |
| 9 | Why do I get high-risk order alert emails? How do I handle it? | Payment收单常见FAQ / 常见问题 | 导入。 |
| 10 | What is a Chargeback/Retrieval/Fraud order? How should it be handled? | Payment收单常见FAQ / 常见问题 | 导入。 |
| 11 | Update on Mastercard Chargeback Reasons | Payment收单常见FAQ / 信息更新专区 | 导入。 |
| 12 | Recurring Payment Introduction | 产品与服务 / Oceanpayment产品与服务 | 导入。 |
| 13 | Implementation of Japan Credit Card Security Guidelines | Payment收单常见FAQ / 信息更新专区 | 导入。 |
| 14 | Visa’s monitoring programs updated-VAMP Enhancements and Retirement of VDMP and VFMP | Payment收单常见FAQ / 信息更新专区 | 导入。 |

### Funding Operation FAQs

| 顺序 | 英文标题 | 建议新目录 | 建议动作 |
|---:|---|---|---|
| 1 | Merchant Final Settlement at Oceanpayment | Payment收单常见FAQ / 常见问题 | 导入。 |
| 2 | Understanding Currency Conversion in Your Payment and Settlement Process | Payment收单常见FAQ / 常见问题 | 导入。 |
| 3 | How do I keep track of my account funds and reconcile them? | Payment收单常见FAQ / 账户划款、提现、代付指引 | 导入。 |
| 4 | How are funds from successful transactions settled? | Payment收单常见FAQ / 账户划款、提现、代付指引 | 导入。 |
| 5 | What currencies can Oceanpayment settlement support? | Payment收单常见FAQ / 常见问题 | 导入。 |
| 6 | OPASST Guideline | Payment收单常见FAQ / 账户划款、提现、代付指引 | 截图内存在，建议导入或与现有中文 `成功交易资金如何进行结算？` 中附件关系复核。 |
| 7 | Guideline of OPCCOUNT | Payment收单常见FAQ / 账户划款、提现、代付指引 | 建议与现有 `OPCCOUNT平台操作手册-2026-4-23` 英文/中文完整文档比对，避免导入旧版或低质量版本。 |

### Local Payments Acquiring FAQs

| 顺序 | 英文标题 | 建议新目录 | 建议动作 |
|---:|---|---|---|
| 1 | Klarna Dispute Lifecycle | Payment收单常见FAQ / 常见问题 | 导入。 |
| 2 | Klarna Merchant Operations Guide | Payment收单常见FAQ / 常见问题 | 导入。 |
| 3 | UK Regulatory Requirements for Advertising Klarna | Payment收单常见FAQ / 常见问题 | 导入。 |
| 4 | Klarna Norway Newsletter Update | Payment收单常见FAQ / 常见问题 | 导入。 |
| 5 | Klarna Dispute Resolution Guideline | Payment收单常见FAQ / 常见问题 | 导入。 |
| 6 | Klarna’s APR Range Update for Consumers | Payment收单常见FAQ / 常见问题 | 导入。 |
| 7 | Klarna Bill Sample on the Customer | Payment收单常见FAQ / 常见问题 | 导入。 |
| 8 | iDEAL Operational Details For The Merchant Side | Payment收单常见FAQ / 常见问题 | 导入。 |

### OP Card

| 顺序 | 英文标题 | 建议新目录 | 建议动作 |
|---:|---|---|---|
| 1 | Terms and Conditions | OP Card 常见FAQ / 条款和条件 | 导入。 |

### Products and Services

| 顺序 | 英文标题 | 建议新目录 | 建议动作 |
|---:|---|---|---|
| 1 | Oceanpayment Introduction of Prohibited Business | 合规与认证 / 准入与合规管理 | 建议导入到合规，不建议放产品与服务。 |
| 2 | What payment products does Oceanpayment offer? | 产品与服务 / Oceanpayment产品与服务 | 导入。 |
| 3 | Besides international credit cards, which countries' local payment products does Oceanpayment support? | 产品与服务 / Oceanpayment产品与服务 | 截图内存在，建议导入；中文版同名旧文档本轮未迁入，需确认是否补齐中文或接受英文有对应页面。 |
| 4 | Does Oceanpayment support Mobile payment? | 产品与服务 / Oceanpayment产品与服务 | 导入。 |
| 5 | Can Oceanpayment support Shopify or other website builders? | 产品与服务 / Oceanpayment产品与服务 | 导入。 |
| 6 | If I need to activate a new payment method, how do I get the product price to activate it? | 产品与服务 / Oceanpayment产品与服务 | 导入。 |
| 7 | Do I need to re-apply when I change to a new domain for promotion? | 产品与服务 / Oceanpayment产品与服务 | 截图内存在，建议导入；中文版同名旧文档本轮未迁入，需确认是否补齐中文或接受英文有对应页面。 |
| 8 | Oceanpayment complaints and suggestions contact information | 客户服务 / 客户服务常见问题 | 建议导入到客户服务，不建议放产品与服务。 |

## 需要用户确认的关键点

- 英文截图里包含 3 篇中文本轮未迁入或未归类文章：`Besides international credit cards...`、`Do I need to re-apply...`、`How to reduce...`。如果英文要按截图完整迁移，建议同步决定中文是否补齐，避免中英文页面数量不一致。
- ODPM 操作类英文文章建议先跳过并比对本地已迁移 ODPM 文档，包括 `ODPM Digital Platform Guideline`、`Merchant Batch Representment Submission Guide`、`How to add a blacklist or whitelist in ODPM?`。
- `Guideline of OPCCOUNT` 建议不要直接覆盖当前已保留的 `OPCCOUNT平台操作手册-2026-4-23` 逻辑，需先判断英文是否是新版完整手册。
