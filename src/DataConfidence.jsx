import React, { useMemo } from 'react';
import { modelDataConfidence } from './logic.js';

const STATE_WORD = { ok: 'On file', partial: 'Partial', none: 'Missing' };

/** What the app knows and does not know about one model. Shown in the Product Index so gaps are visible, not hidden. */
export function DataConfidence({ catalog, research, modelCode, pricebookCheck }) {
  const items = useMemo(() => modelDataConfidence(catalog, research, modelCode, pricebookCheck), [catalog, research, modelCode, pricebookCheck]);
  return <div className="data-confidence" aria-label="Data on file for this model">
    <h4>Data on file</h4>
    <ul>{items.map((item) => <li key={item.key} className={`dc-${item.state}`}>
      <span className="dc-head"><b>{item.label}</b><em>{STATE_WORD[item.state]}</em></span>
      <small>{item.detail}</small>
    </li>)}</ul>
  </div>;
}
