import {SITE} from '../config/site';
import {BrandMark} from './Icons';
import styles from './Footer.module.css';

export function Footer() {
  const {legal} = SITE;
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <BrandMark size={18} />
          <span>{SITE.brandName}</span>
        </div>

        <section className={styles.disclosure} aria-labelledby="affiliate-disclosure">
          <h2 id="affiliate-disclosure" className={styles.disclosureTitle}>
            Affiliate disclosure
          </h2>
          <p>
            This page contains affiliate links. If you create an account through them, the creator
            of this page may earn a commission at no extra cost to you. Accounts, chat and
            subscriptions are provided by {SITE.platformName}, not by this website, and are subject
            to its own terms.
          </p>
          {SITE.isDemo && (
            <p>
              Profile details, figures and images on this page are placeholders for demonstration.
            </p>
          )}
        </section>

        <nav aria-label="Legal" className={styles.links}>
          <a href={legal.privacyUrl}>Privacy policy</a>
          <a href={legal.termsUrl}>Terms</a>
          {legal.contactEmail && <a href={`mailto:${legal.contactEmail}`}>Contact</a>}
        </nav>

        <p className={styles.small}>
          {SITE.ageGate.enabled && <span>{SITE.ageGate.minimumAge}+ only. </span>}©{' '}
          {new Date().getFullYear()} {SITE.brandName}
        </p>
      </div>
    </footer>
  );
}
