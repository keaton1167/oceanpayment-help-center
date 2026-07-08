import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {usePluralForm} from '@docusaurus/theme-common';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import useSearchQuery from '@easyops-cn/docusaurus-search-local/dist/client/client/theme/hooks/useSearchQuery';
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

const searchIndexCache = new Map();
const SEARCH_INDEX_BASENAME = 'search-index';

function getQueryFromLocation() {
  if (typeof window === 'undefined') {
    return '';
  }

  return new URLSearchParams(window.location.search).get('q') ?? '';
}

function replaceQueryInLocation(searchQuery) {
  if (typeof window === 'undefined') {
    return;
  }

  const currentQuery = getQueryFromLocation();

  if (currentQuery === searchQuery) {
    return;
  }

  const params = new URLSearchParams(window.location.search);

  if (searchQuery) {
    params.set('q', searchQuery);
  } else {
    params.delete('q');
  }

  const nextSearch = params.toString();
  const nextUrl = `${window.location.pathname}${
    nextSearch ? `?${nextSearch}` : ''
  }${window.location.hash}`;

  window.history.replaceState(null, '', nextUrl);
}

async function loadSearchDocuments(baseUrl, searchContext) {
  const cacheKey = `${baseUrl}${searchContext}`;

  if (searchIndexCache.has(cacheKey)) {
    return searchIndexCache.get(cacheKey);
  }

  const url = `${baseUrl}${SEARCH_INDEX_BASENAME}${
    searchContext ? `-${searchContext.replace(/\//g, '-')}` : ''
  }.json`;

  const indexPromise = (async () => {
    const response = await fetch(url);
    return response.json();
  })();

  searchIndexCache.set(cacheKey, indexPromise);
  return indexPromise;
}

function findPositions(content, token) {
  const positions = [];
  const lowerContent = content.toLowerCase();
  const lowerToken = token.toLowerCase();
  let index = lowerContent.indexOf(lowerToken);

  while (index >= 0) {
    positions.push([index, token.length]);
    index = lowerContent.indexOf(lowerToken, index + token.length);
  }

  return positions;
}

function createMetadata(content, token) {
  const positions = findPositions(content, token);

  return positions.length > 0
    ? {
        [token]: {
          t: {
            position: positions,
          },
        },
      }
    : {};
}

function getMatchRank(document, page, query) {
  const title = document.t ?? '';
  const description = document.s ?? '';
  const pageTitle = page?.t ?? '';
  const text = `${title} ${description} ${pageTitle}`.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (title.toLowerCase().includes(lowerQuery)) {
    return 0;
  }

  if (pageTitle.toLowerCase().includes(lowerQuery)) {
    return 1;
  }

  if (description.toLowerCase().includes(lowerQuery)) {
    return 2;
  }

  if (text.includes(lowerQuery)) {
    return 3;
  }

  return title.toLowerCase().includes(lowerQuery) ? 4 : 5;
}

async function runSearch(baseUrl, searchContext, input, limit) {
  const query = input.trim();

  if (!query) {
    return [];
  }

  const indexes = await loadSearchDocuments(baseUrl, searchContext);
  const titleDocuments = indexes[SearchDocumentType.Title]?.documents ?? [];
  const titleById = new Map(titleDocuments.map((document) => [document.i, document]));
  const results = [];
  const seenKeys = new Set();
  const lowerQuery = query.toLowerCase();

  for (const [type, {documents}] of indexes.entries()) {
    for (const document of documents) {
      const page = type === SearchDocumentType.Title ? document : titleById.get(document.p);
      const searchableText = [
        document.t,
        document.s,
        page?.t,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!searchableText.includes(lowerQuery)) {
        continue;
      }

      const key =
        type === SearchDocumentType.Title
          ? `title:${document.i}`
          : `${type}:${document.i}`;

      if (seenKeys.has(key)) {
        continue;
      }

      seenKeys.add(key);
      results.push({
        document,
        type,
        page,
        metadata: createMetadata(`${document.s ?? ''} ${document.t ?? ''}`, query),
        tokens: [query],
        score: getMatchRank(document, page, query),
      });

      if (results.length >= limit * 2) {
        break;
      }
    }
  }

  return results.sort((a, b) => a.score - b.score).slice(0, limit);
}

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
    updateSearchContext,
  } = useSearchQuery();
  const [searchQuery, setSearchQuery] = useState(() => getQueryFromLocation() || searchValue || '');
  const [searchResults, setSearchResults] = useState();
  const [hasHydratedQuery, setHasHydratedQuery] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
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
    const locationQuery = getQueryFromLocation();
    const nextQuery = locationQuery || searchValue || '';

    setSearchQuery((currentQuery) =>
      currentQuery === nextQuery ? currentQuery : nextQuery,
    );
    setHasHydratedQuery(true);
  }, [searchValue]);

  useEffect(() => {
    if (!hasHydratedQuery) {
      return undefined;
    }

    replaceQueryInLocation(searchQuery);

    if (searchQuery) {
      let cancelled = false;
      setIsSearching(true);

      (async () => {
        try {
          const results = await runSearch(
            versionUrl,
            searchContext,
            searchQuery,
            100,
          );

          if (!cancelled) {
            setSearchResults(results);
            setIsSearching(false);
          }
        } catch (error) {
          if (!cancelled) {
            setSearchResults([]);
            setIsSearching(false);
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    } else {
      setSearchResults(undefined);
      setIsSearching(false);
    }
    return undefined;
  }, [
    hasHydratedQuery,
    searchQuery,
    versionUrl,
    searchContext,
  ]);

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

        {isSearching && searchQuery && (
          <div className={styles.loadingState}>
            <span className={styles.loadingSpinner} aria-hidden="true" />
            <span>
              <Translate id="theme.SearchPage.loading" description="Search loading state">
                Loading search results...
              </Translate>
            </span>
          </div>
        )}

        {!isSearching &&
          searchResults &&
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
          {!isSearching &&
            searchResults &&
            searchResults.map((item) => (
              <SearchResultItem
                key={`${item.type}:${item.document.i}`}
                searchResult={item}
              />
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
  const pageDocument = isTitle ? document : page;
  const pathItems = (pageDocument?.b ?? []).slice();
  const articleTitle =
    (isContent || isDescriptionOrKeywords ? document.s : document.t) ||
    pageDocument?.t ||
    document.t;
  const titlePositions = getStemmedPositions(metadata, 't');

  if (!articleTitle) {
    return null;
  }

  if (!isTitleRelated && page?.t) {
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
              titlePositions.length > 0
                ? highlightStemmed(articleTitle, titlePositions, tokens, 100)
                : highlight(articleTitle, tokens),
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
            __html:
              titlePositions.length > 0
                ? highlightStemmed(document.t, titlePositions, tokens, 100)
                : highlight(document.t, tokens),
          }}
        />
      )}
    </article>
  );
}
