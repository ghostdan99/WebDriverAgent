import {type RefObject, useId, useRef, useState} from 'react';
import {PROFILE} from '../config/profile';
import {useRegistration} from '../context/registration';
import {track} from '../lib/analytics';
import {SendIcon} from './Icons';
import styles from './ChatWidget.module.css';

const MAX_HEIGHT = 132;

interface ChatComposerProps {
  source: 'inline' | 'floating';
  inputRef?: RefObject<HTMLTextAreaElement | null>;
}

/**
 * Demo composer: the text never leaves the browser. Sending opens the registration prompt and
 * only the fact that a send was attempted is tracked, never the message itself.
 */
export function ChatComposer({source, inputRef}: ChatComposerProps) {
  const id = useId();
  const openRegistration = useRegistration();
  const ownRef = useRef<HTMLTextAreaElement>(null);
  const ref = inputRef ?? ownRef;
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0;

  const attempt = () => {
    if (!canSend) {
      return;
    }
    track('chat_attempt', {source});
    openRegistration('chat');
  };

  const autosize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  };

  return (
    <form
      className={styles.composer}
      onSubmit={(event) => {
        event.preventDefault();
        attempt();
      }}
    >
      <label htmlFor={id} className="sr-only">
        Message to {PROFILE.name}
      </label>
      <textarea
        id={id}
        ref={ref}
        className={styles.input}
        rows={1}
        maxLength={1000}
        placeholder="Write a message…"
        autoComplete="off"
        enterKeyHint="send"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          autosize(event.target);
        }}
        onKeyDown={(event) => {
          // Enter sends, Shift+Enter adds a line; ignore Enter while an IME is composing text.
          const composing = event.nativeEvent.isComposing || event.keyCode === 229;
          if (event.key === 'Enter' && !event.shiftKey && !composing) {
            event.preventDefault();
            attempt();
          }
        }}
      />
      <button type="submit" className={styles.send} disabled={!canSend} aria-label="Send message">
        <SendIcon size={20} />
      </button>
    </form>
  );
}
