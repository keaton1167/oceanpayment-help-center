// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import remarkStrongInline from './plugins/remark-strong-inline.js';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const ENGLISH_DOC_IDS = [
  'compliance-certification/enterprise-certification-faq/klarna-payment-operations-guide',
  'odpm-guide/section-guide/digital-platform-guidelines-manual',
  'op-card-faq/common-questions/opccount-guideline',
  'payment-faq/info-update/assign-account-setting',
  'products-services/oceanpayment-products/reconciliation-guideline',
];

const currentLocale = process.env.DOCUSAURUS_CURRENT_LOCALE ?? 'zh-Hans';
const ENGLISH_CATEGORY_LABELS = {
  'ODPM 账户后台操作指引': 'ODPM Account Backend Operation Guide',
  'Payment 收单常见 FAQ': 'Common FAQs About Payment Processing',
  'OP Card 常见 FAQ': 'OP Card Common FAQs',
  '产品与服务': 'Products and Services',
  '合规与认证': 'Compliance and Certification',
  '客户服务': 'Customer Service',
  '板块操作指引': 'Guidelines for Plate Operations',
  '信息更新专区': 'Information Update Zone',
  '企业认证常见问题': 'Common Issues in Enterprise Certification',
  '常见问题': 'Frequently Asked Questions',
  '客户服务常见问题': 'Customer Service Frequently Asked Questions',
  'Oceanpayment 产品': 'Oceanpayment Products and Services',
  'Oceanpayment 产品与服务': 'Oceanpayment Products and Services',
  '准入与合规管理': 'Access and Compliance Management',
  '条款和条件': 'Terms and Conditions',
  '账户划款、提现、代付指引':
    'Account transfer, withdrawal, and payment instructions',
  '支持 Google Pay FAQ': 'Support Google Pay FAQ',
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
        exclude: ENGLISH_DOC_IDS.map((docId) => `${docId}/**`),
      };

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Oceanpayment 帮助中心',
  tagline: '',
  favicon: 'img/favicon.ico',
  scripts: ['/js/attachment-preview.js?v=20260629-5'],

  titleDelimiter: '|',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url: 'https://support.oceanpayment.com',
  baseUrl: '/',

  organizationName: 'oceanpayment',
  projectName: 'support-center',

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
