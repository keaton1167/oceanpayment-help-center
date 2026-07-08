import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useThemeConfig} from '@docusaurus/theme-common';
import styles from './styles.module.css';

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.205 24 24 23.226 24 22.271V1.729C24 .774 23.205 0 22.225 0zM6.814 20.452H3.86V9h2.954v11.452zM5.337 7.433c-1.144 0-2.069-.927-2.069-2.069 0-1.144.925-2.07 2.069-2.07 1.144 0 2.069.926 2.069 2.07 0 1.142-.925 2.069-2.069 2.069zM20.447 20.452h-3.554v-5.569c0-1.328-.024-3.039-1.852-3.039-1.853 0-2.136 1.445-2.136 2.939v5.669H8.351V9h3.414v1.561h.049c.476-.9 1.637-1.852 3.369-1.852 3.602 0 4.269 2.371 4.269 5.456v6.287z"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      aria-hidden="true">
      <path
        d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.84 9.49.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.782.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33s1.7.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.33-.01 2.41-.01 2.74 0 .26.18.58.69.48A10.002 10.002 0 0022 12c0-5.523-4.477-10-10-10z"
      />
    </svg>
  );
}

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/Oceanpayment',
    icon: <FacebookIcon />,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/oceanpayment',
    icon: <LinkedInIcon />,
  },
  {
    label: 'X',
    href: 'https://twitter.com/Oceanpayment',
    icon: <XIcon />,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/Oceanpayment',
    icon: <GitHubIcon />,
  },
];

function FooterLink({item, currentLocale}) {
  const {href, to, label, localeTo} = item;
  const resolvedTo = localeTo?.[currentLocale] ?? to;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }

  return <Link to={resolvedTo}>{label}</Link>;
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
    currentLocale === 'en'
      ? 'Simplifying global payments'
      : '让全球支付更简单';
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
                  title={item.label}
                  key={item.href}>
                  {item.icon}
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
                    <li key={item.href ?? item.to ?? `${item.label}-${currentLocale}`}>
                      <FooterLink item={item} currentLocale={currentLocale} />
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
                <FooterLink
                  item={item}
                  currentLocale={currentLocale}
                  key={item.href ?? item.to ?? `${item.label}-${currentLocale}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
