import React, { createContext, useContext, useMemo, useState } from 'react';
import { Sheet } from './Sheet.jsx';
import { indexGlossary, lookupTerm } from './glossary.js';

const GlossaryContext = createContext(null);

export function EntryBody({ entry }) {
  return <div className="term-body">
    <p className="term-plain">{entry.plain}</p>
    {entry.pitch && <p className="term-pitch"><strong>What to say</strong>{entry.pitch}</p>}
    {entry.caution && <p className="term-caution"><strong>Watch out</strong>{entry.caution}</p>}
    {entry.gap && <p className="term-gap">Part of this is not defined in the supplied documents, so the app does not guess it.</p>}
    <p className="term-source">Source: {entry.source}{entry.tier ? ` · Tier ${entry.tier}` : ''}</p>
  </div>;
}

/** Holds the glossary and the one sheet every Term opens. Wrap the app once. */
export function GlossaryProvider({ glossary, children }) {
  const index = useMemo(() => indexGlossary(glossary), [glossary]);
  const [open, setOpen] = useState(null);
  const value = useMemo(() => ({ index, show: setOpen }), [index]);
  return <GlossaryContext.Provider value={value}>
    {children}
    <Sheet open={Boolean(open)} onClose={() => setOpen(null)} title={open?.term || ''}>{open && <EntryBody entry={open} />}</Sheet>
  </GlossaryContext.Provider>;
}

export function useGlossary() {
  return useContext(GlossaryContext)?.index || null;
}

/** A word or code the salesperson can tap to learn what it means. Renders plain text when the glossary has no entry. */
export function Term({ kind, code, children, className = '' }) {
  const context = useContext(GlossaryContext);
  const entry = lookupTerm(context?.index, kind, code);
  const label = children ?? code;
  if (!entry) return <>{label}</>;
  return <button type="button" className={`term ${className}`} aria-label={`What is ${entry.short || entry.term}?`}
    onClick={(event) => { event.preventDefault(); event.stopPropagation(); context.show(entry); }}>{label}<span className="term-q" aria-hidden="true">?</span></button>;
}
