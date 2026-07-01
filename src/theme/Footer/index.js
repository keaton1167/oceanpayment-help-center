import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useThemeConfig} from '@docusaurus/theme-common';
import styles from './styles.module.css';

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/Oceanpayment',
    text: 'f',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/oceanpayment',
    text: 'in',
  },
  {
    label: 'X',
    href: 'https://twitter.com/Oceanpayment',
    text: 'X',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/Oceanpayment',
    text: 'GH',
  },
];

function FooterLink({item}) {
  const {href, to, label} = item;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }

  return <Link to={to}>{label}</Link>;
}

export default function Footer() {
  const {footer} = useThemeConfig();
  const logoSrc = useBaseUrl('/img/op-logo.svg');
  const {
    i18n: {currentLocale},
  } = useDocusaurusContext();

  if (!footer) {
    return null;
  }

  const tagline =
    currentLocale === 'en' ? 'Simplifying global payments' : '让全球支付更简单';
  const columns = footer.links ?? [];
  const legalTitles = new Set(['法律', 'Legal']);
  const legalColumn = columns.find((column) => legalTitles.has(column.title));
  const mainColumns = columns.filter((column) => !legalTitles.has(column.title));

  return (
    <footer className="theme-layout-footer footer footer--dark">
      <div className={styles.inner}>
        <div className={styles.main}>
          <div className={styles.brand}>
            <img src={logoSrc} alt="Oceanpayment" />
            <p>{tagline}</p>
            <div className={styles.socials}>
              {socialLinks.map((item) => (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  key={item.href}>
                  {item.text}
                </a>
              ))}
            </div>
          </div>

          <div className={styles.columns}>
            {mainColumns.map((column) => (
              <div className={styles.column} key={column.title}>
                <h2>{column.title}</h2>
                <ul>
                  {column.items.map((item) => (
                    <li key={item.href ?? item.to}>
                      <FooterLink item={item} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.bottom}>
          <div>{footer.copyright}</div>
          {legalColumn && (
            <div className={styles.legal}>
              {legalColumn.items.map((item) => (
                <FooterLink item={item} key={item.href ?? item.to} />
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
