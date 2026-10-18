import {useEffect} from 'react';
import styles from './Toast.module.css';

interface ToastProps {
  message: string | null;
  onDone: () => void;
}

export function Toast({message, onDone}: ToastProps) {
  useEffect(() => {
    if (!message) {
      return;
    }
    const id = window.setTimeout(onDone, 2800);
    return () => window.clearTimeout(id);
  }, [message, onDone]);

  return (
    <div className={styles.region} role="status" aria-live="polite">
      {message && (
        <p key={message} className={styles.toast}>
          {message}
        </p>
      )}
    </div>
  );
}
