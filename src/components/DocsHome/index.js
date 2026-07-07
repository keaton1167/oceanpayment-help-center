import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const content = {
  zh: {
    eyebrow: 'Oceanpayment Help Center',
    title: '欢迎使用 Oceanpayment 帮助中心',
    description:
      '查找产品指引、FAQ、资料与信息更新，快速定位所需帮助。',
    sectionTitle: '文档分类',
    featuredTitle: '常用操作入口',
    featuredDescription:
      '汇总帮助中心中较常使用的操作指引，方便按业务场景快速找到对应文档。',
    categories: [
      {
        title: 'ODPM 账户后台操作指引',
        description: '账户后台操作、板块使用及相关流程说明。',
        href: '/docs/odpm-guide/section-guide/account-application-guide/',
      },
      {
        title: 'Payment 收单常见 FAQ',
        description: '信息更新、常见问题、账户划款、提现和代付指引。',
        href: '/docs/payment-faq/info-update/mastercard-chargeback-assessment-criteria/',
      },
      {
        title: 'OP Card 常见 FAQ',
        description: '涵盖发卡账户、卡片管理、条款与 Google Pay 支持。',
        href: '/docs/op-card-faq/common-questions/transaction-amount-limit-rules/',
      },
      {
        title: '产品与服务',
        description: '查看 Oceanpayment 产品能力、支付方式与平台支持范围。',
        href: '/docs/products-services/oceanpayment-products/oceanpayment-recurring-introduction/',
      },
      {
        title: '合规与认证',
        description: '企业认证、准入要求与合规管理相关说明。',
        href: '/docs/compliance-certification/access-compliance/prohibited-and-restricted-businesses/',
      },
      {
        title: '客户服务',
        description: '登录、密码、账户与客服联系等常见问题。',
        href: '/docs/customer-service/customer-service-faq/oceanpayment-complaints-and-suggestions-contact/',
      },
    ],
    featured: [
      {
        title: '账户申请与网站提交',
        description: '用于申请 Oceanpayment 账户、提交网站资料及跟进审核流程。',
        href: '/docs/odpm-guide/section-guide/account-application-guide/',
      },
      {
        title: '物流信息上传',
        description: '用于上传物流单号、补传发货信息及处理订单举证场景。',
        href: '/docs/odpm-guide/section-guide/logistics-upload-manual/',
      },
      {
        title: '数据分析与导出',
        description: '用于查看交易数据、下载分析报表及使用后台数据功能。',
        href: '/docs/odpm-guide/section-guide/data-analysis-manual/',
      },
      {
        title: 'OP Card 操作手册',
        description: '用于开卡、账单查询、月结单下载及日常卡管理。',
        href: '/docs/odpm-guide/section-guide/op-card-operation-guide/',
      },
    ],
  },
  en: {
    eyebrow: 'Oceanpayment Help Center',
    title: 'Welcome to Oceanpayment Help Center',
    description:
      'Find product guides, FAQs, resources, and service updates for Oceanpayment.',
    sectionTitle: 'Document Categories',
    featuredTitle: 'Common Task Entry Points',
    featuredDescription:
      'A curated set of commonly used guides to help users reach the right document by business scenario.',
    categories: [
      {
        title: 'ODPM Operation Guide',
        description:
          'Guides for account backend setup, module operations, and platform workflows.',
        href: '/en/docs/odpm-guide/section-guide/digital-platform-guidelines-manual/',
      },
      {
        title: 'Payment Acquiring FAQ',
        description:
          'Policy updates, payment FAQs, settlement, withdrawal, and POBO guidance.',
        href: '/en/docs/payment-faq/info-update/mastercard-chargeback-assessment-criteria/',
      },
      {
        title: 'OP Card FAQ',
        description:
          'Common questions, terms and conditions, and Google Pay support for OP Card.',
        href: '/en/docs/op-card-faq/terms-conditions/terms-and-conditions/',
      },
      {
        title: 'Products and Services',
        description:
          'Product capabilities, payment methods, and supported platform scenarios.',
        href: '/en/docs/products-services/oceanpayment-products/oceanpayment-recurring-introduction/',
      },
      {
        title: 'Compliance and Verification',
        description:
          'Business verification, onboarding requirements, and compliance guidance.',
        href: '/en/docs/compliance-certification/access-compliance/prohibited-and-restricted-businesses/',
      },
      {
        title: 'Customer Support',
        description:
          'Help with login, password, account access, and support contacts.',
        href: '/en/docs/customer-service/customer-service-faq/multiple-account-logins/',
      },
    ],
    featured: [
      {
        title: 'Platform Setup Guide',
        description:
          'Used for initial setup, platform navigation, and general backend operations.',
        href: '/en/docs/odpm-guide/section-guide/digital-platform-guidelines-manual/',
      },
      {
        title: 'Assign Account Setting',
        description:
          'Used for account assignment, role setup, and related permission handling.',
        href: '/en/docs/odpm-guide/section-guide/assign-account-setting/',
      },
      {
        title: 'Reconciliation Guide',
        description:
          'Used for reconciliation checks, statement review, and export-related reference.',
        href: '/en/docs/odpm-guide/section-guide/reconciliation-guideline/',
      },
      {
        title: 'OP Card Terms and Conditions',
        description:
          'Used for card service scope, usage rules, and liability-related terms.',
        href: '/en/docs/op-card-faq/terms-conditions/terms-and-conditions/',
      },
    ],
  },
};

export default function DocsHome({locale = 'zh'}) {
  const page = content[locale] ?? content.zh;
  const featuredCta = locale === 'en' ? 'Open' : '立即查看';

  return (
    <div className={styles.docsHome}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className={styles.description}>{page.description}</p>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{page.sectionTitle}</h2>
        <div className={styles.categoryGrid}>
          {page.categories.map((item) => (
            <Link className={styles.categoryCard} to={item.href} key={item.href}>
              <span>{item.title}</span>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>{page.featuredTitle}</h2>
            <p className={styles.sectionDescription}>{page.featuredDescription}</p>
          </div>
        </div>
        <div className={styles.featuredGrid}>
          {page.featured.map((item) => (
            <Link className={styles.featuredCard} to={item.href} key={item.href}>
              <div>
                <span className={styles.featuredCardTitle}>{item.title}</span>
                <p className={styles.featuredCardDescription}>{item.description}</p>
              </div>
              <small>{featuredCta}</small>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
