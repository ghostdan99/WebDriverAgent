import type {RefObject} from 'react';
import {COPY} from '../config/copy';
import {PROFILE} from '../config/profile';
import type {Presence} from '../lib/availability';
import {ChatComposer} from './ChatComposer';
import {CloseIcon, LockIcon} from './Icons';
import styles from './ChatWidget.module.css';

interface ChatWidgetProps {
  presence: Presence;
  variant?: 'inline' | 'floating';
  onClose?: () => void;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
}

export function ChatWidget({presence, variant = 'inline', onClose, inputRef}: ChatWidgetProps) {
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
          {presence.available && <span className={styles.dot} aria-hidden="true" />}
        </div>
        <div className={styles.who}>
          <p className={styles.name}>{PROFILE.name}</p>
          {presence.label && (
            <p className={styles.status} data-online={presence.available || undefined}>
              {presence.label}
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
        {COPY.chatNote}
      </p>
    </div>
  );
}
