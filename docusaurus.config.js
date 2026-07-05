// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import remarkStrongInline from './plugins/remark-strong-inline.js';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const ENGLISH_ONLY_DOC_IDS = [
  'odpm-guide/section-guide/klarna-payment-operations-guide',
  'odpm-guide/section-guide/blacklist-operation-manual',
  'odpm-guide/section-guide/digital-platform-guidelines-manual',
  'odpm-guide/section-guide/digital-platform-guidelines-manual-all-exceptions',
  'odpm-guide/section-guide/high-fraud-risk-alert-manual',
  'odpm-guide/section-guide/merchant-initiated-chargeback-recall-guidelines',
  'odpm-guide/section-guide/reconciliation-guide',
  'odpm-guide/section-guide/whitelist-operation-manual',
  'odpm-guide/section-guide/opccount-guideline',
  'odpm-guide/section-guide/assign-account-setting',
  'odpm-guide/section-guide/reconciliation-guideline',
  'odpm-guide/section-guide/merchant-batch-representment-submission-guide',
  'payment-faq/common-questions/reduce-fraudulent-chargeback-transactions',
  'payment-faq/account-transfer/opasst-guideline',
  'payment-faq/common-questions/klarna-apr-range-update-for-consumers',
  'products-services/oceanpayment-products/supported-local-payment-products',
  'products-services/oceanpayment-products/change-domain-reapply-channel',
];

const TRANSLATED_DOC_IDS = [
  'customer-service/customer-service-faq/multiple-account-logins',
  'customer-service/customer-service-faq/reset-oceanpayment-dashboard-password',
  'payment-faq/account-transfer/account-funds-and-reconciliation',
  'payment-faq/account-transfer/successful-transaction-settlement',
  'payment-faq/common-questions/chargeback-fraud-retrieval-orders',
  'payment-faq/common-questions/high-risk-order-alert-email',
  'payment-faq/common-questions/ideal-merchant-operation-notes',
  'payment-faq/common-questions/klarna-consumer-bill-sample',
  'payment-faq/common-questions/klarna-norway-market-update',
  'payment-faq/common-questions/payment-declined-10000-risk-control',
  'payment-faq/common-questions/uk-klarna-advertising-requirements',
  'payment-faq/common-questions/visa-mastercard-refund-rules-update',
  'payment-faq/common-questions/risky-successful-transaction-handling',
  'payment-faq/common-questions/credit-card-channel-supported-currencies',
  'payment-faq/common-questions/merchant-fund-settlement-at-oceanpayment',
  'payment-faq/common-questions/currency-conversion-in-transaction-settlement',
  'payment-faq/common-questions/supported-settlement-currencies',
  'payment-faq/common-questions/klarna-dispute-lifecycle',
  'payment-faq/common-questions/klarna-dispute-improvement-guide',
  'compliance-certification/access-compliance/prohibited-and-restricted-businesses',
  'products-services/oceanpayment-products/available-payment-products',
  'products-services/oceanpayment-products/support-mobile-payment',
  'products-services/oceanpayment-products/support-shopify-or-other-platforms',
  'products-services/oceanpayment-products/activate-new-payment-method-pricing',
  'products-services/oceanpayment-products/oceanpayment-recurring-introduction',
  'customer-service/customer-service-faq/oceanpayment-complaints-and-suggestions-contact',
  'payment-faq/info-update/japan-credit-card-security-guidelines-5',
  'payment-faq/info-update/mastercard-chargeback-assessment-criteria',
  'payment-faq/info-update/mastercard-chargeback-reason-update',
  'payment-faq/info-update/visa-vamp-policy',
  'op-card-faq/terms-conditions/terms-and-conditions',
];

const ENGLISH_DOC_IDS = [...ENGLISH_ONLY_DOC_IDS, ...TRANSLATED_DOC_IDS];

const currentLocale = process.env.DOCUSAURUS_CURRENT_LOCALE ?? 'zh-Hans';
const isGitHubPages = process.env.DEPLOY_TARGET === 'github-pages';
const baseUrl = isGitHubPages ? '/oceanpayment-help-center/' : '/';
const localePrefix = currentLocale === 'en' ? 'en/' : '';
const localizedStaticPath = (assetPath) =>
  `${baseUrl}${localePrefix}${assetPath.replace(/^\//, '')}`;
const ENGLISH_CATEGORY_LABELS = {
  'ODPM 账户后台操作指引': 'ODPM Operation Guide',
  '板块操作指引': 'Module Operation Guide',
  'Payment 收单常见 FAQ': 'Payment Acquiring FAQ',
  '信息更新专区': 'Information Update Center',
  '常见问题': 'FAQ',
  '账户划款、提现、代付指引': 'Settlement, Withdrawal, POBO Guide',
  'OP Card 常见FAQ': 'OP Card FAQ',
  '条款和条件': 'Terms and Conditions',
  '支持Google Pay FAQ': 'Google Pay Support FAQ',
  '产品与服务': 'Products and Services',
  'Oceanpayment产品与服务': 'Oceanpayment Products and Services',
  '合规与认证': 'Compliance and Verification',
  '企业认证常见问题': 'Business Verification FAQ',
  '准入与合规管理': 'Merchant Onboarding and Compliance Management',
  '客户服务': 'Customer Support',
  '客户服务常见问题': 'Customer Service FAQ',
};

function translateSidebarItems(items) {
  if (currentLocale !== 'en') {
    return items;
  }

  return items.map((item) => {
    if (item.type !== 'category') {
      return item;
    }

    return {
      ...item,
      label: ENGLISH_CATEGORY_LABELS[item.label] ?? item.label,
      items: translateSidebarItems(item.items),
    };
  });
}

const docsLocaleOptions =
  currentLocale === 'en'
    ? {
        include: [
          'intro.mdx',
          ...ENGLISH_DOC_IDS.map((docId) => `${docId}/index.mdx`),
        ],
        async sidebarItemsGenerator(args) {
          const items = await args.defaultSidebarItemsGenerator(args);
          return translateSidebarItems(items);
        },
      }
    : {
        exclude: ENGLISH_ONLY_DOC_IDS.map((docId) => `${docId}/**`),
      };

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Oceanpayment 帮助中心',
  tagline: '',
  favicon: 'img/favicon.ico',
  scripts: [
    localizedStaticPath('js/attachment-preview.js?v=20260702-2'),
    localizedStaticPath('js/language-switcher.js?v=20260706-1'),
  ],
  titleDelimiter: '|',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url: isGitHubPages
    ? 'https://keaton1167.github.io'
    : 'https://support.oceanpayment.com',
  baseUrl,

  organizationName: isGitHubPages ? 'keaton1167' : 'oceanpayment',
  projectName: isGitHubPages ? 'oceanpayment-help-center' : 'support-center',

  onBrokenLinks: 'warn',
  markdown: { hooks: { onBrokenMarkdownImages: 'warn' } },

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans', 'en'],
    localeConfigs: {
      'zh-Hans': {
        label: '中文',
        direction: 'ltr',
      },
      en: {
        label: 'English',
        direction: 'ltr',
      },
    },
  },

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        docsRouteBasePath: ['/docs'],
        language: ['en', 'zh'],
        hashed: 'query',
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        searchResultLimits: 8,
        searchResultContextMaxLength: 80,
        searchBarShortcut: true,
        searchBarShortcutHint: true,
        searchBarShortcutKeymap: 'mod+k',
        searchBarPosition: 'right',
      },
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: 'docs',
          remarkPlugins: [remarkStrongInline],
          ...docsLocaleOptions,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        pages: {
          routeBasePath: '/',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 3,
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      navbar: {
        logo: {
          alt: 'Oceanpayment Logo',
          src: 'img/op-logo.svg',
          href: '/docs/intro',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '帮助中心',
          },
          {
            type: 'search',
            position: 'right',
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '产品',
            items: [
              {
                label: '全球收单',
                href: 'https://dev.oceanpayment.com/docs/payment/introduction',
              },
              {
                label: 'SAAS集成',
                href: 'https://dev.oceanpayment.com/docs/saas',
              },
              {
                label: 'OPCard',
                href: 'https://dev.oceanpayment.com/docs/opcard/introduction',
              },
              {
                label: 'OPCCOUNT',
                href: 'https://dev.oceanpayment.com/docs/opccount/introduction',
              },
            ],
          },
          {
            title: '资源',
            items: [
              {
                label: '文档',
                href: 'https://dev.oceanpayment.com/docs/get-start',
              },
              {
                label: 'API 参考',
                href: 'https://dev.oceanpayment.com/docs/payment-api',
              },
              {
                label: '开发者中心',
                href: 'https://dev.oceanpayment.com/',
              },
              {
                label: '支付Logo下载',
                href: 'https://download.oceanpayment.com.cn',
              },
            ],
          },
          {
            title: '公司',
            items: [
              {
                label: '关于我们',
                href: 'https://www.oceanpayment.com/company-overview',
              },
              {
                label: '联系我们',
                href: 'https://www.oceanpayment.com/contact-us-2',
              },
            ],
          },
          {
            title: '法律',
            items: [
              {
                label: '隐私政策',
                href: 'https://www.oceanpayment.com/about-us-op/privacy-policy',
              },
              {
                label: '免责声明',
                href: 'https://www.oceanpayment.com/about-us-op/disclaimer',
              },
              {
                label: 'Cookie 设置',
                href: 'https://www.oceanpayment.com/about-us-op/cookies-policy',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Oceanpayment. All rights reserved.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
