import {useId} from 'react';
import {SITE} from '../config/site';
import {BrandMark} from './Icons';
import {Modal} from './Modal';
import styles from './AgeGate.module.css';

const STORAGE_KEY = 'age-gate-confirmed-at';

export function isAgeConfirmed(read: (key: string) => string | null): boolean {
  if (!SITE.ageGate.enabled) {
    return true;
  }
  const confirmedAt = Number(read(STORAGE_KEY));
  const maxAge = SITE.ageGate.rememberDays * 24 * 60 * 60 * 1000;
  return Number.isFinite(confirmedAt) && confirmedAt > 0 && Date.now() - confirmedAt < maxAge;
}

export const AGE_GATE_STORAGE_KEY = STORAGE_KEY;

interface AgeGateProps {
  open: boolean;
  onConfirm: () => void;
}

export function AgeGate({open, onConfirm}: AgeGateProps) {
  const titleId = useId();
  const bodyId = useId();
  const age = SITE.ageGate.minimumAge;

  return (
    <Modal open={open} labelledBy={titleId} describedBy={bodyId} className={styles.gate}>
      <div className={styles.content}>
        <span className={styles.brand}>
          <BrandMark size={20} />
          {SITE.brandName}
        </span>
        <span className={styles.age} aria-hidden="true">
          {age}+
        </span>
        <h2 id={titleId} className={styles.title}>
          Adults only
        </h2>
        <p id={bodyId} className={styles.body}>
          This page links to a platform with content intended for adults. Please confirm that you
          are at least {age} years old and that viewing such content is legal where you live.
        </p>
        <div className={styles.actions}>
          <button type="button" className="btn btn-primary btn-block" onClick={onConfirm}>
            I am {age} or older
          </button>
          <a className="btn btn-ghost btn-block" href={SITE.ageGate.exitUrl} rel="noopener">
            Leave
          </a>
        </div>
      </div>
    </Modal>
  );
}
