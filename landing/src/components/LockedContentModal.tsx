import {useId, useState} from 'react';
import {COPY} from '../config/copy';
import {PROFILE} from '../config/profile';
import {SITE} from '../config/site';
import type {RegistrationReason} from '../lib/analytics';
import {AffiliateLink} from './AffiliateLink';
import {ChatIcon, CloseIcon, LockIcon, PlusIcon} from './Icons';
import {Modal} from './Modal';
import styles from './LockedContentModal.module.css';

interface Copy {
  title: string;
  body: string;
  join: string;
}

function copyFor(reason: RegistrationReason): Copy {
  const {name} = PROFILE;
  const platform = SITE.platformName;
  switch (reason) {
    case 'chat':
      return {
        title: `Chat with ${name} on ${platform}`,
        body: `Create ${COPY.anAccount} on ${platform} to start a conversation. Your message has not been sent yet.`,
        join: COPY.registerToChat,
      };
    case 'follow':
      return {
        title: `Follow ${name} on ${platform}`,
        body: `Following and new-post notifications are handled on ${platform}. Create ${COPY.anAccount} to follow ${name}.`,
        join: COPY.createAccount,
      };
    default:
      return {
        title: 'This content is locked',
        body: `${name}'s full photo sets, videos and messages are on ${platform}. Create ${COPY.anAccount} to unlock the full profile${COPY.forFree}.`,
        join: COPY.createAccount,
      };
  }
}

interface LockedContentModalProps {
  reason: RegistrationReason | null;
  onClose: () => void;
}

/** The registration prompt shared by locked photos, videos, chat and follow. */
export function LockedContentModal({reason, onClose}: LockedContentModalProps) {
  const titleId = useId();
  const bodyId = useId();
  // Keep showing the last reason while the exit animation runs.
  const [lastReason, setLastReason] = useState<RegistrationReason>(reason ?? 'photo');
  if (reason && reason !== lastReason) {
    setLastReason(reason);
  }
  const shown = reason ?? lastReason;
  const copy = copyFor(shown);
  const BadgeIcon = shown === 'chat' ? ChatIcon : shown === 'follow' ? PlusIcon : LockIcon;

  return (
    <Modal open={reason !== null} onClose={onClose} labelledBy={titleId} describedBy={bodyId}>
      <button
        type="button"
        className={`icon-btn ${styles.close}`}
        onClick={onClose}
        aria-label="Close"
      >
        <CloseIcon />
      </button>
      <div className={styles.content}>
        <div className={styles.visual} aria-hidden="true">
          <img src={PROFILE.avatar.src} alt="" width={88} height={88} className={styles.avatar} />
          <span className={styles.badge}>
            <BadgeIcon size={18} />
          </span>
        </div>
        <h2 id={titleId} className={styles.title}>
          {copy.title}
        </h2>
        <p id={bodyId} className={styles.body}>
          {copy.body}
        </p>
        <div className={styles.actions}>
          <AffiliateLink
            placement={`modal_${shown}_join`}
            intent="join"
            className="btn btn-primary btn-block"
          >
            {copy.join}
          </AffiliateLink>
          <AffiliateLink
            placement={`modal_${shown}_login`}
            intent="login"
            className="btn btn-secondary btn-block"
          >
            Log in
          </AffiliateLink>
        </div>
      </div>
    </Modal>
  );
}
