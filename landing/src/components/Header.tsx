import {useEffect, useState} from 'react';
import {SITE} from '../config/site';
import {AffiliateLink} from './AffiliateLink';
import {BrandMark} from './Icons';
import styles from './Header.module.css';

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={styles.header} data-scrolled={scrolled || undefined}>
      <div className={`container ${styles.inner}`}>
        <a href="#top" className={styles.logo} aria-label={`${SITE.brandName}, back to top`}>
          <BrandMark size={22} className={styles.mark} />
          <span className={styles.wordmark}>{SITE.brandName}</span>
        </a>
        <nav className={styles.actions} aria-label="Account">
          <AffiliateLink placement="header_login" intent="login" className="btn btn-ghost btn-sm">
            Log in
          </AffiliateLink>
          <AffiliateLink placement="header_join" intent="join" className="btn btn-primary btn-sm">
            Join
          </AffiliateLink>
        </nav>
      </div>
    </header>
  );
}
