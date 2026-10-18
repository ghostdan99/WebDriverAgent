import {type ReactNode, type RefObject, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {useScrollLock} from '../hooks/useScrollLock';
import styles from './Modal.module.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
const EXIT_MS = 180;

interface ModalProps {
  open: boolean;
  // Omit to make the dialog non-dismissible (no Escape, no backdrop click), e.g. for the age gate.
  onClose?: () => void;
  labelledBy: string;
  describedBy?: string;
  initialFocus?: RefObject<HTMLElement | null>;
  className?: string;
  children: ReactNode;
}

export function Modal(props: ModalProps) {
  const [mounted, setMounted] = useState(props.open);
  const [closing, setClosing] = useState(false);
  const [prevOpen, setPrevOpen] = useState(props.open);

  if (props.open !== prevOpen) {
    setPrevOpen(props.open);
    if (props.open) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
    }
  }

  useEffect(() => {
    if (!closing) {
      return;
    }
    const id = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, EXIT_MS);
    return () => window.clearTimeout(id);
  }, [closing]);

  if (!mounted) {
    return null;
  }
  return createPortal(<ModalSurface {...props} closing={closing} />, document.body);
}

function ModalSurface({
  onClose,
  labelledBy,
  describedBy,
  initialFocus,
  className,
  children,
  closing,
}: ModalProps & {closing: boolean}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const pressStartedOnBackdrop = useRef(false);
  const onCloseRef = useRef(onClose);
  useScrollLock(true);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Make the rest of the page inert, move focus in, and give focus back to the trigger on close.
  // The trigger is read before anything becomes inert, because inert content loses focus.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const isolated = Array.from(document.body.children).filter(
      (el) => el !== overlayRef.current && !el.hasAttribute('inert'),
    );
    isolated.forEach((el) => el.setAttribute('inert', ''));
    const target = initialFocus?.current ?? dialogRef.current;
    target?.focus({preventScroll: true});
    return () => {
      isolated.forEach((el) => el.removeAttribute('inert'));
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus({preventScroll: true});
      }
    };
  }, [initialFocus]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }
      if (event.key === 'Escape' && onCloseRef.current) {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') {
        return;
      }
      const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === dialog || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, []);

  return (
    // The backdrop is a pointer-only shortcut; keyboard users close with Escape or the close button.
    <div
      ref={overlayRef}
      role="presentation"
      className={styles.overlay}
      data-state={closing ? 'closing' : 'open'}
      onPointerDown={(event) => {
        pressStartedOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (onClose && pressStartedOnBackdrop.current && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={`${styles.dialog} ${className ?? ''}`}
      >
        {children}
      </div>
    </div>
  );
}
