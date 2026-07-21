import React from 'react';
import {useEffect, useState} from 'react';
import HelpCenterAssistant from '@site/src/components/HelpCenterAssistant';

const ALLOWED_SOURCES = new Set(['odpm', 'iam']);
const SOURCE_STORAGE_KEY = 'oceanpayment-help-center-source';
const LOGIN_URL = 'https://iam.oceanpayment.com/login';

function isSourceAllowed(source) {
  return ALLOWED_SOURCES.has(String(source || '').toLowerCase());
}

export default function Root({children}) {
  const [authorized, setAuthorized] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get('source');

    if (isSourceAllowed(source)) {
      window.sessionStorage.setItem(SOURCE_STORAGE_KEY, source.toLowerCase());
      setAuthorized(true);
      return;
    }

    if (isSourceAllowed(window.sessionStorage.getItem(SOURCE_STORAGE_KEY))) {
      setAuthorized(true);
      return;
    }

    setAuthorized(false);
    window.location.replace(LOGIN_URL);
  }, []);

  if (!authorized) {
    return null;
  }

  return (
    <>
      {children}
      <HelpCenterAssistant />
    </>
  );
}
