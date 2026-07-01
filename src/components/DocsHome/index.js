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
        href: '/docs/payment-faq/account-transfer/opccount-platform-manual/',
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
        href: '/docs/payment-faq/account-transfer/opccount-platform-manual/',
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
    ],
    categories: [
      {
        title: 'ODPM Account Backend Operation Guide',
        description: 'Account backend, section operations, and related process guidance.',
        href: '/docs/odpm-guide/section-guide/digital-platform-guidelines-manual/',
      },
    ],
    featured: [
      {
        title: 'New- Oceanpayment-ODPM Digital Platform Guidelines Manual',
        href: '/docs/odpm-guide/section-guide/digital-platform-guidelines-manual/',
      },
      {
        title: 'Assign Account Setting',
        href: '/docs/odpm-guide/section-guide/assign-account-setting/',
      },
      {
        title: 'Guideline of Reconciliation',
        href: '/docs/odpm-guide/section-guide/reconciliation-guideline/',
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
