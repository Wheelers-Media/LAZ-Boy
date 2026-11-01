import React, { useState } from 'react';
import { StyleCodes } from './StyleCodes.jsx';
import { StyleFacts } from './HelperTools.jsx';
import { getGuideStyle } from './logic.js';

/**
 * One model's styles. A row of style buttons picks the style; only that style's
 * facts and codes are shown, in two columns, so the page stays short and uses the width.
 */
export function ModelStyles({ catalog, product, customerView, compareKeys, onCompare, onPlace }) {
  const styles = product.styles || [];
  const [active, setActive] = useState(0);
  if (!styles.length) return null;
  const style = styles[Math.min(active, styles.length - 1)];
  const guide = getGuideStyle(catalog, product.modelCode, style.code);
  const compareKey = `${style.code}${product.modelCode}`;
  const inCompare = compareKeys.includes(compareKey);
  const label = (text) => String(text || '').replace(/ · (new|discontinued)$/, '');
  return <div className="model-styles">
    {styles.length > 1 && <div className="ms-picker" role="group" aria-label={`${product.modelName} styles`}>
      {styles.map((item, index) => <button type="button" key={`${item.code}-${item.source}-${index}`} className={index === active ? 'on' : ''} aria-pressed={index === active} onClick={() => setActive(index)}><b>{item.code}</b><span>{label(item.label)}</span></button>)}
    </div>}
    <article className="ms-style">
      <header className="ms-head"><h3>{style.code} · {label(style.label)}</h3>{style.dimensions && <p>{style.dimensions}</p>}{style.sourceNote && <small>{style.sourceNote}</small>}</header>
      <div className="ms-cols">
        <div className="ms-facts"><StyleFacts catalog={catalog} modelCode={product.modelCode} styleCode={style.code} />
          <div className="ms-actions">
            {!customerView && guide?.dims?.width > 0 && <button type="button" className="back-button" onClick={() => onPlace(style.code)}>Place in room</button>}
            {!customerView && guide && <button type="button" className="back-button" onClick={() => onCompare(guide)} disabled={inCompare}>{inCompare ? 'In compare' : 'Add to compare'}</button>}
          </div>
        </div>
        <StyleCodes style={style} />
      </div>
    </article>
  </div>;
}
