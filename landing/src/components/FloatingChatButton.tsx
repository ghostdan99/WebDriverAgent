import {type CSSProperties, useEffect, useId, useRef, useState} from 'react';
import {PROFILE} from '../config/profile';
import {useKeyboardInset} from '../hooks/useKeyboardInset';
import type {Presence} from '../lib/availability';
import {ChatWidget} from './ChatWidget';
import {ChatIcon, CloseIcon} from './Icons';
import styles from './FloatingChatButton.module.css';

interface FloatingChatButtonProps {
  presence: Presence;
  // Hidden while the inline chat is on screen or an overlay covers the page.
  hidden: boolean;
}

export function FloatingChatButton({presence, hidden}: FloatingChatButtonProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const keyboardInset = useKeyboardInset(open);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus({preventScroll: true});
    }
  }, [open]);

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus({preventScroll: true});
  };

  return (
    <div
      className={styles.root}
      data-hidden={(hidden && !open) || undefined}
      data-keyboard={keyboardInset > 0 || undefined}
      style={{'--kb': `${keyboardInset}px`} as CSSProperties}
    >
      {open && (
        // Escape closes the panel while focus is inside it, as with any dialog.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <div
          id={panelId}
          role="dialog"
          aria-label={`Chat with ${PROFILE.name}`}
          className={styles.panel}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              close();
            }
          }}
        >
          <ChatWidget variant="floating" presence={presence} onClose={close} inputRef={inputRef} />
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        className={styles.fab}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? 'Close chat' : `Chat with ${PROFILE.name}`}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {open ? <CloseIcon size={22} /> : <ChatIcon size={24} />}
        {presence.available && !open && <span className={styles.fabDot} aria-hidden="true" />}
      </button>
    </div>
  );
}
