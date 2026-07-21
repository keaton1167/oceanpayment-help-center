import React, {useMemo} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {liteClient as algoliasearch} from 'algoliasearch/lite';
import {
  Chat,
  ChatTrigger,
  Configure,
  DisplayResultsToolType,
  InstantSearch,
  RecommendToolType,
  SearchIndexToolType,
} from 'react-instantsearch';
import styles from './styles.module.css';

const SUPPORT_COPY = {
  'zh-Hans': {
    title: 'Oceanpayment \u5E2E\u52A9\u4E2D\u5FC3',
    welcomeText: '\u60A8\u597D\uFF0C\u8BF7\u8F93\u5165\u60A8\u7684\u95EE\u9898\u3002\u6211\u4F1A\u57FA\u4E8E\u5E2E\u52A9\u4E2D\u5FC3\u5185\u5BB9\u4E3A\u60A8\u63D0\u4F9B\u53C2\u8003\u3002',
    translations: {
      header: {
        clearLabel: '\u6E05\u7A7A',
        closeLabel: '\u5173\u95ED\u667A\u80FD\u5BA2\u670D',
        maximizeLabel: '\u5168\u5C4F\u663E\u793A',
        minimizeLabel: '\u9000\u51FA\u5168\u5C4F',
        title: 'Oceanpayment \u5E2E\u52A9\u4E2D\u5FC3',
      },
      messages: {
        copyToClipboardLabel: '\u590D\u5236\u56DE\u7B54',
        feedbackThankYouText: '\u611F\u8C22\u60A8\u7684\u53CD\u9988',
        regenerateLabel: '\u91CD\u65B0\u751F\u6210',
        scrollToBottomLabel: '\u56DE\u5230\u6700\u65B0\u6D88\u606F',
        thumbsDownLabel: '\u4E0D\u6EE1\u610F',
        thumbsUpLabel: '\u6EE1\u610F',
      },
      prompt: {
        disclaimer: 'AI \u56DE\u7B54\u4EC5\u4F9B\u53C2\u8003\uFF0C\u8BF7\u4EE5\u5E2E\u52A9\u4E2D\u5FC3\u5185\u5BB9\u4E3A\u51C6\u3002',
        emptyMessageTooltip: '\u8BF7\u8F93\u5165\u95EE\u9898',
        sendMessageTooltip: '\u53D1\u9001\u95EE\u9898',
        stopResponseTooltip: '\u505C\u6B62\u751F\u6210',
        textareaLabel: '\u8F93\u5165\u60A8\u7684\u95EE\u9898',
        textareaPlaceholder: '\u8BF7\u8F93\u5165\u60A8\u7684\u95EE\u9898',
      },
    },
  },
  en: {
    title: 'Oceanpayment Help Center',
    welcomeText: 'Welcome to Oceanpayment Help Center. Please enter your question below.',
    translations: {
      header: {
        clearLabel: 'Clear',
        closeLabel: 'Close support chat',
        maximizeLabel: 'Maximize',
        minimizeLabel: 'Exit full screen',
        title: 'Oceanpayment Help Center',
      },
      messages: {
        copyToClipboardLabel: 'Copy response',
        feedbackThankYouText: 'Thank you for your feedback',
        regenerateLabel: 'Regenerate',
        scrollToBottomLabel: 'Scroll to latest message',
        thumbsDownLabel: 'Not helpful',
        thumbsUpLabel: 'Helpful',
      },
      prompt: {
        disclaimer: 'AI responses are for reference. Please rely on Help Center content.',
        emptyMessageTooltip: 'Enter a question',
        sendMessageTooltip: 'Send question',
        stopResponseTooltip: 'Stop generating',
        textareaLabel: 'Enter your question',
        textareaPlaceholder: 'Enter your question',
      },
    },
  },
};

function SupportIcon({isOpen}) {
  return isOpen ? (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 6.75A3.75 3.75 0 0 1 8.75 3h6.5A3.75 3.75 0 0 1 19 6.75v4.5A3.75 3.75 0 0 1 15.25 15H12l-4.25 3v-3H8.75A3.75 3.75 0 0 1 5 11.25v-4.5Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M8.5 9h7M8.5 11.5h4.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function HeaderIcon() {
  const faviconUrl = useBaseUrl('/img/favicon.ico');

  return <img className={styles.headerMark} src={faviconUrl} alt="" />;
}

function WelcomeState({copy}) {
  return (
    <div className={styles.welcome}>
      <p>{copy.welcomeText}</p>
    </div>
  );
}

function HiddenSearchResults() {
  return null;
}

const chatTools = {
  [SearchIndexToolType]: {layoutComponent: HiddenSearchResults},
  [RecommendToolType]: {layoutComponent: HiddenSearchResults},
  [DisplayResultsToolType]: {layoutComponent: HiddenSearchResults},
};

export default function HelpCenterAssistant() {
  const {
    i18n: {currentLocale},
    siteConfig: {customFields},
  } = useDocusaurusContext();
  const algolia = customFields.algolia || {};
  const {applicationId, searchApiKey, indexName, agentId} = algolia;
  const copy = SUPPORT_COPY[currentLocale] || SUPPORT_COPY['zh-Hans'];
  const searchClient = useMemo(
    () =>
      applicationId && searchApiKey
        ? algoliasearch(applicationId, searchApiKey)
        : null,
    [applicationId, searchApiKey],
  );

  if (!searchClient || !indexName || !agentId) {
    return null;
  }

  const EmptyState = (props) => <WelcomeState {...props} copy={copy} />;
  return (
    <div className={styles.assistant} lang={currentLocale}>
      <InstantSearch indexName={indexName} searchClient={searchClient}>
        <Configure filters={`locale:${currentLocale}`} />
        <Chat
          agentId={agentId}
          tools={chatTools}
          title={copy.title}
          headerTitleIconComponent={HeaderIcon}
          messagesProps={{emptyComponent: EmptyState}}
          promptProps={{maxRows: 4}}
          translations={copy.translations}
        />
        <ChatTrigger
          aria-label={copy.title}
          title={copy.title}
          toggleIconComponent={SupportIcon}
        />
      </InstantSearch>
    </div>
  );
}
