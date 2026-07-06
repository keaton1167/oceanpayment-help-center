import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const content = {
  zh: {
    eyebrow: 'Oceanpayment Help Center',
    title: '欢迎使用 Oceanpayment 帮助中心',
    description:
      '查找产品指引、FAQ、资料与信息更新，快速定位所需帮助。',
    searchNote: '可直接输入关键词，如：账户、划款、Google Pay、风控。',
    sectionTitle: '文档分类',
    featuredTitle: '热门文档',
    categories: [
      {
        title: 'ODPM 账户后台操作指引',
        description: '账户后台操作、板块操作及相关流程说明。',
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
        description: '登录、密码、账户与客服联络等常见问题。',
        href: '/docs/customer-service/customer-service-faq/oceanpayment-complaints-and-suggestions-contact/',
      },
    ],
    featured: [
      {
        title: 'Oceanpayment ODPM-账户后台网站申请指引',
        href: '/docs/odpm-guide/section-guide/account-application-guide/',
      },
      {
        title: '物流信息上传操作手册',
        href: '/docs/odpm-guide/section-guide/logistics-upload-manual/',
      },
      {
        title: 'Oceanpayment ODPM-数据分析功能手册',
        href: '/docs/odpm-guide/section-guide/data-analysis-manual/',
      },
    ],
  },
  en: {
    eyebrow: 'Oceanpayment Help Center',
    title: 'Welcome to Oceanpayment Help Center',
    description:
      'Find product guides, FAQs, resources, and service updates for Oceanpayment.',
    searchNote:
      'Try keywords like: account, settlement, chargeback, Google Pay.',
    sectionTitle: 'Document Categories',
    featuredTitle: 'Popular Documents',
    categories: [
      {
        title: 'ODPM Operation Guide',
        description: 'Guides for account backend setup, module operations, and platform workflows.',
        href: '/en/docs/odpm-guide/section-guide/digital-platform-guidelines-manual/',
      },
      {
        title: 'Payment Acquiring FAQ',
        description: 'Policy updates, payment FAQs, settlement, withdrawal, and POBO guidance.',
        href: '/en/docs/payment-faq/info-update/mastercard-chargeback-assessment-criteria/',
      },
      {
        title: 'OP Card FAQ',
        description: 'Common questions, terms and conditions, and Google Pay support for OP Card.',
        href: '/en/docs/op-card-faq/terms-conditions/terms-and-conditions/',
      },
      {
        title: 'Products and Services',
        description: 'Product capabilities, payment methods, and supported platform scenarios.',
        href: '/en/docs/products-services/oceanpayment-products/oceanpayment-recurring-introduction/',
      },
      {
        title: 'Compliance and Verification',
        description: 'Business verification, onboarding requirements, and compliance guidance.',
        href: '/en/docs/compliance-certification/access-compliance/prohibited-and-restricted-businesses/',
      },
      {
        title: 'Customer Support',
        description: 'Help with login, password, account access, and support contacts.',
        href: '/en/docs/customer-service/customer-service-faq/multiple-account-logins/',
      },
    ],
    featured: [
      {
        title: 'New- Oceanpayment-ODPM Digital Platform Guidelines Manual',
        href: '/en/docs/odpm-guide/section-guide/digital-platform-guidelines-manual/',
      },
      {
        title: 'Assign Account Setting',
        href: '/en/docs/odpm-guide/section-guide/assign-account-setting/',
      },
      {
        title: 'Guideline of Reconciliation',
        href: '/en/docs/odpm-guide/section-guide/reconciliation-guideline/',
      },
    ],
  },
};

export default function DocsHome({locale = 'zh'}) {
  const page = content[locale] ?? content.zh;
  const featuredCta = locale === 'en' ? 'View guide' : '查看文档';

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
        <h2>{page.featuredTitle}</h2>
        <div className={styles.featuredList}>
          {page.featured.map((item) => (
            <Link className={styles.featuredItem} to={item.href} key={item.href}>
              <span>{item.title}</span>
              <small>{featuredCta}</small>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
