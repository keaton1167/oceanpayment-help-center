import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {translate} from '@docusaurus/Translate';
import {mergeSearchStrings, useHistorySelector} from '@docusaurus/theme-common';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';
import IconLanguage from '@theme/Icon/Language';
import styles from './styles.module.css';

function getLocalePath(locale) {
  return locale === 'en' ? '/en/docs/intro' : '/docs/intro';
}

function useLocaleDropdownUtils() {
  const {
    i18n: {localeConfigs},
  } = useDocusaurusContext();
  const search = useHistorySelector((history) => history.location.search);
  const hash = useHistorySelector((history) => history.location.hash);
  const pathname = useHistorySelector((history) => history.location.pathname);

  const getLocaleConfig = (locale) => {
    const localeConfig = localeConfigs[locale];
    if (!localeConfig) {
      throw new Error(`No locale config found for locale=${locale}`);
    }
    return localeConfig;
  };

  return {
    getURL: (locale, options) => {
      const finalSearch = mergeSearchStrings(
        [search, options.queryString],
        'append',
      );
      return `pathname://${getLocalePath(locale)}${finalSearch}${hash}`;
    },
    getLabel: (locale) => getLocaleConfig(locale).label,
    getLang: (locale) => getLocaleConfig(locale).htmlLang,
  };
}

export default function LocaleDropdownNavbarItem({
  mobile,
  dropdownItemsBefore = [],
  dropdownItemsAfter = [],
  queryString,
  ...props
}) {
  const utils = useLocaleDropdownUtils();
  const {
    i18n: {currentLocale, locales},
  } = useDocusaurusContext();

  const localeItems = locales.map((locale) => ({
    label: utils.getLabel(locale),
    lang: utils.getLang(locale),
    to: utils.getURL(locale, {queryString}),
    target: '_self',
    autoAddBaseUrl: false,
    className:
      locale === currentLocale
        ? mobile
          ? 'menu__link--active'
          : 'dropdown__link--active'
        : '',
  }));

  const dropdownLabel = mobile
    ? translate({
        message: 'Languages',
        id: 'theme.navbar.mobileLanguageDropdown.label',
        description: 'The label for the mobile language switcher dropdown',
      })
    : utils.getLabel(currentLocale);

  return (
    <DropdownNavbarItem
      {...props}
      mobile={mobile}
      label={
        <>
          <IconLanguage className={styles.iconLanguage} />
          {dropdownLabel}
        </>
      }
      items={[...dropdownItemsBefore, ...localeItems, ...dropdownItemsAfter]}
    />
  );
}
