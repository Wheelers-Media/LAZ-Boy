import React, { useMemo, useRef, useState } from 'react';
import { Armchair, Copy, Info, Layers3, Minus, Plus, Printer, Redo2, RotateCw, Sofa, Undo2 } from './icons.jsx';
import { buildSectionalStudioRmsLine, getSectionalPieceOptions, sectionalPiecesForFamily, validateSectionalStudioLayout } from './logic.js';
import { createItem, findFreeSpot, formatInches, layoutSummary, normalizeRotation, parsePieceDimensions, presetItems, reachConflicts, reachRect, resolveMove, rotateItem } from './floorplan.js';

const WALL = 4;
const MARGIN = 18;

/** Top-down drawing of one piece, in real inches. At rotation 0 the back is at the top and the seat faces down. */
function PieceArt({ item }) {
  const w = item.baseWidth;
  const d = item.baseHeight;
  const kind = item.kind;
  const back = Math.min(9, d * 0.22);
  const arm = Math.min(8, w * 0.18);
  // Left/right is the sitter's. Seen from above with the seat facing down, the sitter's left is the drawing's right.
  const sitterLeftArm = ['seat', 'arm-left', 'chaise-left'].includes(kind);
  const sitterRightArm = ['seat', 'arm-right', 'chaise-right'].includes(kind);
  const leftArm = sitterRightArm; // arm drawn at the drawing's left edge
  const rightArm = sitterLeftArm; // arm drawn at the drawing's right edge
  const from = leftArm ? arm : 0;
  const to = w - (rightArm ? arm : 0);
  const seatCount = Math.max(1, Math.round((to - from) / 24));
  const seatWidth = (to - from) / seatCount;
  const cushion = (index) => <rect key={index} className="fp-cushion" x={from + index * seatWidth + 0.8} y={back + 0.8} width={seatWidth - 1.6} height={d - back - 1.6} rx="2.5" />;
  const recliner = Boolean(item.reachIn);
  if (kind === 'console') {
    return <g><rect className="fp-body" width={w} height={d} rx="2.5" /><rect className="fp-back" x="1.5" y="1.5" width={w - 3} height={d * 0.34} rx="1.5" />
      <circle className="fp-detail" cx={w / 2 - 3.6} cy={d * 0.66} r="2.2" /><circle className="fp-detail" cx={w / 2 + 3.6} cy={d * 0.66} r="2.2" /></g>;
  }
  if (kind === 'ottoman') {
    return <g><rect className="fp-body" width={w} height={d} rx="4" /><rect className="fp-cushion" x="1.5" y="1.5" width={w - 3} height={d - 3} rx="3" /><path className="fp-stitch" d={`M${w / 2} 4V${d - 4}M4 ${d / 2}H${w - 4}`} /></g>;
  }
  if (kind === 'corner') {
    return <g><rect className="fp-body" width={w} height={d} rx="3" /><rect className="fp-back" width={w} height={back} rx="2" />
      <rect className="fp-cushion" x="0.8" y={back + 0.8} width={w - 1.6} height={d - back - 1.6} rx="3" /></g>;
  }
  return <g><rect className="fp-body" width={w} height={d} rx="3" /><rect className="fp-back" width={w} height={back} rx="2" />
    {leftArm && <rect className="fp-arm" width={arm} height={d} rx="2" />}{rightArm && <rect className="fp-arm" x={w - arm} width={arm} height={d} rx="2" />}
    {Array.from({ length: seatCount }, (_, index) => cushion(index))}
    {recliner && <path className="fp-stitch" d={`M${(from + to) / 2 - 5} ${d - 7}l5 4l5 -4`} />}</g>;
}

const pieceTransform = (item) => {
  const { x, y, baseWidth: w, baseHeight: d } = item;
  switch (normalizeRotation(item.rotation)) {
    case 90: return `translate(${x} ${y}) translate(${d} 0) rotate(90)`;
    case 180: return `translate(${x} ${y}) translate(${w} ${d}) rotate(180)`;
    case 270: return `translate(${x} ${y}) translate(0 ${w}) rotate(270)`;
    default: return `translate(${x} ${y})`;
  }
};

export function SectionalDesignStudio({ catalog, onCopy, initialModelCode = '724', onModelChange }) {
  const profiles = (catalog.product_profiles || []).filter((profile) => profile.pieces?.length);
  const [modelCode, setModelCode] = useState(String(initialModelCode));
  const profile = profiles.find((item) => String(item.model_code) === modelCode) || profiles[0];
  const [selectedKey, setSelectedKey] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [roomWidth, setRoomWidth] = useState(20);
  const [roomDepth, setRoomDepth] = useState(14);
  const [snapEdges, setSnapEdges] = useState(true);
  const [showReach, setShowReach] = useState(true);
  const [showSizes, setShowSizes] = useState(true);
  const [cover, setCover] = useState('');
  const [pattern, setPattern] = useState('');
  const [color, setColor] = useState('');
  const [notice, setNotice] = useState('');
  const [history, setHistory] = useState({ past: [], future: [] });
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const pieces = useMemo(() => profile ? sectionalPiecesForFamily(catalog, profile.sectional_family, String(profile.model_code)) : [], [catalog, profile]);
  const selectedPiece = pieces.find((piece) => piece.key === selectedKey) || pieces[0];
  const variants = selectedPiece?.variants?.length ? selectedPiece.variants : (selectedPiece?.prefix || '').split('/').map((code) => ({ code: code.trim(), label: '' }));
  const selectedCode = variants.find((entry) => entry.code === selectedVariant)?.code || variants[0]?.code || selectedPiece?.prefix?.split('/')[0]?.trim() || '';
  const selectedSource = profile?.pieces.find((entry) => entry.key === selectedPiece?.key);
  const selectedSize = parsePieceDimensions(selectedSource?.dimensions_text);
  const room = useMemo(() => ({ width: roomWidth * 12, height: roomDepth * 12 }), [roomWidth, roomDepth]);
  const validation = validateSectionalStudioLayout(items, room, catalog);
  const reach = reachConflicts(items, room);
  const summary = layoutSummary(items, room);
  const canCopy = items.length > 0 && validation.valid && coverReady;
  const coverCodes = catalog.cover_cap_codes || [];
  const activeCover = coverCodes.find((entry) => entry.code === cover);
  const coverReady = Boolean(cover) && pattern.length === 4 && color.length === 2;
  const rmsRows = items.map((piece) => (coverReady ? buildSectionalStudioRmsLine(piece, cover, pattern, color) : `${piece.code}-${piece.modelCode}`));
  const rmsText = rmsRows.join('\n');
  const selectedItem = items.find((item) => item.id === selectedId);

  const commit = (next) => {
    setHistory((current) => ({ past: [...current.past.slice(-59), itemsRef.current], future: [] }));
    setItems(next);
  };
  const undo = () => setHistory((current) => {
    if (!current.past.length) return current;
    const previous = current.past[current.past.length - 1];
    setItems(previous);
    return { past: current.past.slice(0, -1), future: [itemsRef.current, ...current.future] };
  });
  const redo = () => setHistory((current) => {
    if (!current.future.length) return current;
    const [next, ...rest] = current.future;
    setItems(next);
    return { past: [...current.past, itemsRef.current], future: rest };
  });
  const setProfile = (code) => {
    setModelCode(code);
    setItems([]); setHistory({ past: [], future: [] }); setSelectedId(''); setSelectedKey(''); setSelectedVariant(''); setNotice('');
    onModelChange?.(code);
  };
  const addPiece = () => {
    if (!profile || !selectedPiece || !selectedCode) return;
    const draft = createItem(selectedPiece, profile, 0, 0, 0, selectedCode);
    if (!draft) { setNotice('This piece has no width and depth in the catalog, so it cannot be drawn to scale.'); return; }
    const spot = findFreeSpot(draft, items, room);
    if (!spot) { setNotice('There is no free space left in this room for that piece. Make the room larger or remove a piece.'); return; }
    commit([...items, { ...draft, ...spot }]); setSelectedId(draft.id); setNotice('');
  };
  const applyPreset = (kind) => {
    const next = presetItems(kind, profile, pieces, room);
    if (!next) {
      const fitsBigRoom = presetItems(kind, profile, pieces, { width: 1200, height: 1200 });
      setNotice(fitsBigRoom ? 'That layout is bigger than this room. Make the room larger to use it.' : 'This collection does not list every piece that layout needs. Choose another layout or collection.');
      return;
    }
    commit(next); setSelectedId(next[0]?.id || '');
    setNotice('Layout loaded to scale. Check every connection against the collection tear pad before ordering.');
  };
  const toPoint = (event) => {
    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = event.clientX; point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  };
  const startDrag = (event, piece) => {
    event.preventDefault();
    event.stopPropagation();
    svgRef.current.focus({ preventScroll: true });
    svgRef.current.setPointerCapture?.(event.pointerId);
    const point = toPoint(event);
    dragRef.current = { id: piece.id, dx: point.x - piece.x, dy: point.y - piece.y, snapshot: itemsRef.current, moved: false };
    setSelectedId(piece.id);
  };
  const moveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const point = toPoint(event);
    const next = resolveMove(itemsRef.current, drag.id, { x: point.x - drag.dx, y: point.y - drag.dy }, room, { snap: snapEdges });
    if (!drag.moved) {
      drag.moved = true;
      setHistory((current) => ({ past: [...current.past.slice(-59), drag.snapshot], future: [] }));
    }
    setItems(next);
  };
  const endDrag = () => { dragRef.current = null; };
  const rotateSelected = () => {
    if (!selectedItem) return;
    const next = rotateItem(items, selectedId, room);
    if (!next) { setNotice('There is no free space to turn that piece here.'); return; }
    commit(next); setNotice('');
  };
  const removeSelected = () => { if (!selectedItem) return; commit(items.filter((item) => item.id !== selectedId)); setSelectedId(''); };
  const nudge = (dx, dy) => {
    if (!selectedItem) return;
    commit(resolveMove(items, selectedId, { x: selectedItem.x + dx, y: selectedItem.y + dy }, room, { snap: false }));
  };
  const onKeyDown = (event) => {
    const step = event.shiftKey ? 6 : 1;
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) redo(); else undo(); return; }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); return; }
    if (!selectedItem) return;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[event.key]) { event.preventDefault(); nudge(...moves[event.key]); }
    else if (event.key.toLowerCase() === 'r') { event.preventDefault(); rotateSelected(); }
    else if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); removeSelected(); }
  };
  const copy = () => { if (canCopy) { onCopy(rmsText); setNotice('RMS entry preview copied. Verify the style, cover, color, and orderability before entry.'); } };

  const viewBox = `${-MARGIN} ${-MARGIN} ${room.width + MARGIN * 2} ${room.height + MARGIN * 2}`;
  const gridLines = (length, step) => Array.from({ length: Math.floor(length / step) - 1 }, (_, index) => (index + 1) * step);

  return <section className="module-page design-studio">
    <div className="module-intro"><p className="eyebrow"><Layers3 size={13} /> FLOOR-PLAN CONFIGURATOR</p><h1>Sectional &amp; Modular <em>Design Studio</em></h1><p>Place pieces at true size in your customer&rsquo;s room, then review a piece-by-piece RMS entry preview.</p></div>
    <div className="studio-toolbar card">
      <label className="form-field"><span>Style / collection</span><select value={profile?.model_code || ''} onChange={(event) => setProfile(event.target.value)}>{profiles.map((entry) => <option key={entry.model_code} value={entry.model_code}>{entry.model_name} · {entry.model_code} · {entry.sectional_family}</option>)}</select></label>
      <div className="form-field"><span>Starting layouts</span><div className="chip-row tight" role="group" aria-label="Starting layouts">{[['l-standard', 'L-shape'], ['l-console', 'L with console'], ['u-shape', 'U-shape'], ['straight-chaise', 'Sofa with chaise']].map(([key, label]) => <button key={key} type="button" className="chip" onClick={() => applyPreset(key)}>{label}</button>)}</div></div>
      <fieldset className="studio-room-fields"><legend>Room size · feet</legend><label>Width <input type="number" min="8" max="40" value={roomWidth} onChange={(event) => setRoomWidth(Math.max(8, Math.min(40, Number(event.target.value) || 8)))} /></label><label>Depth <input type="number" min="8" max="40" value={roomDepth} onChange={(event) => setRoomDepth(Math.max(8, Math.min(40, Number(event.target.value) || 8)))} /></label></fieldset>
    </div>
    <div className="studio-workspace">
      <section className="studio-board-card card"><div className="studio-section-head"><div><p className="eyebrow">TOP-DOWN PLAN · TRUE SCALE</p><h2>{profile?.model_name || 'Collection'} · {roomWidth}′ × {roomDepth}′ room</h2></div><span className="studio-live"><i /> 1 FT GRID</span></div>
        <div className="studio-tools" role="toolbar" aria-label="Plan tools">
          <button type="button" onClick={undo} disabled={!history.past.length} aria-label="Undo"><Undo2 size={15} /> Undo</button>
          <button type="button" onClick={redo} disabled={!history.future.length} aria-label="Redo"><Redo2 size={15} /> Redo</button>
          <label><input type="checkbox" checked={snapEdges} onChange={(event) => setSnapEdges(event.target.checked)} /> Snap edges</label>
          <label><input type="checkbox" checked={showReach} onChange={(event) => setShowReach(event.target.checked)} /> Recline reach</label>
          <label><input type="checkbox" checked={showSizes} onChange={(event) => setShowSizes(event.target.checked)} /> Sizes</label>
          <button type="button" onClick={() => window.print()} aria-label="Print plan"><Printer size={15} /> Print</button>
        </div>
        <div className="studio-board-wrap">
          <svg ref={svgRef} className="studio-svg" viewBox={viewBox} tabIndex={0} role="application" aria-label={`${roomWidth} by ${roomDepth} foot floor plan. Arrow keys move the selected piece, R turns it, Delete removes it.`}
            onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={onKeyDown} onPointerDown={(event) => { if (event.target === event.currentTarget || event.target.classList?.contains('fp-floor')) setSelectedId(''); }}>
            <rect className="fp-wall" x={-WALL} y={-WALL} width={room.width + WALL * 2} height={room.height + WALL * 2} />
            <rect className="fp-floor" x="0" y="0" width={room.width} height={room.height} />
            {gridLines(room.width, 12).map((x) => <line key={`gx${x}`} className={x % 60 ? 'fp-grid' : 'fp-grid fp-grid-major'} x1={x} y1="0" x2={x} y2={room.height} />)}
            {gridLines(room.height, 12).map((y) => <line key={`gy${y}`} className={y % 60 ? 'fp-grid' : 'fp-grid fp-grid-major'} x1="0" y1={y} x2={room.width} y2={y} />)}
            <text className="fp-dim" x={room.width / 2} y={-8} textAnchor="middle">{roomWidth}′</text>
            <text className="fp-dim" x={-9} y={room.height / 2} textAnchor="middle" transform={`rotate(-90 -9 ${room.height / 2})`}>{roomDepth}′</text>
            {showReach && items.map((item) => { const zone = reachRect(item); return zone ? <rect key={`r${item.id}`} className={`fp-reach ${reach.some((entry) => entry.id === item.id) ? 'blocked' : ''}`} x={zone.x} y={zone.y} width={zone.width} height={zone.height} /> : null; })}
            {items.map((item) => <g key={item.id} className={`fp-piece ${selectedId === item.id ? 'selected' : ''}`} onPointerDown={(event) => startDrag(event, item)} role="button" tabIndex={0} aria-label={`${item.name}, ${item.code}, ${formatInches(item.baseWidth)} wide by ${formatInches(item.baseHeight)} deep. Select or drag.`} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedId(item.id); } }}>
              <g transform={pieceTransform(item)}><PieceArt item={item} /></g>
              <rect className="fp-outline" x={item.x} y={item.y} width={item.width} height={item.height} />
            </g>)}
            {items.map((item) => <g key={`t${item.id}`} className="fp-labels" pointerEvents="none">
              <text className="fp-code" x={item.x + item.width / 2} y={item.y + item.height / 2} textAnchor="middle" dominantBaseline="central" fontSize={Math.max(5, Math.min(9, Math.min(item.width, item.height) * 0.22))}>{item.code}</text>
              {showSizes && item.width >= 44 && item.height >= 30 && <text className="fp-size" x={item.x + item.width / 2} y={item.y + item.height / 2 + Math.max(5, Math.min(9, Math.min(item.width, item.height) * 0.22)) * 1.15} textAnchor="middle" dominantBaseline="central" fontSize="5">{formatInches(item.baseWidth)} × {formatInches(item.baseHeight)}</text>}
            </g>)}
            <g className="fp-scale" pointerEvents="none"><rect x="0" y={room.height + 6} width="60" height="2.5" /><text x="0" y={room.height + 14} fontSize="5.5">5′ scale</text></g>
          </svg>
          {!items.length && <div className="studio-board-empty"><Sofa size={38} /><strong>Start with a layout or add a piece</strong><span>Pieces are drawn at their real size and cannot overlap</span></div>}
        </div>
        <div className="studio-board-controls">{selectedItem ? <div className="studio-selected-actions"><strong>{selectedItem.name} · {selectedItem.code}</strong><span>{formatInches(selectedItem.baseWidth)} W × {formatInches(selectedItem.baseHeight)} D{selectedItem.heightIn ? ` × ${formatInches(selectedItem.heightIn)} H` : ''}{selectedItem.reachIn ? ` · ${formatInches(selectedItem.reachIn)} reclined` : ''}</span><button type="button" onClick={rotateSelected} aria-label="Rotate selected piece"><RotateCw size={15} /> Rotate 90°</button><button type="button" onClick={removeSelected} aria-label="Remove selected piece"><Minus size={15} /> Remove</button></div> : <span>Select a piece to see its size. Drag to move; arrow keys nudge 1″, Shift 6″.</span>}</div>
        {summary && <div className="studio-summary"><span><strong>{formatInches(summary.width)} × {formatInches(summary.depth)}</strong> overall footprint</span><span>Gap to walls: left {formatInches(summary.gaps.left)} · right {formatInches(summary.gaps.right)} · top {formatInches(summary.gaps.top)} · bottom {formatInches(summary.gaps.bottom)}</span></div>}
        {notice && <p className="studio-notice" role="status">{notice}</p>}
      </section>
      <aside className="studio-parts card"><div className="studio-section-head"><div><p className="eyebrow">{profile?.sectional_family} · {profile?.model_code}</p><h2>Collection pieces</h2></div><span className="studio-parts-count">{pieces.length} types</span></div><label className="form-field"><span>Piece type</span><select value={selectedPiece?.key || ''} onChange={(event) => { setSelectedKey(event.target.value); setSelectedVariant(''); }}>{pieces.map((piece) => <option key={piece.key} value={piece.key}>{piece.name} · {piece.prefix}</option>)}</select></label>
        {variants.length > 1 && <label className="form-field"><span>Prefix / power variant</span><select value={selectedCode} onChange={(event) => setSelectedVariant(event.target.value)}>{variants.map((entry) => <option key={entry.code} value={entry.code}>{entry.code}{entry.label ? ` · ${entry.label}` : ''}</option>)}</select></label>}
        <div className="studio-piece-detail"><Armchair size={19} /><span><strong>{selectedPiece?.name || 'Choose a piece'}</strong><small>{selectedSize ? `${formatInches(selectedSize.width)} W × ${formatInches(selectedSize.depth)} D${selectedSize.height ? ` × ${formatInches(selectedSize.height)} H` : ''}${selectedSource?.fully_extended_in ? ` · ${formatInches(selectedSource.fully_extended_in)} reclined` : ''}` : 'Size not in the supplied data.'}</small></span></div>
        <button type="button" className="primary-button studio-add" onClick={addPiece} disabled={!selectedSize}><Plus size={16} /> Add piece to floor plan</button>
        {items.length > 0 && <div className={`studio-check ${validation.valid && items.length ? 'valid' : validation.errors.length ? 'invalid' : ''}`} role="status"><strong>{!items.length ? 'Plan your room' : validation.valid ? 'Layout checks passed' : 'Review the layout'}</strong>{validation.errors.map((error) => <small key={error}>{error}</small>)}{reach.map((entry) => <small key={entry.id}>{entry.code} cannot fully recline: {entry.reason === 'wall' ? 'a wall is in the way.' : `${entry.blocker} is in the way.`}</small>)}{validation.warnings.map((warning) => <small key={warning}>{warning}</small>)}</div>}
        <div className="studio-cover"><p className="eyebrow">COVER</p><label className="form-field"><span>Cover / grade</span><select value={cover} onChange={(event) => setCover(event.target.value)}><option value="">Choose a grade…</option><option value="D">D · type the cover below</option>{coverCodes.map((entry) => <option key={entry.code} value={entry.code}>{entry.code} · {entry.name}</option>)}</select></label><div className="studio-cover-digits"><label>Pattern <input placeholder="4 digits" maxLength="4" inputMode="numeric" value={pattern} onChange={(event) => setPattern(event.target.value.replace(/\D/g, '').slice(0, 4))} /></label><label>Colour <input placeholder="2 digits" maxLength="2" inputMode="numeric" value={color} onChange={(event) => setColor(event.target.value.replace(/\D/g, '').slice(0, 2))} /></label></div><small>Optional. Add the exact cover (grade, 4-digit pattern, 2-digit colour) to complete the entry string.</small></div>
      </aside>
    </div>
    <section className="studio-order-drawer" aria-live="polite"><div className="studio-drawer-head"><div><p className="eyebrow"><Layers3 size={12} /> RMS ORDER SUMMARY</p><strong>{items.length} configured {items.length === 1 ? 'piece' : 'pieces'}</strong></div><span className="studio-preview-badge">ENTRY PREVIEW · NOT ORDER-VALIDATED</span></div>{items.length ? <><div className="studio-order-list">{items.map((item, index) => { const supported = getSectionalPieceOptions(catalog, item.family, item.modelCode, item.code); return <article key={item.id}><span className="studio-order-num">{String(index + 1).padStart(2, '0')}</span><span><strong>{item.modelName} · {item.name}</strong><small>Prefix {item.code} · Model {item.modelCode} · {cover} {pattern} {color}</small></span><code>{rmsRows[index]}</code>{supported.length > 0 && <small className="studio-order-options">Indexed options: {supported.join(', ')}</small>}</article>; })}</div><div className="studio-copy-row"><pre>{rmsText}</pre><button type="button" className="copy-button" disabled={!canCopy} onClick={copy}><Copy size={14} /> Copy for RMS</button></div></> : <p className="studio-order-empty">Add a piece to see its model, prefix, cover and draft entry string here.</p>}<p className="studio-order-disclaimer"><Info size={14} /> These are catalog-derived entry references, not guaranteed order SKUs. Verify the exact-style cover, options, availability and assembly with the live RMS/order guide before promising or submitting.</p></section>
  </section>;
}
