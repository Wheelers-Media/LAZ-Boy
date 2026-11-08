import React from 'react';

const PROVENANCE = {
  dealer: { label: 'One dealer group', hint: 'Ottawa / Gatineau / Kingston dealer. Not La-Z-Boy Canada policy; another store may differ.' },
  'corporate-us': { label: 'La-Z-Boy US page', hint: 'From the US customer-care pages. Confirm the Canadian version before quoting.' },
  app: { label: 'Cross-checked with this app', hint: 'Compared against the app’s own data.' },
};

export function ProvenanceTag({ kind, asOf }) {
  const info = PROVENANCE[kind];
  if (!info) return null;
  return <span className={`prov-tag prov-${kind}`} title={info.hint}>{info.label}{asOf ? ` · ${asOf}` : ''}</span>;
}

/** Canadian floor guide cards (public/canada-floor-guide-2026.json). Static reference text; every card says where it came from. */
export function CanadaGuide({ guide }) {
  const sections = guide?.sections || [];
  if (!sections.length) return null;
  return (
    <details className="support-card card fold-card support-topics canada-guide">
      <summary><div className="module-head"><div><h2>Canadian floor guide</h2><p>Lift-chair tax, fit check, delivery fit, service claims, and claims to avoid.</p></div></div></summary>
      {sections.map((section) => (
        <details className="support-topic" key={section.id}>
          <summary>{section.title} <ProvenanceTag kind={section.provenance} asOf={section.asOf} /></summary>
          {section.note && <p className="fine-print">{section.note}</p>}
          <dl>
            {section.items.map((item) => <React.Fragment key={item.q}><dt>{item.q}</dt><dd>{item.a}</dd></React.Fragment>)}
          </dl>
          <small>Source: {section.source}</small>
        </details>
      ))}
    </details>
  );
}

/** Step-by-step spot-cleaning cards for the Care guide tab. */
export function CareProcedures({ care }) {
  if (!care) return null;
  return (
    <section className="card care-procedures">
      <h2>How to clean it <ProvenanceTag kind={care.provenance} asOf={care.asOf} /></h2>
      <p className="care-rule">{care.note}</p>
      {care.procedures.map((item) => (
        <details className="support-topic" key={item.code}>
          <summary><strong>{item.code}</strong> · {item.title}</summary>
          <ol>{item.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          {item.note && <p className="fine-print">{item.note}</p>}
        </details>
      ))}
      {[care.leather, care.iclean].map((block) => (
        <details className="support-topic" key={block.title}>
          <summary>{block.title}</summary>
          <ol>{block.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          {block.warning && <p className="alert-note">{block.warning}</p>}
        </details>
      ))}
      <details className="support-topic">
        <summary>{care.performance.title}</summary>
        <dl>{care.performance.terms.map((entry) => <React.Fragment key={entry.term}><dt>{entry.term}</dt><dd>{entry.meaning}</dd></React.Fragment>)}</dl>
        <p className="fine-print">{care.performance.note}</p>
      </details>
      <small>Source: {care.source}</small>
    </section>
  );
}
