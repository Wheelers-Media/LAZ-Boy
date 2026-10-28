import React, { useMemo, useRef, useState } from 'react';
import { CoverPicker } from './CoverPicker.jsx';
import { ChevronUp, Copy, Info, Layers3, Printer, Redo2, RotateCw, Scan, Sofa, Trash2, Undo2 } from './icons.jsx';
import { buildSectionalStudioRmsLine, getSharedCoverSwatches, getSectionalPieceOptions, sectionalPiecesForFamily, validateSectionalStudioLayout } from './logic.js';
import { createItem, applyPlacement, findFreeSpot, formatInches, placementCandidates, rankPlacements, layoutSummary, normalizeRotation, parsePieceDimensions, presetItems, reachConflicts, reachRect, resolveMove, rotateItem } from './floorplan.js';

const narrowScreen = () => typeof window !== 'undefined' && window.matchMedia?.('(max-width: 800px)').matches;
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
    // Wedge corner: square outer corner with the back running along two walls, and a 45 degree front. The two faces
    // where neighbours attach are `attach` long (published D); the footprint is the published W on both axes.
    const attach = Math.min(item.attachIn || w * 0.6, w);
    const t = back;
    const m = (w + attach) / 2;
    const outline = `M0 0H${w}V${attach}L${attach} ${w}H0Z`;
    const halfA = `M${t} ${t}H${w}V${attach}L${m} ${m}Z`;
    const halfB = `M${t} ${t}L${m} ${m}L${attach} ${w}H${t}Z`;
    return <g><path className="fp-body fp-corner" d={outline} /><path className="fp-back" d={outline} />
      <path className="fp-cushion fp-corner" d={halfA} /><path className="fp-cushion fp-corner" d={halfB} /></g>;
  }
  return <g><rect className="fp-body" width={w} height={d} rx="3" /><rect className="fp-back" width={w} height={back} rx="2" />
    {leftArm && <rect className="fp-arm" width={arm} height={d} rx="2" />}{rightArm && <rect className="fp-arm" x={w - arm} width={arm} height={d} rx="2" />}
    {Array.from({ length: seatCount }, (_, index) => cushion(index))}
    {recliner && <path className="fp-stitch" d={`M${(from + to) / 2 - 5} ${d - 7}l5 4l5 -4`} />}</g>;
}

/** Published size: a corner's footprint is W along each wall, but its catalog label is W x D (D = the attach edge). */
const publishedSize = (item) => ({ width: item.publishedWidth || item.baseWidth, depth: item.attachIn || item.baseHeight });

const pieceTransform = (item) => {
  const { x, y, baseWidth: w, baseHeight: d } = item;
  const flip = item.mirror ? ` translate(${w} 0) scale(-1 1)` : '';
  return `${rotationTransform(normalizeRotation(item.rotation), x, y, w, d)}${flip}`;
};
const rotationTransform = (rotation, x, y, w, d) => {
  switch (rotation) {
    case 90: return `translate(${x} ${y}) translate(${d} 0) rotate(90)`;
    case 180: return `translate(${x} ${y}) translate(${w} ${d}) rotate(180)`;
    case 270: return `translate(${x} ${y}) translate(0 ${w}) rotate(270)`;
    default: return `translate(${x} ${y})`;
  }
};

/** Where a piece's label sits on the plan. A corner's box centre is the empty void in front of the wedge, so use its seat. */
const labelPoint = (item) => {
  const { x, y, baseWidth: w, baseHeight: d } = item;
  let lx = w / 2; let ly = d / 2;
  if (item.kind === 'corner') { lx = w * 0.42; ly = w * 0.42; }
  if (item.mirror) lx = w - lx;
  switch (normalizeRotation(item.rotation)) {
    case 90: return { x: x + d - ly, y: y + lx };
    case 180: return { x: x + w - lx, y: y + d - ly };
    case 270: return { x: x + ly, y: y + w - lx };
    default: return { x: x + lx, y: y + ly };
  }
};

export function SectionalDesignStudio({ catalog, onCopy, initialModelCode = '724', onModelChange }) {
  const profiles = (catalog.product_profiles || []).filter((profile) => profile.pieces?.length);
  const [modelCode, setModelCode] = useState(String(initialModelCode));
  const profile = profiles.find((item) => String(item.model_code) === modelCode) || profiles[0];
  const [selectedKey, setSelectedKey] = useState('');
  const [variantByKey, setVariantByKey] = useState({});
  const [focus, setFocus] = useState(false);
  const [dockOpen, setDockOpen] = useState(false);
  const [alt, setAlt] = useState(null); // other connection spots for the piece that was just placed
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
  const selectedCode = variants.find((entry) => entry.code === variantByKey[selectedPiece?.key])?.code || variants[0]?.code || selectedPiece?.prefix?.split('/')[0]?.trim() || '';
  const selectedSource = profile?.pieces.find((entry) => entry.key === selectedPiece?.key);
  const selectedSize = parsePieceDimensions(selectedSource?.dimensions_text);
  const room = useMemo(() => ({ width: roomWidth * 12, height: roomDepth * 12 }), [roomWidth, roomDepth]);
  const validation = validateSectionalStudioLayout(items, room, catalog);
  const reach = reachConflicts(items, room);
  const summary = layoutSummary(items, room);
  const sharedSwatches = useMemo(() => getSharedCoverSwatches(catalog, items), [catalog, items]);
  const coverReady = Boolean(cover) && pattern.length === 4 && color.length === 2 && sharedSwatches.some((item) => item.code === `${cover}${pattern}${color}`);
  const canCopy = items.length > 0 && validation.valid && coverReady;
  const rmsRows = items.map((piece) => (coverReady ? buildSectionalStudioRmsLine(piece, cover, pattern, color) : `${piece.code}-${piece.modelCode}`));
  const rmsText = rmsRows.join('\n');
  const selectedItem = items.find((item) => item.id === selectedId);

  const commit = (next) => {
    setHistory((current) => ({ past: [...current.past.slice(-59), itemsRef.current], future: [] }));
    setItems(next);
  };
  const undo = () => setHistory((current) => {
    setAlt(null);
    if (!current.past.length) return current;
    const previous = current.past[current.past.length - 1];
    setItems(previous);
    return { past: current.past.slice(0, -1), future: [itemsRef.current, ...current.future] };
  });
  const redo = () => setHistory((current) => {
    setAlt(null);
    if (!current.future.length) return current;
    const [next, ...rest] = current.future;
    setItems(next);
    return { past: [...current.past, itemsRef.current], future: rest };
  });
  const setProfile = (code) => {
    setAlt(null);
    setModelCode(code);
    setItems([]); setHistory({ past: [], future: [] }); setSelectedId(''); setSelectedKey(''); setVariantByKey({}); setNotice('');
    onModelChange?.(code);
  };
  const validateTrial = (list) => validateSectionalStudioLayout(list, room, catalog);
  const spotsFor = (draft, list = items) => (list.length ? rankPlacements(draft, placementCandidates(draft, list, room), list, room, { validate: validateTrial, selectedId }) : []);
  const addPiece = (piece) => {
    if (!profile || !piece) return;
    const code = variants.length && selectedPiece?.key === piece.key ? selectedCode : (variantByKey[piece.key] || '');
    const draft = createItem(piece, profile, 0, 0, 0, code || undefined);
    if (!draft) { setNotice('This piece has no width and depth in the catalog, so it cannot be drawn to scale.'); return; }
    setSelectedKey(piece.key);
    const spots = spotsFor(draft);
    if (spots.length) {
      const best = spots[0];
      const anchor = items.find((entry) => entry.id === best.anchorId);
      commit(applyPlacement(items, draft, best));
      setSelectedId(draft.id);
      setAlt(spots.length > 1 ? { id: draft.id, draft, base: items, spots, index: 0 } : null);
      setNotice(`${best.shift ? 'Slotted in at' : 'Joined to'} the ${best.anchorSide} side of ${anchor?.code || 'the last piece'}.${best.shift ? ' The pieces beyond it slid along to make room.' : ''}${spots.length > 1 ? ` ${spots.length - 1} other spot${spots.length > 2 ? 's' : ''} fit.` : ''}${best.errors.length ? ` ${best.errors[0]}` : ''}`);
    } else {
      const spot = findFreeSpot(draft, items, room);
      if (!spot) { setNotice('There is no free space left in this room for that piece. Make the room larger or remove a piece.'); return; }
      commit([...items, { ...draft, ...spot }]); setSelectedId(draft.id); setAlt(null);
      setNotice(items.length ? 'No open connection fits this piece, so it was placed loose. Move it against a piece, or turn or remove a neighbour.' : '');
    }
    if (narrowScreen()) setFocus(true);
  };
  const useSpot = (index) => {
    if (!alt) return;
    const spot = alt.spots[index];
    if (!spot) return;
    commit(applyPlacement(alt.base, alt.draft, spot));
    setAlt({ ...alt, index });
    const anchor = items.find((entry) => entry.id === spot.anchorId);
    setNotice(`${spot.shift ? 'Slotted in at' : 'Joined to'} the ${spot.anchorSide} side of ${anchor?.code || 'a piece'}.${spot.errors.length ? ` ${spot.errors[0]}` : ''}`);
  };
  const applyPreset = (kind) => {
    const next = presetItems(kind, profile, pieces, room);
    if (!next) {
      const fitsBigRoom = presetItems(kind, profile, pieces, { width: 1200, height: 1200 });
      setNotice(fitsBigRoom ? 'That layout is bigger than this room. Make the room larger to use it.' : 'This collection does not list every piece that layout needs. Choose another layout or collection.');
      return;
    }
    commit(next); setAlt(null); setSelectedId(next[0]?.id || '');
    if (narrowScreen()) setFocus(true);
    setNotice('Layout loaded to scale. Check every connection against the collection tear pad before ordering.');
  };
  const toPoint = (event) => {
    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = event.clientX; point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  };
  const startDrag = (event, piece) => {
    if (alt && alt.id !== piece.id) setAlt(null);
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
    commit(next); setNotice(''); setAlt(null);
  };
  const removeSelected = () => { if (!selectedItem) return; setAlt(null); commit(items.filter((item) => item.id !== selectedId)); setSelectedId(''); };
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

  const bounds = items.length ? { x0: Math.min(...items.map((i) => i.x)), y0: Math.min(...items.map((i) => i.y)), x1: Math.max(...items.map((i) => i.x + i.width)), y1: Math.max(...items.map((i) => i.y + i.height)) } : null;
  const full = { x: -MARGIN, y: -MARGIN, w: room.width + MARGIN * 2, h: room.height + MARGIN * 2 };
  const view = (() => {
    if (!focus || !bounds) return full;
    const aspect = full.w / full.h;
    let w = bounds.x1 - bounds.x0 + 64; let h = bounds.y1 - bounds.y0 + 64;
    if (w / h < aspect) w = h * aspect; else h = w / aspect;
    w = Math.min(Math.max(w, 150), full.w); h = w / aspect;
    const cx = (bounds.x0 + bounds.x1) / 2; const cy = (bounds.y0 + bounds.y1) / 2;
    return { x: Math.min(Math.max(cx - w / 2, full.x), full.x + full.w - w), y: Math.min(Math.max(cy - h / 2, full.y), full.y + full.h - h), w, h };
  })();
  const viewBox = `${view.x} ${view.y} ${view.w} ${view.h}`;
  const unit = view.w / full.w; // 1 at full room; smaller when zoomed in, so text stays proportionate
  const gridLines = (length, step) => Array.from({ length: Math.floor(length / step) - 1 }, (_, index) => (index + 1) * step);
  const dimTop = bounds && bounds.y0 >= 16;
  const dimLeft = bounds && bounds.x0 >= 16;
  const dimY = bounds ? (dimTop ? bounds.y0 - 7 : bounds.y1 + 7) : 0;
  const dimX = bounds ? (dimLeft ? bounds.x0 - 7 : bounds.x1 + 7) : 0;
  const tick = 2.5;
  const label = Math.max(4, 6.5 * Math.max(unit, 0.55));
  const fitsNow = useMemo(() => Object.fromEntries(items.length ? pieces.map((piece) => { const draft = createItem(piece, profile, 0, 0, 0, variantByKey[piece.key]); return [piece.key, draft ? placementCandidates(draft, items, room).length > 0 : false]; }) : []), [items, pieces, profile, room, variantByKey]);
  const trayDraft = (piece) => createItem(piece, profile, 0, 0, 0, variantByKey[piece.key]);
  const variantsOfSelected = variants.length > 1 ? variants : [];

  return <section className="module-page design-studio">
    <div className="module-intro"><h1>Sectional <em>Studio</em></h1></div>
    <div className="studio-toolbar card">
      <label className="form-field"><span>Collection</span><select value={profile?.model_code || ''} onChange={(event) => setProfile(event.target.value)}>{[...new Set(profiles.map((entry) => entry.sectional_family))].map((family) => <optgroup key={family} label={family}>{profiles.filter((entry) => entry.sectional_family === family).map((entry) => <option key={entry.model_code} value={entry.model_code}>{entry.model_name} · {entry.model_code}</option>)}</optgroup>)}</select></label>
      <fieldset className="studio-room-fields"><legend>Room, feet</legend><label>Width <input type="number" inputMode="numeric" min="8" max="40" value={roomWidth} onChange={(event) => setRoomWidth(Math.max(8, Math.min(40, Number(event.target.value) || 8)))} /></label><span aria-hidden="true">×</span><label>Depth <input type="number" inputMode="numeric" min="8" max="40" value={roomDepth} onChange={(event) => setRoomDepth(Math.max(8, Math.min(40, Number(event.target.value) || 8)))} /></label></fieldset>
      <div className="studio-layouts" role="group" aria-label="Starting layouts"><span>Start from</span>{[['l-standard', 'L-shape'], ['l-console', 'L with console'], ['u-shape', 'U-shape'], ['straight-chaise', 'Sofa with chaise']].map(([key, text]) => <button key={key} type="button" className="chip" onClick={() => applyPreset(key)}>{text}</button>)}</div>
    </div>
    <div className="studio-workspace">
      <section className="studio-board-card card">
        <div className="studio-tray" role="group" aria-label={`${profile?.model_name || 'Collection'} pieces. Tap one to add it.`}>
          {pieces.map((piece) => { const draft = trayDraft(piece); return <button key={piece.key} type="button" className={`studio-tile ${selectedKey === piece.key ? 'on' : ''} ${items.length && fitsNow[piece.key] === false ? 'nofit' : ''}`} disabled={!draft} onClick={() => addPiece(piece)}>
            <svg viewBox={draft ? `-3 -3 ${draft.baseWidth + 6} ${draft.baseHeight + 6}` : '0 0 10 10'} aria-hidden="true" focusable="false">{draft && <PieceArt item={draft} />}</svg>
            <strong>{piece.name}</strong><small>{!draft ? 'No size listed' : items.length && fitsNow[piece.key] === false ? 'No open spot' : `${formatInches(publishedSize(draft).width)} × ${formatInches(publishedSize(draft).depth)}`}</small>
          </button>; })}
        </div>
        {variantsOfSelected.length > 0 && <div className="studio-variants" role="group" aria-label={`${selectedPiece?.name} version`}><span>{selectedPiece?.name}</span>{variantsOfSelected.map((entry) => <button key={entry.code} type="button" className={`chip ${selectedCode === entry.code ? 'on' : ''}`} aria-pressed={selectedCode === entry.code} onClick={() => setVariantByKey((current) => ({ ...current, [selectedPiece.key]: entry.code }))}>{entry.code}{entry.label ? ` · ${entry.label}` : ''}</button>)}</div>}
        <div className="studio-tools" role="toolbar" aria-label="Plan tools">
          <button type="button" onClick={undo} disabled={!history.past.length} aria-label="Undo"><Undo2 size={16} /><span>Undo</span></button>
          <button type="button" onClick={redo} disabled={!history.future.length} aria-label="Redo"><Redo2 size={16} /><span>Redo</span></button>
          <i aria-hidden="true" />
          <button type="button" className={snapEdges ? 'on' : ''} aria-pressed={snapEdges} onClick={() => setSnapEdges(!snapEdges)}>Snap</button>
          <button type="button" className={showReach ? 'on' : ''} aria-pressed={showReach} onClick={() => setShowReach(!showReach)}>Reach</button>
          <button type="button" className={showSizes ? 'on' : ''} aria-pressed={showSizes} onClick={() => setShowSizes(!showSizes)}>Sizes</button>
          <button type="button" className={focus ? 'on' : ''} aria-pressed={focus} onClick={() => setFocus(!focus)} disabled={!items.length}><Scan size={15} /> Zoom to fit</button>
          <button type="button" className="studio-print" onClick={() => window.print()} aria-label="Print plan"><Printer size={16} /><span>Print</span></button>
        </div>
        <div className="studio-board-wrap">
          <svg ref={svgRef} className="studio-svg" viewBox={viewBox} tabIndex={0} role="application" aria-label={`${roomWidth} by ${roomDepth} foot floor plan. Arrow keys move the selected piece, R turns it, Delete removes it.`}
            onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={onKeyDown} onPointerDown={(event) => { if (event.target === event.currentTarget || event.target.classList?.contains('fp-floor')) setSelectedId(''); }}>
            <rect className="fp-wall" x={-WALL} y={-WALL} width={room.width + WALL * 2} height={room.height + WALL * 2} />
            <rect className="fp-floor" x="0" y="0" width={room.width} height={room.height} />
            {gridLines(room.width, 12).map((x) => <line key={`gx${x}`} className={x % 60 ? 'fp-grid' : 'fp-grid fp-grid-major'} x1={x} y1="0" x2={x} y2={room.height} />)}
            {gridLines(room.height, 12).map((y) => <line key={`gy${y}`} className={y % 60 ? 'fp-grid' : 'fp-grid fp-grid-major'} x1="0" y1={y} x2={room.width} y2={y} />)}
            {!focus && <><text className="fp-dim" x={room.width / 2} y={-8} textAnchor="middle">{roomWidth}′</text>
            <text className="fp-dim" x={-9} y={room.height / 2} textAnchor="middle" transform={`rotate(-90 -9 ${room.height / 2})`}>{roomDepth}′</text></>}
            {showReach && items.map((item) => { const zone = reachRect(item); return zone ? <rect key={`r${item.id}`} className={`fp-reach ${reach.some((entry) => entry.id === item.id) ? 'blocked' : ''}`} x={zone.x} y={zone.y} width={zone.width} height={zone.height} /> : null; })}
            {alt && alt.spots.slice(0, 8).map((spot, index) => index === alt.index ? null : <g key={`ghost${index}`} className="fp-ghost" role="button" tabIndex={0} aria-label={`Move to spot ${index + 1}: ${spot.anchorSide} side of a neighbour`} onPointerDown={(event) => { event.stopPropagation(); useSpot(index); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); useSpot(index); } }}>
              <rect x={spot.x} y={spot.y} width={spot.width} height={spot.height} rx="3" /><text x={spot.x + spot.width / 2} y={spot.y + spot.height / 2} textAnchor="middle" dominantBaseline="central" fontSize="9">+</text>
            </g>)}
            {items.map((item) => <g key={item.id} className={`fp-piece ${selectedId === item.id ? 'selected' : ''}`} onPointerDown={(event) => startDrag(event, item)} role="button" tabIndex={0} aria-label={`${item.name}, ${item.code}, ${formatInches(publishedSize(item).width)} wide by ${formatInches(publishedSize(item).depth)} deep. Select or drag.`} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedId(item.id); } }}>
              <g transform={pieceTransform(item)}><PieceArt item={item} /></g>
              <rect className="fp-outline" x={item.x} y={item.y} width={item.width} height={item.height} />
            </g>)}
            {items.map((item) => { const at = labelPoint(item); const size = Math.max(4.5, Math.min(9, Math.min(item.width, item.height) * 0.22)); return <g key={`t${item.id}`} className="fp-labels" pointerEvents="none">
              <text className="fp-code" x={at.x} y={at.y} textAnchor="middle" dominantBaseline="central" fontSize={size}>{item.code}</text>
              {showSizes && item.width >= 44 && item.height >= 30 && <text className="fp-size" x={at.x} y={at.y + size * 1.2} textAnchor="middle" dominantBaseline="central" fontSize={Math.max(3.8, size * 0.62)}>{formatInches(publishedSize(item).width)} × {formatInches(publishedSize(item).depth)}</text>}
            </g>; })}
            {bounds && <g className="fp-measure" pointerEvents="none">
              <path d={`M${bounds.x0} ${dimY}H${bounds.x1}M${bounds.x0} ${dimY - tick}V${dimY + tick}M${bounds.x1} ${dimY - tick}V${dimY + tick}`} />
              <text x={(bounds.x0 + bounds.x1) / 2} y={dimTop ? dimY - 2.5 : dimY + label + 1.5} textAnchor="middle" fontSize={label}>{formatInches(bounds.x1 - bounds.x0)}</text>
              <path d={`M${dimX} ${bounds.y0}V${bounds.y1}M${dimX - tick} ${bounds.y0}H${dimX + tick}M${dimX - tick} ${bounds.y1}H${dimX + tick}`} />
              <text x={dimLeft ? dimX - 2.5 : dimX + label} y={(bounds.y0 + bounds.y1) / 2} textAnchor="middle" fontSize={label} transform={`rotate(-90 ${dimLeft ? dimX - 2.5 : dimX + label} ${(bounds.y0 + bounds.y1) / 2})`}>{formatInches(bounds.y1 - bounds.y0)}</text>
            </g>}
            {!focus && <g className="fp-scale" pointerEvents="none"><rect x="0" y={room.height + 6} width="60" height="2.5" /><text x="0" y={room.height + 14} fontSize="5.5">5′ scale</text></g>}
          </svg>
          {!items.length && <div className="studio-board-empty"><Sofa size={38} /><strong>Tap a piece above, or start from a layout</strong><span>Pieces are drawn at real size and can’t overlap.</span></div>}
        </div>
        <div className="studio-selected" aria-live="polite">{selectedItem ? <>
          <div><strong>{selectedItem.name} · {selectedItem.code}</strong><span>{formatInches(publishedSize(selectedItem).width)} W × {formatInches(publishedSize(selectedItem).depth)} D{selectedItem.heightIn ? ` × ${formatInches(selectedItem.heightIn)} H` : ''}{selectedItem.reachIn ? ` · ${formatInches(selectedItem.reachIn)} reclined` : ''}{selectedItem.kind === 'corner' ? ` · ${formatInches(selectedItem.baseWidth)} along each wall${selectedItem.reachSource === 'estimated' ? ' (estimated)' : ''}` : ''}</span></div>
          {alt && alt.id === selectedId && alt.spots.length > 1 && <button type="button" onClick={() => useSpot((alt.index + 1) % alt.spots.length)} aria-label="Try the next connection spot"><Scan size={18} /> Next spot {alt.index + 1}/{Math.min(alt.spots.length, 99)}</button>}
          <button type="button" onClick={rotateSelected} aria-label="Rotate selected piece 90 degrees"><RotateCw size={18} /> Rotate</button>
          <button type="button" className="danger" onClick={removeSelected} aria-label="Remove selected piece"><Trash2 size={18} /> Remove</button>
        </> : <span className="studio-hint">{items.length ? 'Tap a piece to turn or remove it. Drag to move.' : 'Pieces you add appear in the room at real size.'}</span>}</div>
        {summary && <details className="studio-summary"><summary><strong>{formatInches(summary.width)} × {formatInches(summary.depth)}</strong> overall · gaps to walls</summary><span>Left {formatInches(summary.gaps.left)} · right {formatInches(summary.gaps.right)} · top {formatInches(summary.gaps.top)} · bottom {formatInches(summary.gaps.bottom)}</span></details>}
        {notice && <p className="studio-notice" role="status">{notice}</p>}
      </section>
      <aside className="studio-parts card">
        {items.length > 0 && <div className={`studio-check ${validation.valid && items.length ? 'valid' : validation.errors.length ? 'invalid' : ''}`} role="status"><strong>{validation.valid ? 'Layout checks passed' : 'Review the layout'}</strong>{validation.errors.map((error) => <small key={error}>{error}</small>)}{reach.map((entry) => <small key={entry.id}>{entry.code} cannot fully recline: {entry.reason === 'wall' ? 'a wall is in the way.' : `${entry.blocker} is in the way.`}</small>)}{validation.warnings.map((warning) => <small key={warning}>{warning}</small>)}</div>}
        <div className="studio-cover">{items.length ? <CoverPicker key={sharedSwatches.length} swatches={sharedSwatches} value={coverReady ? `${cover}${pattern}${color}` : ''} onChange={(code, match) => { setCover(match?.grade || ''); setPattern(match?.pattern || ''); setColor(match?.color || ''); }} /> : <p className="studio-hint">Add a piece, then choose one cover that every piece can be built in.</p>}</div>
      </aside>
    </div>
    <section className={`studio-dock ${dockOpen ? 'open' : ''}`} aria-live="polite">
      <div className="studio-dock-bar">
        <button type="button" className="studio-dock-toggle" onClick={() => setDockOpen(!dockOpen)} aria-expanded={dockOpen}><Layers3 size={16} /><span>{items.length} {items.length === 1 ? 'piece' : 'pieces'}</span><ChevronUp size={16} className="chev" /></button>
        <button type="button" className="copy-button" disabled={!canCopy} onClick={copy}><Copy size={16} /> Copy for RMS</button>
      </div>
      {dockOpen && <div className="studio-dock-body">{items.length ? <><div className="studio-order-list">{items.map((item, index) => { const supported = getSectionalPieceOptions(catalog, item.family, item.modelCode, item.code); return <article key={item.id}><span><strong>{item.name}</strong><small>{item.code}-{item.modelCode}{coverReady ? ` · ${cover} ${pattern} ${color}` : ' · cover not chosen'}</small></span><code>{rmsRows[index]}</code>{supported.length > 0 && <small className="studio-order-options">Options: {supported.join(', ')}</small>}</article>; })}</div>
        <p className="studio-order-disclaimer"><Info size={14} /> Entry preview only. Confirm style, cover, options and availability in RMS before promising it.</p></> : <p className="studio-order-empty">Add a piece to see its RMS entry here.</p>}</div>}
    </section>
  </section>;
}
