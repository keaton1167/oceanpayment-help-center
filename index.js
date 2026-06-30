import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const content = {
  zh: {
    eyebrow: 'Oceanpayment Help Center',
    title: '欢迎使用 Oceanpayment 帮助中心',
    quickTitle: '快速入口',
    sectionTitle: '文档分类',
    featuredTitle: '推荐文档',
    heroLinks: [
      {
        title: 'ODPM 操作指引',
        description: '账户后台与板块操作指引',
        href: '/docs/odpm-guide/section-guide/account-application-guide/',
      },
      {
        title: 'Payment FAQ',
        description: '信息更新、常见问题与账户操作',
        href: '/docs/payment-faq/info-update/logistics-upload-manual/',
      },
      {
        title: 'OP Card FAQ',
        description: '常见问题、条款条件与 Google Pay',
        href: '/docs/op-card-faq/common-questions/logistics-query-upload-guide/',
      },
    ],
    categories: [
      {
        title: 'ODPM 账户后台操作指引',
        description: '账户后台操作、板块操作及相关流程说明。',
        href: '/docs/odpm-guide/section-guide/account-application-guide/',
      },
      {
        title: 'Payment 收单常见 FAQ',
        description: '信息更新、常见问题、账户划款、提现和代付指引。',
        href: '/docs/payment-faq/info-update/logistics-upload-manual/',
      },
      {
        title: 'OP Card 常见 FAQ',
        description: '常见问题、条款和条件、Google Pay 相关说明。',
        href: '/docs/op-card-faq/common-questions/logistics-query-upload-guide/',
      },
      {
        title: '产品与服务',
        description: 'Oceanpayment 产品与服务相关说明。',
        href: '/docs/products-services/oceanpayment-products/data-analysis-manual/',
      },
      {
        title: '合规与认证',
        description: '企业认证常见问题、准入与合规管理说明。',
        href: '/docs/compliance-certification/access-compliance/op-card-operation-guide/',
      },
      {
        title: '客户服务',
        description: '客户服务常见问题与平台支持说明。',
        href: '/docs/customer-service/customer-service-faq/digital-platform-guide/',
      },
    ],
    featured: [
      {
        title: 'Oceanpayment ODPM-账户后台网站申请指引',
        href: '/docs/odpm-guide/section-guide/account-application-guide/',
      },
      {
        title: '物流信息上传操作手册',
        href: '/docs/payment-faq/info-update/logistics-upload-manual/',
      },
      {
        title: 'Oceanpayment ODPM-数据分析功能手册',
        href: '/docs/products-services/oceanpayment-products/data-analysis-manual/',
      },
    ],
  },
  en: {
    eyebrow: 'Oceanpayment Help Center',
    title: 'Oceanpayment Help Center',
    quickTitle: 'Quick Access',
    sectionTitle: 'Document Categories',
    featuredTitle: 'Available English Documents',
    heroLinks: [
      {
        title: 'ODPM Guide',
        description: 'Account backend and section operations',
        href: '/docs/odpm-guide/section-guide/digital-platform-guidelines-manual/',
      },
      {
        title: 'Payment FAQ',
        description: 'Information updates and account operations',
        href: '/docs/payment-faq/info-update/assign-account-setting/',
      },
      {
        title: 'OP Card FAQ',
        description: 'Common questions, terms, and Google Pay',
        href: '/docs/op-card-faq/common-questions/opccount-guideline/',
      },
    ],
    categories: [
      {
        title: 'ODPM Account Backend Operation Guide',
        description: 'Account backend, section operations, and related process guidance.',
        href: '/docs/odpm-guide/section-guide/digital-platform-guidelines-manual/',
      },
      {
        title: 'Common FAQs About Payment Processing',
        description: 'Information updates, common questions, fund transfers, withdrawals, and payout guidance.',
        href: '/docs/payment-faq/info-update/assign-account-setting/',
      },
      {
        title: 'OP Card Common FAQs',
        description: 'Common questions, terms and conditions, and Google Pay related guidance.',
        href: '/docs/op-card-faq/common-questions/opccount-guideline/',
      },
      {
        title: 'Products and Services',
        description: 'Oceanpayment products and services documentation.',
        href: '/docs/products-services/oceanpayment-products/reconciliation-guideline/',
      },
      {
        title: 'Compliance and Certification',
        description: 'Enterprise certification, access, and compliance management guidance.',
        href: '/docs/compliance-certification/enterprise-certification-faq/klarna-payment-operations-guide/',
      },
    ],
    featured: [
      {
        title: 'New- Oceanpayment-ODPM Digital Platform Guidelines Manual',
        href: '/docs/odpm-guide/section-guide/digital-platform-guidelines-manual/',
      },
      {
        title: 'Assign Account Setting',
        href: '/docs/payment-faq/info-update/assign-account-setting/',
      },
      {
        title: 'Guideline of Reconciliation',
        href: '/docs/products-services/oceanpayment-products/reconciliation-guideline/',
      },
    ],
  },
};

export default function DocsHome({locale = 'zh'}) {
  const page = content[locale] ?? content.zh;

  return (
    <div className={styles.docsHome}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{page.eyebrow}</p>
          <h1>{page.title}</h1>
        </div>
        <div className={styles.heroPanel}>
          <div className={styles.panelHeader}>{page.quickTitle}</div>
          <div className={styles.panelLinks}>
            {page.heroLinks.map((item) => (
              <Link className={styles.panelLink} to={item.href} key={item.href}>
                <span>{item.title}</span>
                <small>{item.description}</small>
              </Link>
            ))}
          </div>
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
              {item.title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
