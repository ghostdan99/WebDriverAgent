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
