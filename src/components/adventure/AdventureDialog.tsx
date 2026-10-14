'use client';

import {
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import styles from './AdventureDialog.module.css';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

type AdventureDialogProps = {
  readonly open: boolean;
  readonly labelledBy: string;
  readonly describedBy?: string;
  readonly children: ReactNode;
  readonly initialFocusRef?: RefObject<HTMLElement | null>;
  readonly restoreFocusRef?: RefObject<HTMLElement | null>;
  readonly onEscape?: () => void;
  readonly backdropClassName?: string;
  readonly dialogClassName?: string;
};

function focusableElements(dialog: HTMLElement) {
  return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true');
}

export function AdventureDialog({
  open,
  labelledBy,
  describedBy,
  children,
  initialFocusRef,
  restoreFocusRef,
  onEscape,
  backdropClassName,
  dialogClassName,
}: AdventureDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const dialog = dialogRef.current;
    const firstTarget = initialFocusRef?.current
      ?? (dialog ? focusableElements(dialog)[0] : null)
      ?? dialog;
    firstTarget?.focus();

    function keepFocusInside(event: FocusEvent) {
      const currentDialog = dialogRef.current;
      if (!currentDialog || currentDialog.contains(event.target as Node)) return;
      (initialFocusRef?.current ?? focusableElements(currentDialog)[0] ?? currentDialog).focus();
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      const currentDialog = dialogRef.current;
      if (!currentDialog) return;
      if (event.key === 'Escape' && onEscapeRef.current) {
        event.preventDefault();
        onEscapeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = focusableElements(currentDialog);
      if (focusable.length === 0) {
        event.preventDefault();
        currentDialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;
      if (event.shiftKey && (activeElement === first || !currentDialog.contains(activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (activeElement === last || !currentDialog.contains(activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('focusin', keepFocusInside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('focusin', keepFocusInside);
      document.removeEventListener('keydown', handleKeyDown);
      const restoreTarget = restoreFocusRef?.current ?? previousFocusRef.current;
      if (restoreTarget?.isConnected && !restoreTarget.closest('[inert]')) restoreTarget.focus();
      previousFocusRef.current = null;
    };
  // Focus ownership is captured once per open cycle so nested confirmation
  // views cannot replace the original launcher used for restoration.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className={`${styles.backdrop}${backdropClassName ? ` ${backdropClassName}` : ''}`}>
      <section
        ref={dialogRef}
        className={`${styles.dialog}${dialogClassName ? ` ${dialogClassName}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
      >
        {children}
      </section>
    </div>
  );
}

export type { AdventureDialogProps };
