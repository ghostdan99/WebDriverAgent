import {type ReactNode, useEffect, useMemo, useState} from 'react';
import {affiliateLinkTarget, buildAffiliateUrl, type CtaIntent} from '../lib/affiliate';
import {track} from '../lib/analytics';
import {SpinnerIcon} from './Icons';

interface AffiliateLinkProps {
  // Where on the page the CTA lives, e.g. "header_join". Sent to analytics and, if enabled, as SubID.
  placement: string;
  intent: CtaIntent;
  className?: string;
  icon?: ReactNode;
  children: ReactNode;
}

/** The only component that renders outgoing sign-up / log-in links. */
export function AffiliateLink({placement, intent, className, icon, children}: AffiliateLinkProps) {
  const href = useMemo(() => buildAffiliateUrl(placement), [placement]);
  const target = affiliateLinkTarget();
  const [leaving, setLeaving] = useState(false);

  // Reset the busy state when the visitor comes back via the back button (bfcache).
  useEffect(() => {
    if (!leaving) {
      return;
    }
    const reset = () => setLeaving(false);
    window.addEventListener('pageshow', reset);
    const timeout = window.setTimeout(reset, 8000);
    return () => {
      window.removeEventListener('pageshow', reset);
      window.clearTimeout(timeout);
    };
  }, [leaving]);

  return (
    <a
      href={href}
      rel="sponsored noopener"
      {...target}
      className={className}
      data-affiliate-placement={placement}
      aria-busy={leaving || undefined}
      onClick={(event) => {
        track('affiliate_cta_click', {placement, intent});
        const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0;
        if (!target.target && !modified) {
          setLeaving(true);
        }
      }}
    >
      {leaving ? <SpinnerIcon /> : icon}
      <span>{children}</span>
    </a>
  );
}
