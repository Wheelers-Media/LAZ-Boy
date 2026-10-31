import React from 'react';

/**
 * Top-down drawing of a free-standing chair, recliner or sofa, in real inches. At rotation 0 the back is at the top and the seat faces down.
 * Arm width comes from (overall width - seat width) / 2 and back thickness from (overall depth - seat depth), both from the
 * April 2026 guide. Where the guide lacks a seat figure the drawing falls back to a plain proportion, never to a made-up size.
 */
export function ChairArt({ item }) {
  const w = item.baseWidth;
  const d = item.baseHeight;
  const seatW = Number(item.seatWidth) > 0 && item.seatWidth < w ? item.seatWidth : null;
  const seatD = Number(item.seatDepth) > 0 && item.seatDepth < d ? item.seatDepth : null;
  const clamp = (value, low, high) => Math.min(Math.max(value, low), high);
  const arm = seatW ? clamp((w - seatW) / 2, 3, w * 0.3) : Math.min(8, w * 0.18);
  const back = seatD ? clamp(d - seatD, 3, d * 0.45) : Math.min(9, d * 0.22);
  const inner = w - arm * 2;
  const cushions = item.kind === 'sofa' ? Math.max(1, Math.round(inner / 24)) : 1;
  const cushionW = inner / cushions;
  return <g>
    <rect className="fp-body" width={w} height={d} rx="4" />
    <rect className="fp-back" width={w} height={back} rx="3" />
    <rect className="fp-arm" width={arm} height={d} rx="3" />
    <rect className="fp-arm" x={w - arm} width={arm} height={d} rx="3" />
    {Array.from({ length: cushions }, (_, index) => <rect key={index} className="fp-cushion" x={arm + index * cushionW + 0.8} y={back + 0.8} width={cushionW - 1.6} height={d - back - 1.6} rx="3" />)}
    {item.kind === 'recliner' && <path className="fp-stitch" d={`M${w / 2 - 5} ${d - 7}l5 4l5 -4`} />}
  </g>;
}

/** The floor a recliner needs when fully extended, drawn in the chair's own turned frame. */
export function ReachArt({ item, blocked }) {
  if (!item.reachIn || !(item.reachIn > item.baseHeight)) return null;
  return <rect className={`fp-reach ${blocked ? 'blocked' : ''}`} x="0" y={item.baseHeight} width={item.baseWidth} height={item.reachIn - item.baseHeight} />;
}

/** SVG transform that turns a free item about the centre of its box. */
export const freeTransform = (item) => `translate(${item.x + item.width / 2} ${item.y + item.height / 2}) rotate(${item.rotation || 0}) translate(${-item.baseWidth / 2} ${-item.baseHeight / 2})`;
