import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import TOCItems from '@theme/TOCItems';
import styles from './styles.module.css';

const LINK_CLASS_NAME = 'table-of-contents__link toc-highlight';
const LINK_ACTIVE_CLASS_NAME = 'table-of-contents__link--active';

const introLinks = {
  zh: [
    {label: 'ODPM 操作指引', href: '/docs/odpm-guide/section-guide/account-application-guide/'},
    {label: 'Payment FAQ', href: '/docs/payment-faq/info-update/mastercard-chargeback-assessment-criteria/'},
    {label: 'OP Card FAQ', href: '/docs/op-card-faq/common-questions/transaction-amount-limit-rules/'},
    {label: '产品与服务', href: '/docs/products-services/oceanpayment-products/oceanpayment-recurring-introduction/'},
    {label: '合规与认证', href: '/docs/compliance-certification/access-compliance/prohibited-and-restricted-businesses/'},
    {label: '客户服务', href: '/docs/customer-service/customer-service-faq/oceanpayment-complaints-and-suggestions-contact/'},
  ],
  en: [
    {label: 'ODPM Guide', href: '/en/docs/odpm-guide/section-guide/digital-platform-guidelines-manual/'},
    {label: 'Payment FAQ', href: '/en/docs/payment-faq/info-update/mastercard-chargeback-assessment-criteria/'},
    {label: 'OP Card FAQ', href: '/en/docs/op-card-faq/terms-conditions/terms-and-conditions/'},
    {label: 'Products and Services', href: '/en/docs/products-services/oceanpayment-products/oceanpayment-recurring-introduction/'},
    {label: 'Compliance and Verification', href: '/en/docs/compliance-certification/access-compliance/prohibited-and-restricted-businesses/'},
    {label: 'Customer Support', href: '/en/docs/customer-service/customer-service-faq/multiple-account-logins/'},
  ],
};

function IntroPanel() {
  const {
    i18n: {currentLocale},
  } = useDocusaurusContext();
  const links = currentLocale === 'en' ? introLinks.en : introLinks.zh;
  const title = currentLocale === 'en' ? 'Quick Access' : '快速入口';

  return (
    <div className={styles.introPanel}>
      <div className={styles.panelTitle}>{title}</div>
      <ul>
        {links.map((item) => (
          <li key={item.href}>
            <Link to={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function normalizePathname(pathname, baseUrl) {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  if (normalizedBaseUrl !== '/' && pathname.startsWith(normalizedBaseUrl)) {
    return `/${pathname.slice(normalizedBaseUrl.length)}`
      .replace(/\/+/g, '/')
      .replace(/\/$/, '');
  }

  return pathname.replace(/\/$/, '');
}

export default function TOC({className, ...props}) {
  const {pathname} = useLocation();
  const {siteConfig} = useDocusaurusContext();
  const normalizedPathname = normalizePathname(pathname, siteConfig.baseUrl);
  const isIntroPage =
    normalizedPathname === '/docs/intro' ||
    normalizedPathname === '/en/docs/intro';

  return (
    <div className={clsx(styles.tableOfContents, 'thin-scrollbar', className)}>
      <TOCItems
        {...props}
        linkClassName={LINK_CLASS_NAME}
        linkActiveClassName={LINK_ACTIVE_CLASS_NAME}
      />
      {isIntroPage && <IntroPanel />}
    </div>
  );
}
