import React, { useEffect, useRef } from 'react';
import { Check, ChevronLeft } from './icons.jsx';

/**
 * One decision per screen. Phone: progress strip + one step + a bottom Back / Next bar.
 * Tablet: the same, with a live summary column beside the step.
 * Desktop: a step list on the left (every step visible with its answer), the step in the middle, the summary on the right.
 * `steps`: [{ id, label, summary, done, hidden, content }]. Hidden steps are skipped everywhere.
 */
export function StepFlow({ steps, active, onActive, side, strip, finish }) {
  const root = useRef(null);
  const mounted = useRef(false);
  useEffect(() => { if (!mounted.current) { mounted.current = true; return; } root.current?.scrollIntoView({ block: 'start' }); }, [active]);
  const visible = steps.filter((step) => !step.hidden);
  const index = Math.max(0, visible.findIndex((step) => step.id === active));
  const current = visible[index];
  const next = visible[index + 1];
  const previous = visible[index - 1];
  if (!current) return null;
  return (
    <div className="stepflow" ref={root}>
      <nav className="sf-rail" aria-label="Steps">
        <ol>
          {visible.map((step, position) => (
            <li key={step.id}>
              <button type="button" className={`sf-step ${step.id === current.id ? 'current' : ''} ${step.done ? 'done' : ''}`} aria-current={step.id === current.id ? 'step' : undefined} onClick={() => onActive(step.id)}>
                <span className="sf-num">{step.done && step.id !== current.id ? <Check size={14} /> : position + 1}</span>
                <span className="sf-step-text"><strong>{step.label}</strong><small>{step.summary || 'Not chosen yet'}</small></span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <div className="sf-progress" aria-hidden="true">
        <div className="sf-progress-text"><strong>Step {index + 1} of {visible.length}</strong><span>{current.label}</span></div>
        <div className="sf-bar"><i style={{ width: `${((index + 1) / visible.length) * 100}%` }} /></div>
        {strip && <div className="sf-strip">{strip}</div>}
      </div>
      <section className="sf-main" aria-labelledby="sf-heading">
        <h2 id="sf-heading" className="sf-heading">{current.label}</h2>
        {current.hint && <p className="sf-hint">{current.hint}</p>}
        <div className="sf-body">{current.content}</div>
      </section>
      {side && <aside className="sf-side">{side}</aside>}
      <div className="sf-nav">
        {previous ? <button type="button" className="sf-back" onClick={() => onActive(previous.id)}><ChevronLeft size={18} /> Back</button> : <span />}
        {next ? <button type="button" className="sf-next" onClick={() => onActive(next.id)}>Next: {next.label}</button> : finish}
      </div>
    </div>
  );
}

/** Full-width choice tiles. `multi` allows several (values + onToggle), otherwise one (value + onChange). */
export function TileSelect({ options, value, values = [], onChange, onToggle, multi = false, label, columns = 1 }) {
  return (
    <div className={`tiles tiles-${columns}`} role={multi ? 'group' : 'radiogroup'} aria-label={label}>
      {options.map((option) => {
        const on = multi ? values.includes(option.value) : value === option.value;
        return (
          <button type="button" key={option.value} role={multi ? 'checkbox' : 'radio'} aria-checked={on} disabled={option.disabled} className={`tile ${on ? 'on' : ''}`} onClick={() => (multi ? onToggle(option.value) : onChange(option.value))}>
            <span className="tile-mark" aria-hidden="true">{on && <Check size={14} />}</span>
            <span className="tile-text"><strong>{option.title}</strong>{option.desc && <small>{option.desc}</small>}</span>
            {option.badge && <em className="tile-badge">{option.badge}</em>}
          </button>
        );
      })}
    </div>
  );
}
