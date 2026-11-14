'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

export function QuotaBanner() {
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const triggerQuota = () => setQuotaExceeded(true);

    const prevAuthFailure = window.gm_authFailure;
    window.gm_authFailure = () => {
      triggerQuota();
      if (typeof prevAuthFailure === 'function') prevAuthFailure();
    };

    const origConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = args.map((a) => String(a ?? '')).join(' ');
      if (
        msg.includes('OverQuotaMapError') ||
        msg.includes('QuotaExceededError') ||
        msg.includes('RESOURCE_EXHAUSTED')
      ) {
        triggerQuota();
      }
      origConsoleError.apply(console, args);
    };

    window.addEventListener('gmp-quota-exceeded', triggerQuota);

    return () => {
      console.error = origConsoleError;
      window.removeEventListener('gmp-quota-exceeded', triggerQuota);
    };
  }, []);

  if (!quotaExceeded) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-[100] w-full border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-amber-950 shadow-sm"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setQuotaExceeded(false)}
          className="rounded p-1 hover:bg-amber-100"
          aria-label="Dismiss quota notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
