import React, { useEffect, useId, useRef } from 'react';
import { X } from './icons.jsx';

/**
 * A bottom sheet on phones and a centred dialog on wider screens.
 * Locks the page behind it, closes on Escape or a tap outside, and returns focus to whatever opened it.
 */
export function Sheet({ open, onClose, title, children, footer }) {
  const panel = useRef(null);
  const closeRef = useRef(onClose);
  const titleId = useId();
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => { if (event.key === 'Escape') closeRef.current(); };
    window.addEventListener('keydown', onKey);
    panel.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      if (opener && typeof opener.focus === 'function') opener.focus();
    };
  }, [open]);
  if (!open) return null;
  return <div className="sheet-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section ref={panel} tabIndex={-1} className="sheet" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="sheet-grab" aria-hidden="true" />
      <header className="sheet-head"><h2 id={titleId}>{title}</h2><button type="button" className="sheet-close" onClick={onClose} aria-label="Close"><X size={20} /></button></header>
      <div className="sheet-body">{children}</div>
      {footer && <footer className="sheet-foot">{footer}</footer>}
    </section>
  </div>;
}
