import type {RefObject} from 'react';
import {PROFILE} from '../config/profile';
import {SITE} from '../config/site';
import {ChatComposer} from './ChatComposer';
import {CloseIcon, LockIcon} from './Icons';
import styles from './ChatWidget.module.css';

interface ChatWidgetProps {
  available: boolean;
  variant?: 'inline' | 'floating';
  onClose?: () => void;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
}

export function ChatWidget({available, variant = 'inline', onClose, inputRef}: ChatWidgetProps) {
  const {availability} = PROFILE;
  const showStatus = availability.mode !== 'hidden';
  const offlineLabel = availability.mode === 'hidden' ? undefined : availability.offlineLabel;

  return (
    <div className={`card ${styles.chat}`} data-variant={variant}>
      <div className={styles.head}>
        <div className={styles.avatarWrap}>
          <img
            src={PROFILE.avatar.src}
            alt=""
            width={44}
            height={44}
            className={styles.avatar}
            loading="lazy"
          />
          {showStatus && available && <span className={styles.dot} aria-hidden="true" />}
        </div>
        <div className={styles.who}>
          <p className={styles.name}>{PROFILE.name}</p>
          {showStatus && (
            <p className={styles.status} data-online={available || undefined}>
              {available ? 'Available now' : (offlineLabel ?? `Replies on ${SITE.platformName}`)}
            </p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            className={`icon-btn ${styles.close}`}
            onClick={onClose}
            aria-label="Close chat"
          >
            <CloseIcon size={18} />
          </button>
        )}
      </div>

      <div className={styles.thread}>
        <p className={styles.sampleLabel}>Sample message</p>
        <div className={styles.bubbleRow}>
          <img
            src={PROFILE.avatar.src}
            alt=""
            width={28}
            height={28}
            className={styles.miniAvatar}
            loading="lazy"
          />
          <p className={styles.bubble}>{PROFILE.chatGreeting}</p>
        </div>
      </div>

      <ChatComposer source={variant} inputRef={inputRef} />
      <p className={styles.footnote}>
        <LockIcon size={13} />
        Chat happens on {SITE.platformName}. Nothing you type here is sent or stored.
      </p>
    </div>
  );
}
