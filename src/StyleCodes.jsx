import React from 'react';
import { Term, useGlossary } from './Term.jsx';
import { lookupTerm } from './glossary.js';

/** Cover types, finishes, select covers and options of one guide style, each with its name and a tap-for-meaning. */
export function StyleCodes({ style }) {
  const glossary = useGlossary();
  const caps = style.caps || [];
  const options = style.options || [];
  const optionName = (code) => lookupTerm(glossary, 'option', code)?.short || '';
  return <div className="style-codes">
    {caps.length > 0 && <div className="sc-row"><span className="sc-label"><Term kind="term" code="CAP">Cover types</Term></span>
      <ul className="sc-chips">{caps.map((code) => <li key={code}><Term kind="cap" code={code}><b>{code}</b> {lookupTerm(glossary, 'cap', code)?.short || ''}</Term></li>)}</ul></div>}
    {style.finishes?.length > 0 && <div className="sc-row"><span className="sc-label">Wood finishes</span>
      <ul className="sc-chips">{style.finishes.map((text) => { const code = String(text).match(/\b(\d{3})\b/)?.[1]; return <li key={text}>{code ? <Term kind="finish" code={code}>{text}</Term> : text}</li>; })}</ul></div>}
    {(style.select || []).length > 0 && <div className="sc-row"><span className="sc-label"><Term kind="term" code="SELECT">Select covers</Term></span>
      <ul className="sc-lines">{style.select.map((line) => <li key={line}>{line}</li>)}</ul></div>}
    {options.length > 0 && <div className="sc-row"><span className="sc-label">Options</span>
      <ul className="sc-chips">{options.map((code) => <li key={code}><Term kind="option" code={code}><b>{code}</b> {optionName(code) || 'name not in the supplied data'}</Term></li>)}</ul></div>}
  </div>;
}
