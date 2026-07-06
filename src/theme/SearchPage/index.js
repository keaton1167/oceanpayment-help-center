import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {usePluralForm} from '@docusaurus/theme-common';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import useSearchQuery from '@easyops-cn/docusaurus-search-local/dist/client/client/theme/hooks/useSearchQuery';
import {
  fetchIndexesByWorker,
  searchByWorker,
} from '@easyops-cn/docusaurus-search-local/dist/client/client/theme/searchByWorker';
import {SearchDocumentType} from '@easyops-cn/docusaurus-search-local/dist/client/shared/interfaces';
import {highlight} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/highlight';
import {highlightStemmed} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/highlightStemmed';
import {getStemmedPositions} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/getStemmedPositions';
import {concatDocumentPath} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/concatDocumentPath';
import {
  Mark,
  searchContextByPaths,
  useAllContextsWithNoSearchContext,
} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/proxiedGenerated';
import {normalizeContextByPath} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/normalizeContextByPath';
import styles from './styles.module.css';

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.backIcon}
      focusable="false">
      <path
        d="M15.75 19.5 8.25 12l7.5-7.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function SearchPage() {
  return (
    <Layout>
      <SearchPageContent />
    </Layout>
  );
}

function SearchPageContent() {
  const {
    siteConfig: {baseUrl},
    i18n: {currentLocale},
  } = useDocusaurusContext();
  const {selectMessage} = usePluralForm();
  const {
    searchValue,
    searchContext,
    searchVersion,
    updateSearchPath,
    updateSearchContext,
  } = useSearchQuery();
  const [searchQuery, setSearchQuery] = useState(searchValue);
  const [searchResults, setSearchResults] = useState();
  const [searchWorkerReady, setSearchWorkerReady] = useState(false);
  const versionUrl = `${baseUrl}${searchVersion}`;
  const backLabel = currentLocale === 'en' ? 'Go back' : '返回上一页';
  const fallbackPath =
    currentLocale === 'en' ? `${baseUrl}en/docs/intro` : `${baseUrl}docs/intro`;
  const pageTitle = useMemo(
    () =>
      searchQuery
        ? translate(
            {
              id: 'theme.SearchPage.existingResultsTitle',
              message: 'Search results for "{query}"',
              description: 'The search page title for non-empty query',
            },
            {
              query: searchQuery,
            },
          )
        : translate({
            id: 'theme.SearchPage.emptyResultsTitle',
            message: 'Search the documentation',
            description: 'The search page title for empty query',
          }),
    [searchQuery],
  );

  useEffect(() => {
    updateSearchPath(searchQuery);

    if (searchQuery) {
      (async () => {
        const results = await searchByWorker(
          versionUrl,
          searchContext,
          searchQuery,
          100,
        );
        setSearchResults(results);
      })();
    } else {
      setSearchResults(undefined);
    }
  }, [searchQuery, versionUrl, searchContext, updateSearchPath]);

  useEffect(() => {
    if (searchValue && searchValue !== searchQuery) {
      setSearchQuery(searchValue);
    }
  }, [searchValue, searchQuery]);

  useEffect(() => {
    async function doFetchIndexes() {
      if (
        !Array.isArray(searchContextByPaths) ||
        searchContext ||
        useAllContextsWithNoSearchContext
      ) {
        await fetchIndexesByWorker(versionUrl, searchContext);
      }

      setSearchWorkerReady(true);
    }

    doFetchIndexes();
  }, [searchContext, versionUrl]);

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.assign(fallbackPath);
  }, [fallbackPath]);

  const handleSearchInputChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  return (
    <>
      <Head>
        <meta property="robots" content="noindex, follow" />
        <title>{pageTitle}</title>
      </Head>

      <div className="container margin-vert--lg">
        <button
          type="button"
          className={styles.backButton}
          onClick={handleBack}
          aria-label={backLabel}
          title={backLabel}>
          <BackIcon />
        </button>

        <h1>{pageTitle}</h1>

        <div className="row">
          <div
            className={clsx('col', {
              [styles.searchQueryColumn]: Array.isArray(searchContextByPaths),
              'col--9': Array.isArray(searchContextByPaths),
              'col--12': !Array.isArray(searchContextByPaths),
            })}>
            <input
              type="search"
              name="q"
              className={styles.searchQueryInput}
              aria-label="Search"
              onChange={handleSearchInputChange}
              value={searchQuery}
              autoComplete="off"
              autoFocus
            />
          </div>

          {Array.isArray(searchContextByPaths) ? (
            <div
              className={clsx(
                'col',
                'col--3',
                'padding-left--none',
                styles.searchContextColumn,
              )}>
              <select
                name="search-context"
                className={styles.searchContextInput}
                id="context-selector"
                value={searchContext}
                onChange={(event) => updateSearchContext(event.target.value)}>
                {useAllContextsWithNoSearchContext && (
                  <option value="">
                    {translate({
                      id: 'theme.SearchPage.searchContext.everywhere',
                      message: 'Everywhere',
                    })}
                  </option>
                )}

                {searchContextByPaths.map((context) => {
                  const {label, path} = normalizeContextByPath(
                    context,
                    currentLocale,
                  );

                  return (
                    <option key={path} value={path}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          ) : null}
        </div>

        {!searchWorkerReady && searchQuery && (
          <div className={styles.loadingState}>
            <span className={styles.loadingSpinner} aria-hidden="true" />
            <span>
              <Translate id="theme.SearchPage.loading" description="Search loading state">
                Loading search results...
              </Translate>
            </span>
          </div>
        )}

        {searchResults &&
          (searchResults.length > 0 ? (
            <p>
              {selectMessage(
                searchResults.length,
                translate(
                  {
                    id: 'theme.SearchPage.documentsFound.plurals',
                    message: '1 document found|{count} documents found',
                    description:
                      'Pluralized label for "{count} documents found".',
                  },
                  {count: searchResults.length},
                ),
              )}
            </p>
          ) : process.env.NODE_ENV === 'production' ? (
            <p>
              {translate({
                id: 'theme.SearchPage.noResultsText',
                message: 'No documents were found',
                description: 'The paragraph for empty search result',
              })}
            </p>
          ) : (
            <p>The search index is only available when you run docusaurus build!</p>
          ))}

        <section>
          {searchResults &&
            searchResults.map((item) => (
              <SearchResultItem key={item.document.i} searchResult={item} />
            ))}
        </section>
      </div>
    </>
  );
}

function SearchResultItem({
  searchResult: {document, type, page, tokens, metadata},
}) {
  const isTitle = type === SearchDocumentType.Title;
  const isKeywords = type === SearchDocumentType.Keywords;
  const isDescription = type === SearchDocumentType.Description;
  const isDescriptionOrKeywords = isDescription || isKeywords;
  const isTitleRelated = isTitle || isDescriptionOrKeywords;
  const isContent = type === SearchDocumentType.Content;
  const pathItems = (isTitle ? document.b : page.b).slice();
  const articleTitle = isContent || isDescriptionOrKeywords ? document.s : document.t;

  if (!isTitleRelated) {
    pathItems.push(page.t);
  }

  let search = '';

  if (Mark && tokens.length > 0) {
    const params = new URLSearchParams();

    for (const token of tokens) {
      params.append('_highlight', token);
    }

    search = `?${params.toString()}`;
  }

  return (
    <article className={styles.searchResultItem}>
      <h2>
        <Link
          to={document.u + search + (document.h || '')}
          dangerouslySetInnerHTML={{
            __html:
              isContent || isDescriptionOrKeywords
                ? highlight(articleTitle, tokens)
                : highlightStemmed(
                    articleTitle,
                    getStemmedPositions(metadata, 't'),
                    tokens,
                    100,
                  ),
          }}
        />
      </h2>

      {pathItems.length > 0 && (
        <p className={styles.searchResultItemPath}>
          {concatDocumentPath(pathItems)}
        </p>
      )}

      {(isContent || isDescription) && (
        <p
          className={styles.searchResultItemSummary}
          dangerouslySetInnerHTML={{
            __html: highlightStemmed(
              document.t,
              getStemmedPositions(metadata, 't'),
              tokens,
              100,
            ),
          }}
        />
      )}
    </article>
  );
}
