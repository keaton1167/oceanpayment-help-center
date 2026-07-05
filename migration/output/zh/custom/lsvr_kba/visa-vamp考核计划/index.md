---
title: "Visa VAMP考核计划"
date: 2025-12-29
---

### **什么是VAMP**

VAMP全称Visa Acquirer Monitoring Program，是Visa制定的一套标准，用于控制商户和收单行的欺诈交易行为。该标准适用于CNP（Card-Not-Present）交易，包括本地交易和跨境交易，即Oceanpayment商户的所有线上交易均适用。

### **VAMP更新内容**

1. 自2025年3月31日起，Visa将终止Visa原来的拒付监控计划（VDMP）和伪冒监控计划（VFMP）。
2. 自2024年3月31日起，Visa 已经终止Visa Digital Goods Merchant Fraud Monitoring Program。（适用于虚拟行业的VFMP已终止）
3. 自2025年4月1日起， Visa启用增强的Visa收单机构监控计划（VAMP）。
4. 2025年6月1日，Visa再次更新了VAMP的考核标准。

- 收单行层面，VAMP的考核标准调高为0.5%-0.7%。
- 收单行层面，当TC40和TC15总计超过1500笔才触发VAMP考核标准。
- 2025年10月1日：被判定为Excessive的收单行或商户开始收取罚金。
- 2026年1月1日：被判定为Standard的收单行或商户开始收取罚金。
- 2026年4月1日：NA/EU/ASIAPAC地区在商户层面的Excessive阈值从2.2%下降至1.5%。

### ****Visa历史的考核规则介绍****

VDMP

| **级别** | **VDMP** |
| --- | --- |
| Level 1（Early Warning ） | 0.65% and 75 chargebacks |
| Level 2（Standard Program ） | 0.9% and 100 chargebacks |
| Level 3（Excessive Program ） | 1.8% and 1000 chargebacks |

VFMP

| **级别** | **VFMP** |
| --- | --- |
| Level 1（Early Warning ） | 0.65% and USD50,000 |
| Level 2（Standard Program ） | 0.9% and USD75,000 |
| Level 3（Excessive Program ） | 1.8% and USD250,000 |

VAMP

VAMP Chargeback for Card-Not-Present

| **级别** | **VAMP 2021.10.1之前** | **VAMP 2021.10.1之后** |
| --- | --- | --- |
| Level 1（Early Warning） | 0.45% and 375 chargebacks | 0.5% and 375 chargebacks |
| Level 2（Standard Program） | 0.75% and 750 chargebacks | 1% and 750 chargebacks |

VAMP Fraud for CNP

| **级别** | **VAMP 2021.10.1之前** | **VAMP 2021.10.1之后** |
| --- | --- | --- |
| Level 1（Early Warning） | 0.45% and USD250,000 | 0.5% and USD250,000 |
| Level 2（Standard Program） | 0.75% and USD500,000 | 1% and USD500,000 |

### ****VAMP**** ****计算规则****

计算公式：VAMP= \[Count of Reported Fraud (TC 40) + Count of Processed Disputes (TC 15)\] / Count of Total Settled Transactions (TC 05)

公式含义：\[欺诈交易笔数 (TC40) + 争议交易笔数 (TC15)\] / 成功交易总笔数（TC05）

- TC40（伪冒笔数）：Visa的伪冒交易，即发卡行向Visa报告的欺诈伪冒交易数据。
- TC15（拒付笔数）：Visa拒付原因分类为10，11，12和13的拒付订单，也就是Visa全部拒付。（具体原因分类见下表）

| 10.Fruad | 11\. Authorization | 12\. Processing Errors | 13\. Consumer Disputes |
| --- | --- | --- | --- |
| 10.1 EMV Liability Shift Counterfeit Fraud   10.2 EMV Liability Shift Non-Counterfeit Fraud   10.3 Other Fraud-Card Present Environment   10.4 Other Fraud-Card Absent Environment   10.5 Visa Fraud Monitoring Program | 11.1 Card Recovery Bulletin   11.2 Declined Authorization   11.3 No Authorization | 12.1 Late Presentment   12.2 Incorrect Transaction Code   12.3 Incorrect Currency   12.4 Incorrect Account Number   12.5 Incorrect Amount   12.6 Duplicate Processing/Paid by Other Means   12.7 Invalid Data | 13.1 Merchandise/Services Not Received   13.2 Cancelled Recurring   13.3 Not as Described or Defective Merchandise/Services   13.4 Counterfeit Merchandise   13.5 Misrepresentation   13.6 Credit Not Processed   13.7 Cancelled Merchandise/Services   13.8 Original Credit Transaction Not Accepted   13.9 Non-Receipt of Cash or Load Transaction Value |

- TC05（成功笔数）：Visa的成功交易。
- 收单行层面，当TC40和TC15总计超过1500笔才触发VAMP考核。
- 统计时间维度：数据按照自然月进行统计，当月的VAMP数据会在次月出具。举例：3月的VAMP数据会在4月初统计完成并通知，统计范围为3月自然月内发生的TC40、TC15、TC05数据，其他月份以此类推。

### **VAMP **枚举攻击行为评估****

同TC40和TC15的交易计算，商户的枚举攻击行为Enumeration同样会被计入VAMP的评估。

计算公式：VAMP Enumeration= confirmed enumerated authorisation transactions (approved + declined) / authorisation transactions(approved + declined)

公式含义：VAMP Enumeration= 识别为枚举攻击行为的授权笔数（成功+失败）/ 授权总笔数（成功+失败）

- confirmed enumerated authorisation transactions (approved + declined)：被VAAI标记的交易，成功交易和失败交易都会被统计
- authorisation transactions(approved + declined)：成功交易和失败交易都会被统计
- 按自然月进行统计

| VAMP Enumeration Ratio | 商户 |
| --- | --- |
| 阶段 | Excessive |
| 2025.04.01起生效 | ≥20% & 300000笔 enumerated authorisation transactions |

### **VAMP豁免场景**

VAMP目的是为了减少交易欺诈和拒付，以提高持卡人交易的安全性。商户可以通过以下途径降低VAMP率：

- 申请RDR服务。使用RDR服务可以对满足条件的TC15拒付订单自动退款，当拒付订单被解决时，该笔拒付不计入TC15的数据统计，因此这部分交易不计入VAMP考核。
- 按照CE3.0的建议对欺诈订单提交申诉。按照Compelling Evidence 3.0建议，申诉成功的订单不计入TC40欺诈订单统计，因此这部分交易不计入VAMP考核。
