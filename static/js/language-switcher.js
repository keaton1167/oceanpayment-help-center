(function() {
  'use strict';

  var scriptEl = document.currentScript;
  var siteBase = '/';

  if (scriptEl && scriptEl.src) {
    try {
      var scriptPath = new URL(scriptEl.src, window.location.href).pathname;
      siteBase = scriptPath.replace(/(?:en\/)?js\/language-switcher\.js$/, '');
      if (!siteBase) siteBase = '/';
    } catch (error) {
      siteBase = '/';
    }
  }

  var translatedDocIds = makeSet([
    'customer-service/customer-service-faq/multiple-account-logins',
    'customer-service/customer-service-faq/reset-oceanpayment-dashboard-password',
    'payment-faq/account-transfer/account-funds-and-reconciliation',
    'payment-faq/account-transfer/successful-transaction-settlement',
    'payment-faq/common-questions/chargeback-fraud-retrieval-orders',
    'payment-faq/common-questions/high-risk-order-alert-email',
    'payment-faq/common-questions/ideal-merchant-operation-notes',
    'payment-faq/common-questions/klarna-consumer-bill-sample',
    'payment-faq/common-questions/klarna-norway-market-update',
    'payment-faq/common-questions/payment-declined-10000-risk-control',
    'payment-faq/common-questions/uk-klarna-advertising-requirements',
    'payment-faq/common-questions/visa-mastercard-refund-rules-update',
    'payment-faq/common-questions/risky-successful-transaction-handling',
    'payment-faq/common-questions/credit-card-channel-supported-currencies',
    'payment-faq/common-questions/merchant-fund-settlement-at-oceanpayment',
    'payment-faq/common-questions/currency-conversion-in-transaction-settlement',
    'payment-faq/common-questions/supported-settlement-currencies',
    'payment-faq/common-questions/klarna-dispute-lifecycle',
    'payment-faq/common-questions/klarna-dispute-improvement-guide',
    'compliance-certification/access-compliance/prohibited-and-restricted-businesses',
    'products-services/oceanpayment-products/available-payment-products',
    'products-services/oceanpayment-products/support-mobile-payment',
    'products-services/oceanpayment-products/support-shopify-or-other-platforms',
    'products-services/oceanpayment-products/activate-new-payment-method-pricing',
    'products-services/oceanpayment-products/oceanpayment-recurring-introduction',
    'customer-service/customer-service-faq/oceanpayment-complaints-and-suggestions-contact',
    'payment-faq/info-update/japan-credit-card-security-guidelines-5',
    'payment-faq/info-update/mastercard-chargeback-assessment-criteria',
    'payment-faq/info-update/mastercard-chargeback-reason-update',
    'payment-faq/info-update/visa-vamp-policy',
    'op-card-faq/terms-conditions/terms-and-conditions'
  ]);

  var enSectionFallbacks = {
    'compliance-certification/access-compliance':
      'compliance-certification/access-compliance/prohibited-and-restricted-businesses',
    'customer-service/customer-service-faq':
      'customer-service/customer-service-faq/multiple-account-logins',
    'op-card-faq/terms-conditions':
      'op-card-faq/terms-conditions/terms-and-conditions',
    'odpm-guide/section-guide':
      'odpm-guide/section-guide/digital-platform-guidelines-manual',
    'payment-faq/account-transfer':
      'payment-faq/account-transfer/account-funds-and-reconciliation',
    'payment-faq/common-questions':
      'payment-faq/common-questions/visa-mastercard-refund-rules-update',
    'payment-faq/info-update':
      'payment-faq/info-update/mastercard-chargeback-assessment-criteria',
    'products-services/oceanpayment-products':
      'products-services/oceanpayment-products/oceanpayment-recurring-introduction'
  };

  var zhSectionFallbacks = {
    'compliance-certification/access-compliance':
      'compliance-certification/access-compliance/prohibited-and-restricted-businesses',
    'customer-service/customer-service-faq':
      'customer-service/customer-service-faq/oceanpayment-complaints-and-suggestions-contact',
    'odpm-guide/section-guide':
      'odpm-guide/section-guide/account-application-guide',
    'op-card-faq/terms-conditions':
      'op-card-faq/terms-conditions/terms-and-conditions',
    'payment-faq/account-transfer':
      'payment-faq/account-transfer/opccount-platform-manual',
    'payment-faq/common-questions':
      'payment-faq/common-questions/merchant-fund-settlement-at-oceanpayment',
    'payment-faq/info-update':
      'payment-faq/info-update/trustly-pis-exits-spain',
    'products-services/oceanpayment-products':
      'products-services/oceanpayment-products/available-payment-products'
  };

  function makeSet(values) {
    return values.reduce(function(set, value) {
      set[value] = true;
      return set;
    }, {});
  }

  function trimSlashes(value) {
    return String(value || '').replace(/^\/+|\/+$/g, '');
  }

  function stripSiteBase(pathname) {
    var base = siteBase.replace(/\/$/, '');
    if (base && base !== '/' && pathname.indexOf(base + '/') === 0) {
      return pathname.slice(base.length + 1);
    }
    return pathname.replace(/^\//, '');
  }

  function getCurrentRoute() {
    var path = stripSiteBase(window.location.pathname);
    var locale = 'zh-Hans';
    var docId = 'intro';

    if (path.indexOf('en/docs/') === 0) {
      locale = 'en';
      docId = trimSlashes(path.slice('en/docs/'.length));
    } else if (path.indexOf('docs/') === 0) {
      docId = trimSlashes(path.slice('docs/'.length));
    }

    docId = docId.replace(/\/index(?:\.html)?$/, '') || 'intro';
    return {locale: locale, docId: docId};
  }

  function buildDocUrl(locale, docId) {
    var prefix = locale === 'en' ? 'en/docs/' : 'docs/';
    return siteBase.replace(/\/?$/, '/') + prefix + trimSlashes(docId || 'intro');
  }

  function findSectionFallback(docId, fallbacks) {
    var parts = trimSlashes(docId).split('/');

    while (parts.length > 1) {
      parts.pop();
      var section = parts.join('/');
      if (fallbacks[section]) {
        return fallbacks[section];
      }
    }

    return 'intro';
  }

  function resolveTarget(current, targetLocale) {
    if (current.locale === targetLocale) {
      return {
        docId: current.docId,
        isExact: true
      };
    }

    if (current.docId === 'intro') {
      return {
        docId: 'intro',
        isExact: true
      };
    }

    if (translatedDocIds[current.docId]) {
      return {
        docId: current.docId,
        isExact: true
      };
    }

    return {
      docId: findSectionFallback(
        current.docId,
        targetLocale === 'en' ? enSectionFallbacks : zhSectionFallbacks
      ),
      isExact: false
    };
  }

  function patchLocaleLinks() {
    var current = getCurrentRoute();
    document.querySelectorAll('a.dropdown__link[lang]').forEach(function(link) {
      var lang = link.getAttribute('lang');
      if (lang !== 'en' && lang !== 'zh-Hans') return;

      var target = resolveTarget(current, lang);
      var href = buildDocUrl(lang, target.docId);
      if (link.getAttribute('href') !== href) {
        link.setAttribute('href', href);
      }

      if (target.isExact) {
        if (link.hasAttribute('title')) {
          link.removeAttribute('title');
        }
      } else {
        var title =
          lang === 'en'
            ? 'No exact English version yet; opens the related help section.'
            : '暂无精确中文版本，将打开对应帮助目录。';
        if (link.getAttribute('title') !== title) {
          link.setAttribute('title', title);
        }
      }
    });
  }

  function patchBeforeLocaleClick(event) {
    var link = event.target && event.target.closest
      ? event.target.closest('a.dropdown__link[lang]')
      : null;
    if (!link) return;
    var lang = link.getAttribute('lang');
    if (lang !== 'en' && lang !== 'zh-Hans') return;
    var target = resolveTarget(getCurrentRoute(), lang);
    link.setAttribute('href', buildDocUrl(lang, target.docId));
  }

  function schedulePatch() {
    window.requestAnimationFrame(function() {
      patchLocaleLinks();
    });
  }

  function wrapHistoryMethod(name) {
    var original = window.history[name];
    window.history[name] = function() {
      var result = original.apply(this, arguments);
      schedulePatch();
      return result;
    };
  }

  document.addEventListener('DOMContentLoaded', schedulePatch);
  document.addEventListener('click', patchBeforeLocaleClick, true);
  window.addEventListener('popstate', schedulePatch);
  wrapHistoryMethod('pushState');
  wrapHistoryMethod('replaceState');

  new MutationObserver(schedulePatch).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
