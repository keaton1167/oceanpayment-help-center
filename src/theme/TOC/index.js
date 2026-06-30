import React from 'react';
import clsx from 'clsx';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import TOCItems from '@theme/TOCItems';
import styles from './styles.module.css';

const LINK_CLASS_NAME = 'table-of-contents__link toc-highlight';
const LINK_ACTIVE_CLASS_NAME = 'table-of-contents__link--active';

const introLinks = {
  zh: [
    {label: 'ODPM 操作指引', href: '/docs/odpm-guide/section-guide/account-application-guide/'},
    {label: 'Payment FAQ', href: '/docs/payment-faq/info-update/logistics-upload-manual/'},
    {label: 'OP Card FAQ', href: '/docs/op-card-faq/common-questions/logistics-query-upload-guide/'},
    {label: '产品与服务', href: '/docs/products-services/oceanpayment-products/data-analysis-manual/'},
  ],
  en: [
    {label: 'ODPM Guide', href: '/en/docs/odpm-guide/section-guide/digital-platform-guidelines-manual/'},
    {label: 'Payment FAQ', href: '/en/docs/payment-faq/info-update/assign-account-setting/'},
    {label: 'OP Card FAQ', href: '/en/docs/op-card-faq/common-questions/opccount-guideline/'},
    {label: 'Products', href: '/en/docs/products-services/oceanpayment-products/reconciliation-guideline/'},
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
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TOC({className, ...props}) {
  const {pathname} = useLocation();
  const isIntroPage =
    pathname === '/docs/intro' ||
    pathname === '/docs/intro/' ||
    pathname === '/en/docs/intro' ||
    pathname === '/en/docs/intro/';

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
