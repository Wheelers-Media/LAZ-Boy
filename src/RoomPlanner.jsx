import React, { useMemo, useRef, useState } from 'react';
import { lineFromLead } from './plan.js';
import { formatInches, insideRoom, overlaps, reachConflicts, reachRect, rotatedSize, normalizeRotation } from './floorplan.js';

// Free-standing room planner for ANY style in the April 2026 guide. It places pieces to true scale from the guide's
// width, depth and fully-extended length. It does not check connections: use the sectional planner for modular collections.
const PX = 3; // screen pixels per inch before the SVG scales to fit

export function RoomPlanner({ catalog, onAddToPlan }) {
  const rows = useMemo(() => (catalog.style_index_2026?.styles || []).filter((row) => row.dims?.width > 0 && row.dims?.depth > 0), [catalog]);
  const [query, setQuery] = useState('');
  const [roomWidth, setRoomWidth] = useState(14);
  const [roomDepth, setRoomDepth] = useState(12);
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const drag = useRef(null);
  const svgRef = useRef(null);
  const room = { width: roomWidth * 12, height: roomDepth * 12 };
  const q = query.trim().toLowerCase();
  const hits = q ? rows.filter((row) => `${row.name} ${row.prefix}${row.model} ${row.model} ${row.category || ''}`.toLowerCase().includes(q)).slice(0, 12) : [];

  const add = (row) => {
    const { width, depth, height, fullyExtended } = row.dims;
    const reach = Number(fullyExtended) > depth ? Number(fullyExtended) : null;
    const item = { id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, label: `${row.prefix}${row.model}`, name: row.name, modelCode: row.model, prefix: row.prefix, category: row.category,
      baseWidth: width, baseHeight: depth, heightIn: height || null, reachIn: reach, code: `${row.prefix}${row.model}`, rotation: 0, x: Math.max(0, (room.width - width) / 2), y: Math.max(0, (room.height - depth) / 2), width, height: depth };
    setItems((list) => [...list, item]); setSelectedId(item.id); setQuery('');
  };
  const update = (id, patch) => setItems((list) => list.map((item) => item.id === id ? { ...item, ...patch } : item));
  const rotate = (id) => setItems((list) => list.map((item) => { if (item.id !== id) return item; const rotation = normalizeRotation(item.rotation + 90); const box = rotatedSize(item.baseWidth, item.baseHeight, rotation); return { ...item, rotation, width: box.width, height: box.height }; }));
  const remove = (id) => { setItems((list) => list.filter((item) => item.id !== id)); setSelectedId(''); };

  const toInches = (event) => { const svg = svgRef.current; const point = svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY; const p = point.matrixTransform(svg.getScreenCTM().inverse()); return { x: p.x / PX, y: p.y / PX }; };
  const down = (event, item) => { event.currentTarget.setPointerCapture?.(event.pointerId); const p = toInches(event); drag.current = { id: item.id, dx: p.x - item.x, dy: p.y - item.y }; setSelectedId(item.id); };
  const move = (event) => { if (!drag.current) return; const p = toInches(event); update(drag.current.id, { x: Math.round(p.x - drag.current.dx), y: Math.round(p.y - drag.current.dy) }); };
  const up = () => { drag.current = null; };

  const problems = [];
  items.forEach((item, index) => {
    if (!insideRoom(item, room)) problems.push(`${item.label} is outside the room.`);
    items.slice(index + 1).forEach((other) => { if (overlaps(item, other)) problems.push(`${item.label} overlaps ${other.label}.`); });
  });
  const reachWarnings = reachConflicts(items, room).map((entry) => `${entry.name} ${entry.code ? `(${entry.code}) ` : ''}cannot fully extend here${entry.reason === 'wall' ? ' (wall)' : entry.blocker ? ` (${entry.blocker})` : ''}.`);
  const selected = items.find((item) => item.id === selectedId);

  return <section className="module-page room-planner">
    <label className="sf-search"><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Add any style: name, model or code" aria-label="Add a style to the room" /></label>
    {hits.length > 0 && <div className="rp-hits">{hits.map((row) => <button type="button" key={`${row.prefix}${row.model}`} className="chip" onClick={() => add(row)}>{row.name} · {row.prefix}{row.model}<small> {formatInches(row.dims.width)} × {formatInches(row.dims.depth)}</small></button>)}</div>}
    <fieldset className="studio-room-fields"><legend>Room, feet</legend><label>Width <input type="number" min="6" max="40" value={roomWidth} onChange={(event) => setRoomWidth(Math.max(6, Math.min(40, Number(event.target.value) || 6)))} /></label><span aria-hidden="true">×</span><label>Depth <input type="number" min="6" max="40" value={roomDepth} onChange={(event) => setRoomDepth(Math.max(6, Math.min(40, Number(event.target.value) || 6)))} /></label></fieldset>
    <svg ref={svgRef} className="rp-canvas" viewBox={`-6 -6 ${room.width * PX + 12} ${room.height * PX + 12}`} onPointerMove={move} onPointerUp={up} style={{ touchAction: 'none', width: '100%', maxHeight: '60vh' }} role="img" aria-label="Room plan to scale">
      <rect x="0" y="0" width={room.width * PX} height={room.height * PX} fill="var(--surface, #fff)" stroke="currentColor" strokeWidth="3" />
      {items.map((item) => { const r = reachRect(item); return <g key={`reach-${item.id}`}>{r && <rect x={r.x * PX} y={r.y * PX} width={r.width * PX} height={r.height * PX} fill="rgba(60,160,200,.18)" stroke="rgba(60,160,200,.7)" strokeDasharray="6 4" />}</g>; })}
      {items.map((item) => <g key={item.id} onPointerDown={(event) => down(event, item)} style={{ cursor: 'grab' }}>
        <rect x={item.x * PX} y={item.y * PX} width={item.width * PX} height={item.height * PX} rx="6" fill="#d9cdb8" stroke={item.id === selectedId ? '#0a3a52' : '#8b7b62'} strokeWidth={item.id === selectedId ? 4 : 2} />
        <text x={(item.x + item.width / 2) * PX} y={(item.y + item.height / 2) * PX} textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="700" fill="#0a3a52" pointerEvents="none">{item.label}</text>
      </g>)}
    </svg>
    {selected && <div className="rp-selected"><strong>{selected.name} · {selected.label}</strong><span>{formatInches(selected.baseWidth)} W × {formatInches(selected.baseHeight)} D{selected.reachIn ? ` · ${formatInches(selected.reachIn)} fully extended` : ''}</span>
      <button type="button" className="back-button" onClick={() => rotate(selected.id)}>Rotate</button>
      <button type="button" className="back-button" onClick={() => onAddToPlan?.(lineFromLead({ source: 'planner', modelCode: selected.modelCode, modelName: selected.name, category: selected.category || '', styleCode: selected.prefix }))}>Add to plan</button>
      <button type="button" className="back-button" onClick={() => remove(selected.id)}>Remove</button></div>}
    {[...problems, ...reachWarnings].length > 0 && <ul className="rp-problems">{[...new Set([...problems, ...reachWarnings])].map((text) => <li key={text}>{text}</li>)}</ul>}
    {!items.length && <p className="sf-empty">Search a style to place it in the room. Sizes come straight from the April 2026 guide.</p>}
    <p className="sf-hint">Free-standing pieces only. For modular sectionals use the sectional planner, which checks connections.</p>
  </section>;
}
