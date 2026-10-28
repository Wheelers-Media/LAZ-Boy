import React from 'react';

/** Support reference cards from public/mechanism-guide-2026.json (supportTopics). Data only; nothing is added here. */
export function SupportTopics({ guide }) {
  const topics = guide?.supportTopics || [];
  if (!topics.length) return null;
  return (
    <section className="support-card card support-topics">
      <div className="module-head"><div><h2>Product facts</h2><p>From the manufacturer resource guides. Confirm anything safety-related with the customer’s own provider.</p></div></div>
      {topics.map((topic) => (
        <details className="support-topic" key={topic.id}>
          <summary>{topic.title}</summary>
          {topic.note && <p className="fine-print">{topic.note}</p>}
          <dl>
            {topic.items.map((item) => <React.Fragment key={item.q}><dt>{item.q}</dt><dd>{item.a}</dd></React.Fragment>)}
          </dl>
          <small>Source: {topic.source}</small>
        </details>
      ))}
    </section>
  );
}

/** Extra-function recliner facts (Neo, Ace, Sammy) for one model code, or null. */
export function SpecialtyNote({ guide, modelCode }) {
  const entry = (guide?.specialtyRecliners || []).find((item) => String(item.code) === String(modelCode));
  if (!entry) return null;
  return (
    <div className="specialty-note">
      <h4>{entry.model}{entry.nickname ? ` · ${entry.nickname}` : ''}{entry.series ? ` · ${entry.series} Series` : ''}</h4>
      <p>Available on: {entry.availableOn.join(', ')}.</p>
      <ul>{entry.standard.map((line) => <li key={line}>{line}</li>)}</ul>
      {entry.options && <p>Options: {entry.options.join('; ')}.</p>}
      {entry.service && <p>{entry.service}</p>}
      {entry.pitch && <p><em>{entry.pitch}</em></p>}
      <small>Source: {entry.source}</small>
    </div>
  );
}
