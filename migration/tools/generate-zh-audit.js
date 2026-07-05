const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const XML_PATH = path.join(ROOT, 'migration', 'input', 'WordPress.2026-07-01.xml');
const MARKDOWN_ROOT = path.join(ROOT, 'migration', 'output', 'zh', 'custom', 'lsvr_kba');
const REPORT_DIR = path.join(ROOT, 'migration', 'reports');

const CATEGORY_MAP = {
  'Oceanpayment产品与服务': {
    target: 'docs/products-services/oceanpayment-products',
    action: 'migrate',
  },
  'Payment收单信息更新专区': {
    target: 'docs/payment-faq/info-update',
    action: 'migrate',
  },
  'Payment收单常见问题': {
    target: 'docs/payment-faq/common-questions',
    action: 'migrate',
  },
  '账户划款、提现、代付指引': {
    target: 'docs/payment-faq/account-transfer',
    action: 'migrate',
  },
  'OP Card常见问题': {
    target: 'docs/op-card-faq/common-questions',
    action: 'migrate',
  },
  'OP Card条款和条件': {
    target: 'docs/op-card-faq/terms-conditions',
    action: 'migrate',
  },
  'OPCard 支持Google Pay FAQ': {
    target: 'docs/op-card-faq/google-pay-faq',
    action: 'migrate',
  },
  '企业认证常见问题1': {
    target: 'docs/compliance-certification/enterprise-certification-faq',
    action: 'migrate',
  },
  '准入与合规管理': {
    target: 'docs/compliance-certification/access-compliance',
    action: 'migrate',
  },
  '客户服务常见问题': {
    target: 'docs/customer-service/customer-service-faq',
    action: 'migrate',
  },
  'ODPM后台板块操作指引': {
    target: 'docs/odpm-guide/section-guide',
    action: 'skip',
    reason: 'ODPM content already migrated',
  },
};

const TARGET_OVERRIDE_BY_TITLE = {
  '手机丢失或被盗后该怎么办？': 'docs/op-card-faq/google-pay-faq',
  '如何暂停或注销我的卡片？': 'docs/op-card-faq/google-pay-faq',
};

const SCREENSHOT_ORDER = {
  'docs/products-services/oceanpayment-products': [
    'Oceanpayment Recurring知识介绍',
    '如需开通新的支付方式，如何获取产品价格进行开通？',
    'Oceanpayment是否可以支持Shopify或其他建站平台？',
    'Oceanpayment是否支持Mobile端的支付？',
    'Oceanpayment可以提供哪些支付产品？',
  ],
  'docs/op-card-faq/google-pay-faq': [
    '使用 Google Pay 是否会产生额外费用？',
    '使用 Google Pay 是否安全？',
    '为什么无法绑定 OPCard 到 Google Wallet？',
    '使用 Google Pay 需要满足什么条件？',
    '使用 Google Pay 是否需要实体卡？',
    '是否可以在海外使用？',
    'OPCard 支持哪些支付场景？',
    '如何将 OPCard 添加到 Google Wallet？',
    'OPCard 是否支持 Google Pay？',
    '手机丢失或被盗后该怎么办？',
    '如何暂停或注销我的卡片？',
  ],
  'docs/customer-service/customer-service-faq': [
    'Oceanpayment投诉与建议的联系方式？',
    '忘了Oceanpayment账户后台登陆密码，该如何重置密码？',
    'Oceanpayment的账户后台，支持多账户登陆吗？',
  ],
  'docs/payment-faq/account-transfer': [
    'OPCCOUNT操作教程',
    '成功交易资金如何进行结算？',
    '如何掌握账户资金动态并进行对账？',
  ],
  'docs/payment-faq/info-update': [
    'Trustly PIS支付发起服务退出西班牙市场',
    '日本《产品安全四法》修订：对日本市场商户的影响',
    '批量地址欺诈攻击分享',
    'Mastercard 拒付原因更新',
    'Mastercard 拒付考核标准',
    '日本发布《信用卡安全指南5.0》新规定',
    'Visa拒付管控政策（VAMP）',
  ],
  'docs/payment-faq/common-questions': [
    '商户在Oceanpayment的资金清算',
    '交易/结算流程中的币种换算说明',
    'Klarna 争议生命周期介绍',
    'Visa、MasterCard退款处理规则更新',
    '受管控国家、地区与交易币种清单',
    'Bancontact品牌升级的相关事宜',
    'MasterCard 潜在欺诈商户管控规则介绍',
    'Afterpay 限额介绍',
    'Visa VIRP规则介绍',
    'Visa VAMP考核计划',
    'Klarna消费者端账单展示',
    'Afterpay针对Shopify网站的支付插件安装介绍',
    'iDEAL商户运营端注意事项',
    'Klarna挪威市场更新',
    'Klarna争议改善指南',
    '英国对 Klarna 广告的监管要求',
    '什么是拒付/伪冒/调单订单？该如何处理？',
    '为什么会收到高风险订单警报邮件？如何处理？',
    'Oceanpayment信用卡通道支持哪些币种？',
    '有风险的成功交易应该怎么处理？',
    '订单被风控拦截显示10000：Payment is declined，该如何处理？',
    'Oceanpayment可以支持哪些结算币种？',
  ],
  'docs/op-card-faq/common-questions': [
    'IAM申请OPCCOUNT全球账户业务操作手册',
    '交易金额限制生效规则',
    'OP Card限额是多少？',
    'OP Card是什么？',
    '单币卡是什么？',
    '悦享卡是什么？',
    '为什么我的账户申请被拒绝？',
    '谁可以在OP开设发卡账户？',
    '在一个公司实体下可以创建的卡片数量是否有限制？',
    '我可以将现有发卡帐户转移到不同的公司实体上吗？',
    '我注册之后是否能够更改企业信息？',
    '谁会默认成为虚拟卡管理人？虚拟卡管理人可以做什么？',
    '企业账号实名认证后，营业执照过期/法定代表人变更/注销是否有影响？',
    'OP虚拟卡不支持哪些业务和行业？',
    '发现交易金额有异常或者有争议订单怎么办？',
    '我什么时候可以开始交易？',
    '可以进行卡转账或提现吗？',
    '付款支持哪些币种？',
    '为什么我的卡支付失败？',
    '为什么我的卡被暂停了？',
    '我可以在交易处理中时停止或取消卡交易吗？',
    '为什么卡片被冻结或卡片注销后，交易仍然成功了？',
    '什么叫币种叠加换汇？',
    '如何提出拒付？',
    '受理中的拒付资金怎么处理',
    '实际扣款金额与处理中金额有可能会不同吗？',
    '怎么创建卡片？',
    '如何新增卡？',
    '怎么查看卡信息？',
    '什么是我的可用余额？如何增加可用额度？',
    '如何更改自己设定的虚拟卡的交易限额？',
    '什么是卡冻结？',
    '怎么进行卡注销？卡注销后资金怎么处理？',
    'OPcard有效期是多久？',
    '已注销的卡可以收到退款么？',
    '卡被盗了怎么办？',
    '单笔卡交易限额',
    '发卡账户一天可以提额几次',
    '发卡账户增额的限制',
    '我的费用结算时间是什么时候？',
    '如何查看我被收取的所有费用？',
    '如何创建企业卡？',
    '什么是企业卡卡片联系人？',
    '谁会默认成为企业卡卡片联系人？',
    '卡片联系人可以做什么？',
    '谁可以指定企业卡卡片联系人？',
    '可以指定谁作为企业卡卡片联系人？',
    '可以为每张企业卡指定几位卡片联系人？',
    '什么是处理中的卡交易？',
    '交易会保持处理中多久？',
    '什么是已撤销的卡交易？',
    '为什么卡片被冻结/取消后，交易仍然成功了？',
    '如何保护自己免遭诈骗和卡片欺诈',
    '如果我的多张卡片上都发生了欺诈怎么办？',
    'OPCard操作教程',
    'OP Card禁入行业清单',
    'OP Card业务申请资料说明',
    'Oceanpayment Card价格',
  ],
  'docs/compliance-certification/enterprise-certification-faq': ['企业认证资料说明'],
  'docs/compliance-certification/access-compliance': ['Oceanpayment禁止和受限接入的行业'],
  'docs/op-card-faq/terms-conditions': ['Terms and Conditions条款'],
};

const SLUG_OVERRIDES = {
  'Oceanpayment Recurring知识介绍': 'oceanpayment-recurring-introduction',
  '如需开通新的支付方式，如何获取产品价格进行开通？': 'activate-new-payment-method-pricing',
  'Oceanpayment是否可以支持Shopify或其他建站平台？': 'support-shopify-or-other-platforms',
  'Oceanpayment是否支持Mobile端的支付？': 'support-mobile-payment',
  'Oceanpayment可以提供哪些支付产品？': 'available-payment-products',
  '使用 Google Pay 是否会产生额外费用？': 'google-pay-extra-fees',
  '使用 Google Pay 是否安全？': 'google-pay-security',
  '为什么无法绑定 OPCard 到 Google Wallet？': 'cannot-bind-opcard-to-google-wallet',
  '使用 Google Pay 需要满足什么条件？': 'google-pay-requirements',
  '使用 Google Pay 是否需要实体卡？': 'google-pay-physical-card',
  '是否可以在海外使用？': 'google-pay-overseas-use',
  'OPCard 支持哪些支付场景？': 'opcard-google-pay-scenarios',
  '如何将 OPCard 添加到 Google Wallet？': 'add-opcard-to-google-wallet',
  'OPCard 是否支持 Google Pay？': 'opcard-google-pay-support',
  '手机丢失或被盗后该怎么办？': 'lost-or-stolen-phone-google-pay',
  '如何暂停或注销我的卡片？': 'suspend-or-cancel-card',
  'Oceanpayment投诉与建议的联系方式？': 'oceanpayment-complaints-and-suggestions-contact',
  '忘了Oceanpayment账户后台登陆密码，该如何重置密码？': 'reset-oceanpayment-dashboard-password',
  'Oceanpayment的账户后台，支持多账户登陆吗？': 'multiple-account-logins',
  'OPCCOUNT操作教程': 'opccount-operation-guide',
  '成功交易资金如何进行结算？': 'successful-transaction-settlement',
  '如何掌握账户资金动态并进行对账？': 'account-funds-and-reconciliation',
  'Trustly PIS支付发起服务退出西班牙市场': 'trustly-pis-exits-spain',
  '日本《产品安全四法》修订：对日本市场商户的影响': 'japan-product-safety-laws-update',
  '批量地址欺诈攻击分享': 'bulk-address-fraud-attack',
  'Mastercard 拒付原因更新': 'mastercard-chargeback-reason-update',
  'Mastercard 拒付考核标准': 'mastercard-chargeback-assessment-criteria',
  '日本发布《信用卡安全指南5.0》新规定': 'japan-credit-card-security-guidelines-5',
  'Visa拒付管控政策（VAMP）': 'visa-vamp-policy',
  '商户在Oceanpayment的资金清算': 'merchant-fund-settlement-at-oceanpayment',
  '交易/结算流程中的币种换算说明': 'currency-conversion-in-transaction-settlement',
  'Klarna 争议生命周期介绍': 'klarna-dispute-lifecycle',
  'Visa、MasterCard退款处理规则更新': 'visa-mastercard-refund-rules-update',
  '受管控国家、地区与交易币种清单': 'restricted-countries-regions-currencies',
  'Bancontact品牌升级的相关事宜': 'bancontact-brand-upgrade',
  'MasterCard 潜在欺诈商户管控规则介绍': 'mastercard-potential-scam-merchant-monitoring',
  'Afterpay 限额介绍': 'afterpay-limit-introduction',
  'Visa VIRP规则介绍': 'visa-virp-rules',
  'Visa VAMP考核计划': 'visa-vamp-program',
  'Klarna消费者端账单展示': 'klarna-consumer-bill-sample',
  'Afterpay针对Shopify网站的支付插件安装介绍': 'afterpay-shopify-plugin-installation',
  'iDEAL商户运营端注意事项': 'ideal-merchant-operation-notes',
  'Klarna挪威市场更新': 'klarna-norway-market-update',
  'Klarna争议改善指南': 'klarna-dispute-improvement-guide',
  '英国对 Klarna 广告的监管要求': 'uk-klarna-advertising-requirements',
  '什么是拒付/伪冒/调单订单？该如何处理？': 'chargeback-fraud-retrieval-orders',
  '为什么会收到高风险订单警报邮件？如何处理？': 'high-risk-order-alert-email',
  'Oceanpayment信用卡通道支持哪些币种？': 'credit-card-channel-supported-currencies',
  '有风险的成功交易应该怎么处理？': 'risky-successful-transaction-handling',
  '订单被风控拦截显示10000：Payment is declined，该如何处理？': 'payment-declined-10000-risk-control',
  'Oceanpayment可以支持哪些结算币种？': 'supported-settlement-currencies',
  '企业认证资料说明': 'enterprise-certification-materials',
  'Oceanpayment禁止和受限接入的行业': 'prohibited-and-restricted-businesses',
  'Terms and Conditions条款': 'terms-and-conditions',
  'IAM申请OPCCOUNT全球账户业务操作手册': 'iam-opccount-global-account-application-guide',
  '交易金额限制生效规则': 'transaction-amount-limit-rules',
  'OP Card限额是多少？': 'op-card-limits',
  'OP Card是什么？': 'what-is-op-card',
  '单币卡是什么？': 'what-is-single-currency-card',
  '悦享卡是什么？': 'what-is-yuexiang-card',
  '为什么我的账户申请被拒绝？': 'account-application-rejected',
  '谁可以在OP开设发卡账户？': 'who-can-open-op-card-account',
  '在一个公司实体下可以创建的卡片数量是否有限制？': 'card-quantity-limit-under-company',
  '我可以将现有发卡帐户转移到不同的公司实体上吗？': 'transfer-card-account-to-different-company',
  '我注册之后是否能够更改企业信息？': 'change-company-information-after-registration',
  '谁会默认成为虚拟卡管理人？虚拟卡管理人可以做什么？': 'default-virtual-card-manager',
  '企业账号实名认证后，营业执照过期/法定代表人变更/注销是否有影响？': 'company-verification-change-impact',
  'OP虚拟卡不支持哪些业务和行业？': 'unsupported-op-virtual-card-businesses',
  '发现交易金额有异常或者有争议订单怎么办？': 'abnormal-or-disputed-card-transaction',
  '我什么时候可以开始交易？': 'when-can-i-start-transacting',
  '可以进行卡转账或提现吗？': 'card-transfer-or-withdrawal',
  '付款支持哪些币种？': 'payment-supported-currencies',
  '为什么我的卡支付失败？': 'card-payment-failed',
  '为什么我的卡被暂停了？': 'card-suspended',
  '我可以在交易处理中时停止或取消卡交易吗？': 'stop-or-cancel-processing-card-transaction',
  '为什么卡片被冻结或卡片注销后，交易仍然成功了？': 'transaction-success-after-card-frozen-or-cancelled',
  '什么叫币种叠加换汇？': 'stacked-currency-conversion',
  '如何提出拒付？': 'how-to-raise-chargeback',
  '受理中的拒付资金怎么处理': 'chargeback-funds-in-process',
  '实际扣款金额与处理中金额有可能会不同吗？': 'actual-and-processing-amount-difference',
  '怎么创建卡片？': 'create-card',
  '如何新增卡？': 'add-new-card',
  '怎么查看卡信息？': 'view-card-information',
  '什么是我的可用余额？如何增加可用额度？': 'available-balance-and-increase-limit',
  '如何更改自己设定的虚拟卡的交易限额？': 'change-virtual-card-transaction-limit',
  '什么是卡冻结？': 'what-is-card-freeze',
  '怎么进行卡注销？卡注销后资金怎么处理？': 'cancel-card-and-handle-funds',
  'OPcard有效期是多久？': 'opcard-validity-period',
  '已注销的卡可以收到退款么？': 'refund-to-cancelled-card',
  '卡被盗了怎么办？': 'stolen-card',
  '单笔卡交易限额': 'single-card-transaction-limit',
  '发卡账户一天可以提额几次': 'card-account-daily-limit-increase-times',
  '发卡账户增额的限制': 'card-account-limit-increase-restrictions',
  '我的费用结算时间是什么时候？': 'fee-settlement-time',
  '如何查看我被收取的所有费用？': 'view-all-fees',
  '如何创建企业卡？': 'create-company-card',
  '什么是企业卡卡片联系人？': 'company-card-contact',
  '谁会默认成为企业卡卡片联系人？': 'default-company-card-contact',
  '卡片联系人可以做什么？': 'card-contact-permissions',
  '谁可以指定企业卡卡片联系人？': 'who-can-assign-company-card-contact',
  '可以指定谁作为企业卡卡片联系人？': 'who-can-be-company-card-contact',
  '可以为每张企业卡指定几位卡片联系人？': 'company-card-contact-limit',
  '什么是处理中的卡交易？': 'processing-card-transaction',
  '交易会保持处理中多久？': 'processing-card-transaction-duration',
  '什么是已撤销的卡交易？': 'reversed-card-transaction',
  '为什么卡片被冻结/取消后，交易仍然成功了？': 'transaction-success-after-card-freeze-or-cancel',
  '如何保护自己免遭诈骗和卡片欺诈': 'protect-against-card-fraud',
  '如果我的多张卡片上都发生了欺诈怎么办？': 'fraud-on-multiple-cards',
  'OPCard操作教程': 'opcard-operation-guide',
  'OP Card禁入行业清单': 'op-card-prohibited-industries',
  'OP Card业务申请资料说明': 'op-card-application-materials',
  'Oceanpayment Card价格': 'oceanpayment-card-pricing',
};

function decodeXml(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function extractCdata(block, tagName) {
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = block.match(new RegExp(`<${escaped}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${escaped}>`));
  if (match) return match[1].trim();
  const plain = block.match(new RegExp(`<${escaped}>([\\s\\S]*?)</${escaped}>`));
  return plain ? decodeXml(plain[1]).trim() : '';
}

function extractCategories(block) {
  const categories = [];
  const regex = /<category\s+([^>]*domain="lsvr_kba_cat"[^>]*)><!\[CDATA\[([\s\S]*?)\]\]><\/category>/g;
  let match;
  while ((match = regex.exec(block))) {
    categories.push(match[2].trim());
  }
  return categories;
}

function walkIndexFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkIndexFiles(fullPath));
    if (entry.isFile() && entry.name === 'index.md') out.push(fullPath);
  }
  return out;
}

function parseMarkdownTitle(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^title:\s*"([\s\S]*?)"\s*$/m);
  return match ? match[1].trim() : '';
}

function normalizeTitle(value) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/[?？]\s*$/g, '？')
    .trim();
}

function asciiSlug(value) {
  return value
    .normalize('NFKC')
    .replace(/OPCard/gi, 'opcard')
    .replace(/Oceanpayment/gi, 'oceanpayment')
    .replace(/Google Pay/gi, 'google-pay')
    .replace(/Google Wallet/gi, 'google-wallet')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function buildSlug(title, target, index) {
  if (SLUG_OVERRIDES[title]) return SLUG_OVERRIDES[title];
  const slug = asciiSlug(title);
  if (slug && slug.length >= 4) return slug;
  const prefix = target
    .replace(/^docs\//, '')
    .split('/')
    .map((part) => part.replace(/-faq$/, ''))
    .join('-');
  return `${prefix}-${String(index).padStart(3, '0')}`;
}

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function firstMappedCategory(categories) {
  return categories.find((category) => CATEGORY_MAP[category]) || categories[0] || '';
}

function main() {
  const xml = fs.readFileSync(XML_PATH, 'utf8');
  const markdownFiles = walkIndexFiles(MARKDOWN_ROOT);
  const markdownByTitle = new Map();
  for (const filePath of markdownFiles) {
    const title = parseMarkdownTitle(filePath);
    if (!title) continue;
    const key = normalizeTitle(title);
    if (!markdownByTitle.has(key)) markdownByTitle.set(key, []);
    markdownByTitle.get(key).push(path.relative(ROOT, filePath).replace(/\\/g, '/'));
  }

  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1]);
  const rows = [];
  let sourceOrder = 0;
  const perTargetCounter = new Map();

  for (const item of items) {
    const postType = extractCdata(item, 'wp:post_type');
    if (postType !== 'lsvr_kba') continue;

    sourceOrder += 1;
    const title = normalizeTitle(extractCdata(item, 'title'));
    const status = extractCdata(item, 'wp:status');
    const wpSlug = extractCdata(item, 'wp:post_name');
    const categories = extractCategories(item);
    const category = firstMappedCategory(categories);
    const mapped = CATEGORY_MAP[category];
    const overrideTarget = TARGET_OVERRIDE_BY_TITLE[title];
    const target = overrideTarget || mapped?.target || '';
    const action = mapped?.action || 'review';
    const shouldSkip = action === 'skip' || status !== 'publish';
    const screenshotOrder = SCREENSHOT_ORDER[target] || [];
    const screenshotIndex = screenshotOrder.indexOf(title);
    const sidebarPosition = screenshotIndex >= 0 ? screenshotIndex + 1 : '';
    const targetCount = (perTargetCounter.get(target) || 0) + 1;
    perTargetCounter.set(target, targetCount);
    const candidateSlug = target ? buildSlug(title, target, targetCount) : '';
    const mdMatches = markdownByTitle.get(title) || [];
    const notes = [];

    if (!mapped) notes.push('unmapped category');
    if (overrideTarget) notes.push('target overridden by screenshot');
    if (action === 'skip') notes.push(mapped.reason || 'skipped');
    if (status !== 'publish') notes.push(`status=${status}`);
    if (target && !sidebarPosition) notes.push('sidebar position pending screenshot/order review');
    if (!mdMatches.length) notes.push('markdown output not found by title');
    if (mdMatches.length > 1) notes.push('multiple markdown outputs with same title');

    rows.push({
      sourceOrder,
      status,
      action: shouldSkip ? 'skip' : action,
      category,
      title,
      target,
      candidateSlug,
      sidebarPosition,
      wpSlug,
      markdownPath: mdMatches.join('; '),
      notes: notes.join('; '),
    });
  }

  fs.mkdirSync(REPORT_DIR, {recursive: true});

  const csvPath = path.join(REPORT_DIR, 'zh-migration-audit.csv');
  const headers = [
    'source_order',
    'status',
    'action',
    'old_category',
    'title',
    'target_directory',
    'candidate_slug',
    'sidebar_position',
    'wp_post_name',
    'markdown_output',
    'notes',
  ];
  const csvRows = rows.map((row) =>
    [
      row.sourceOrder,
      row.status,
      row.action,
      row.category,
      row.title,
      row.target,
      row.candidateSlug,
      row.sidebarPosition,
      row.wpSlug,
      row.markdownPath,
      row.notes,
    ]
      .map(csvCell)
      .join(','),
  );
  fs.writeFileSync(csvPath, `${headers.map(csvCell).join(',')}\n${csvRows.join('\n')}\n`, 'utf8');

  const counts = rows.reduce((acc, row) => {
    const key = `${row.action}:${row.target || row.category || 'unmapped'}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const pending = rows.filter((row) => row.action === 'migrate' && !row.sidebarPosition).length;
  const skipped = rows.filter((row) => row.action === 'skip').length;
  const migrate = rows.filter((row) => row.action === 'migrate').length;
  const summaryLines = [
    '# 中文迁移审计清单',
    '',
    `生成时间：${new Date().toISOString()}`,
    '',
    '## 结果概览',
    '',
    `- 总文章数：${rows.length}`,
    `- 待迁移：${migrate}`,
    `- 跳过：${skipped}`,
    `- 待补截图顺序：${pending}`,
    '',
    '## 目录统计',
    '',
    ...Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => `- ${key}: ${count}`),
    '',
    '## 输出文件',
    '',
    '- `migration/reports/zh-migration-audit.csv`',
    '',
    '## 说明',
    '',
    '- `action=skip` 包含已完成迁移的 ODPM 内容，以及非 publish 状态内容。',
    '- `candidate_slug` 是首版建议路径标识，后续正式导入前可继续精修。',
    '- `sidebar_position` 优先使用已从截图确认的文章顺序，空值表示需要继续补截图顺序或人工复核。',
  ];
  fs.writeFileSync(path.join(REPORT_DIR, 'zh-migration-summary.md'), `${summaryLines.join('\n')}\n`, 'utf8');

  console.log(`Wrote ${path.relative(ROOT, csvPath)}`);
  console.log(`Rows: ${rows.length}, migrate: ${migrate}, skip: ${skipped}, pending order: ${pending}`);
}

main();
