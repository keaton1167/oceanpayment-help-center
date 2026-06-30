import React from 'react';
import {Redirect} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function Home() {
  const {i18n} = useDocusaurusContext();
  const docsIntroPath =
    i18n.currentLocale === i18n.defaultLocale ? '/docs/intro' : '/en/docs/intro';

  return <Redirect to={useBaseUrl(docsIntroPath)} />;
}
