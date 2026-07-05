# 语言切换规则与验证

生成时间：2026-07-02

## 规则

- 有精确译文：切换到同 docId 的对应语言文章。
- 无精确译文但有对应目录：切换到对应目录首篇文章。
- 无对应目录：切换到对应语言首页。
- 无精确译文时，在语言下拉链接上添加 `title` 提示。

## 验证结果

- 英文已对齐文章：
  - 当前：`/en/docs/payment-faq/common-questions/visa-mastercard-refund-rules-update`
  - 中文：`/docs/payment-faq/common-questions/visa-mastercard-refund-rules-update`
  - 英文：`/en/docs/payment-faq/common-questions/visa-mastercard-refund-rules-update`

- 中文-only 文章：
  - 当前：`/docs/payment-faq/common-questions/afterpay-limit-introduction`
  - 英文兜底：`/en/docs/payment-faq/common-questions/visa-mastercard-refund-rules-update`
  - 提示：`No exact English version yet; opens the related help section.`

- 英文-only ODPM 文章：
  - 当前：`/en/docs/odpm-guide/section-guide/blacklist-operation-manual`
  - 中文兜底：`/docs/odpm-guide/section-guide/account-application-guide`
  - 提示：`暂无精确中文版本，将打开对应帮助目录。`

## 构建验证

- `npm.cmd run build` 通过。
- 中英文构建页面均已加载 `js/language-switcher.js?v=20260702-1`。
- `images/?code` 破图扫描为 0。
