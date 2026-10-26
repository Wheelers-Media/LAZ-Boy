import React, { useMemo, useRef, useState } from 'react';
import { Armchair, Copy, Info, Layers3, Minus, Plus, RotateCw, Sofa } from 'lucide-react';
import { buildSectionalStudioRmsLine, getSectionalPieceOptions, sectionalPiecesForFamily, validateSectionalStudioLayout } from './logic.js';

const snap = (value) => Math.round(value / 16) * 16;
const dimensions = (text = '') => ({
  width: Number(text.match(/([\d.]+)\s*["″]?\s*W\b/i)?.[1]) || 42,
  height: Number(text.match(/([\d.]+)\s*["″]?\s*D\b/i)?.[1]) || 40,
});
const itemFor = (piece, profile, x, y, rotation = 0) => {
  const source = profile.pieces.find((entry) => entry.key === piece.key);
  const size = dimensions(source?.dimensions_text);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    modelCode: String(profile.model_code), modelName: profile.model_name, family: profile.sectional_family,
    key: piece.key, name: piece.name, code: piece.variants?.[0]?.code || piece.prefix.split('/')[0].trim(),
    x: snap(x), y: snap(y), width: rotation % 180 ? size.height : size.width,
    height: rotation % 180 ? size.width : size.height, baseWidth: size.width, baseHeight: size.height,
    rotation, dimensionsLabel: source?.dimensions_text || '',
  };
};
const pick = (pieces, pattern) => pieces.find((piece) => pattern.test(piece.key));

function presetItems(kind, profile, pieces, roomWidth, roomHeight) {
  const roomPlanWidth = roomWidth * 12;
  const left = pick(pieces, /^LA_(?:recliner|chair|loveseat|sofa)/i);
  const right = pick(pieces, /^RA_(?:recliner|chair|loveseat|sofa)/i);
  const corner = pick(pieces, /^corner/i);
  const middle = pick(pieces, /armless_(?:chair|loveseat|recliner)/i);
  const console = pick(pieces, /console/i);
  const chaise = pick(pieces, /^(?:LA|RA)_chaise/i);
  const centerY = Math.round(roomHeight * 0.25);
  if (kind === 'l-standard' || kind === 'l-console') {
    if (!left || !right || !corner || (kind === 'l-console' && !console)) return null;
    const c = itemFor(corner, profile, Math.round(roomPlanWidth * (kind === 'l-console' ? 0.35 : 0.48)), centerY);
    const leftVertical = itemFor(left, profile, c.x + (c.width - dimensions(left.dimensionsLabel).height) / 2, c.y + c.height, 270);
    const rightHorizontal = itemFor(right, profile, c.x + c.width, c.y + (c.height - dimensions(right.dimensionsLabel).height) / 2);
    if (kind === 'l-console') {
      const s = itemFor(console, profile, c.x + c.width, c.y + (c.height - dimensions(console.dimensionsLabel).height) / 2);
      const r = itemFor(right, profile, s.x + s.width, s.y + (s.height - dimensions(right.dimensionsLabel).height) / 2);
      return [leftVertical, c, s, r];
    }
    return [leftVertical, c, rightHorizontal];
  }
  if (kind === 'u-shape') {
    if (!left || !right || !corner || !middle) return null;
    const lowerCorner = itemFor(corner, profile, Math.round(roomPlanWidth * 0.2), centerY, 0);
    const middleSeat = itemFor(middle, profile, lowerCorner.x + lowerCorner.width, lowerCorner.y + (lowerCorner.height - dimensions(middle.dimensionsLabel).height) / 2, 0);
    const rightCorner = itemFor(corner, profile, middleSeat.x + middleSeat.width, centerY, 180);
    const leftSeat = itemFor(left, profile, lowerCorner.x + (lowerCorner.width - dimensions(left.dimensionsLabel).height) / 2, lowerCorner.y + lowerCorner.height, 270);
    const rightSeat = itemFor(right, profile, rightCorner.x + (rightCorner.width - dimensions(right.dimensionsLabel).height) / 2, rightCorner.y + rightCorner.height, 90);
    return [leftSeat, lowerCorner, middleSeat, rightCorner, rightSeat];
  }
  if (kind === 'straight-chaise') {
    if (!left || !right || !chaise) return null;
    const leftChaise = itemFor(chaise, profile, Math.round(roomPlanWidth * 0.15), centerY);
    const rightChaise = pick(pieces, /^RA_chaise/i);
    const middleSeat = middle && itemFor(middle, profile, leftChaise.x + leftChaise.width, centerY + (leftChaise.height - dimensions(middle.dimensionsLabel).height) / 2);
    const end = rightChaise
      ? itemFor(rightChaise, profile, middleSeat ? middleSeat.x + middleSeat.width : leftChaise.x + leftChaise.width, centerY)
      : itemFor(right, profile, middleSeat ? middleSeat.x + middleSeat.width : leftChaise.x + leftChaise.width, centerY + (leftChaise.height - dimensions(right.dimensionsLabel).height) / 2);
    return [leftChaise, ...(middleSeat ? [middleSeat] : []), end];
  }
  return null;
}

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
  const [cover, setCover] = useState('D');
  const [pattern, setPattern] = useState('1808');
  const [color, setColor] = useState('52');
  const [notice, setNotice] = useState('');
  const boardRef = useRef(null);
  const pieces = useMemo(() => profile ? sectionalPiecesForFamily(catalog, profile.sectional_family, String(profile.model_code)) : [], [catalog, profile]);
  const selectedPiece = pieces.find((piece) => piece.key === selectedKey) || pieces[0];
  const variants = selectedPiece?.variants?.length ? selectedPiece.variants : (selectedPiece?.prefix || '').split('/').map((code) => ({ code: code.trim(), label: '' }));
  const selectedCode = variants.find((entry) => entry.code === selectedVariant)?.code || variants[0]?.code || selectedPiece?.prefix?.split('/')[0]?.trim() || '';
  const roomPlanWidth = roomWidth * 12;
  const roomHeight = roomDepth * 12;
  const validation = validateSectionalStudioLayout(items, { width: roomPlanWidth, height: roomHeight }, catalog);
  const canCopy = items.length > 0 && validation.valid;
  const coverCodes = catalog.cover_cap_codes || [];
  const activeCover = coverCodes.find((entry) => entry.code === cover);
  const rmsRows = items.map((piece) => buildSectionalStudioRmsLine(piece, cover, pattern, color));
  const rmsText = rmsRows.join('\n');

  const setProfile = (code) => {
    setModelCode(code);
    setItems([]); setSelectedId(''); setSelectedKey(''); setSelectedVariant(''); setNotice('');
    onModelChange?.(code);
  };
  const addPiece = () => {
    if (!profile || !selectedPiece || !selectedCode) return;
    const piece = itemFor(selectedPiece, profile, 120 + (items.length % 5) * 56, 120 + Math.floor(items.length / 5) * 56);
    piece.code = selectedCode;
    setItems((current) => [...current, piece]); setSelectedId(piece.id); setNotice('');
  };
  const applyPreset = (kind) => {
    const next = presetItems(kind, profile, pieces, roomWidth, roomHeight);
    if (!next) { setNotice('This collection does not document every piece needed for that preset. Choose another layout or collection.'); return; }
    setItems(next); setSelectedId(next[0]?.id || ''); setNotice('Preset loaded. Move pieces as needed; confirm every connection and SKU in the current ordering system.');
  };
  const startDrag = (event, piece) => {
    event.preventDefault();
    const element = event.currentTarget;
    element.setPointerCapture?.(event.pointerId);
    setSelectedId(piece.id);
    const move = (moveEvent) => {
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = snap((moveEvent.clientX - rect.left) * roomPlanWidth / rect.width - piece.width / 2);
      const y = snap((moveEvent.clientY - rect.top) * roomHeight / rect.height - piece.height / 2);
      setItems((current) => {
        const others = current.filter((item) => item.id !== piece.id);
        let nextX = x;
        let nextY = y;
        let best = 34;
        for (const other of others) {
          const candidateX = [other.x - piece.width, other.x + other.width];
          const overlapsY = Math.min(nextY + piece.height, other.y + other.height) > Math.max(nextY, other.y);
          if (overlapsY) for (const edge of candidateX) {
            const distance = Math.abs(edge - nextX);
            if (distance < best) { best = distance; nextX = edge; }
          }
          const candidateY = [other.y - piece.height, other.y + other.height];
          const overlapsX = Math.min(nextX + piece.width, other.x + other.width) > Math.max(nextX, other.x);
          if (overlapsX) for (const edge of candidateY) {
            const distance = Math.abs(edge - nextY);
            if (distance < best) { best = distance; nextY = edge; }
          }
        }
        return current.map((item) => item.id === piece.id ? { ...item, x: nextX, y: nextY } : item);
      });
    };
    const finish = () => {
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', finish);
      element.removeEventListener('pointercancel', finish);
    };
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', finish, { once: true });
    element.addEventListener('pointercancel', finish, { once: true });
  };
  const rotateSelected = () => setItems((current) => current.map((item) => item.id !== selectedId ? item : ({ ...item, width: item.height, height: item.width, rotation: (item.rotation + 90) % 360 })));
  const removeSelected = () => { setItems((current) => current.filter((item) => item.id !== selectedId)); setSelectedId(''); };
  const selectedItem = items.find((item) => item.id === selectedId);
  const copy = () => { if (canCopy) { onCopy(rmsText); setNotice('RMS entry preview copied. Verify the style, cover, color, and orderability before entry.'); } };

  return <section className="module-page design-studio">
    <div className="module-intro"><p className="eyebrow"><Layers3 size={13} /> FLOOR-PLAN CONFIGURATOR</p><h1>Sectional &amp; Modular <em>Design Studio</em></h1><p>Arrange documented pieces in a room plan, then review a piece-by-piece RMS entry preview.</p></div>
    <div className="studio-toolbar card">
      <label className="form-field"><span>Style / collection · catalog-filtered</span><select value={profile?.model_code || ''} onChange={(event) => setProfile(event.target.value)}>{profiles.map((entry) => <option key={entry.model_code} value={entry.model_code}>{entry.model_name} · {entry.model_code} · {entry.sectional_family}</option>)}</select></label>
      <label className="form-field"><span>Popular preset builds</span><select defaultValue="" onChange={(event) => { if (event.target.value) applyPreset(event.target.value); event.target.value = ''; }}><option value="">Choose a starting layout…</option><option value="l-standard">L-Shape Standard</option><option value="l-console">L-Shape with Console</option><option value="u-shape">U-Shape</option><option value="straight-chaise">Apartment Straight Sofa with Chaise</option></select></label>
      <fieldset className="studio-room-fields"><legend>Room size · feet</legend><label>Width <input type="number" min="8" max="40" value={roomWidth} onChange={(event) => setRoomWidth(Math.max(8, Math.min(40, Number(event.target.value) || 8)))} /></label><label>Depth <input type="number" min="8" max="40" value={roomDepth} onChange={(event) => setRoomDepth(Math.max(8, Math.min(40, Number(event.target.value) || 8)))} /></label></fieldset>
    </div>
    <div className="studio-workspace">
      <section className="studio-board-card card"><div className="studio-section-head"><div><p className="eyebrow">2D TOP-DOWN PLAN</p><h2>{profile?.model_name || 'Collection'} · {roomWidth}′ × {roomDepth}′ room</h2></div><span className="studio-live"><i /> SNAP GRID</span></div>
        <div className="studio-board-wrap"><div ref={boardRef} className="studio-board" style={{ aspectRatio: `${roomWidth} / ${roomDepth}`, backgroundSize: `${16 / roomPlanWidth * 100}% ${16 / roomHeight * 100}%, ${16 / roomPlanWidth * 100}% ${16 / roomHeight * 100}%, ${80 / roomPlanWidth * 100}% ${80 / roomHeight * 100}%, ${80 / roomPlanWidth * 100}% ${80 / roomHeight * 100}%` }} aria-label={`${roomWidth} by ${roomDepth} foot floor plan`}>
          <div className="studio-wall-label">WALL · ROOM BOUNDARY</div>
          {items.map((item, index) => <div key={item.id} role="button" tabIndex={0} className={`studio-piece ${selectedId === item.id ? 'selected' : ''} ${item.rotation ? 'rotated' : ''}`} style={{ left: `${item.x / roomPlanWidth * 100}%`, top: `${item.y / roomHeight * 100}%`, width: `${item.width / roomPlanWidth * 100}%`, height: `${item.height / roomHeight * 100}%` }} onPointerDown={(event) => startDrag(event, item)} onClick={() => setSelectedId(item.id)} onKeyDown={(event) => event.key === 'Enter' && setSelectedId(item.id)} aria-label={`${item.name}, ${item.code}, move or select`}><span className="studio-piece-back"/><span className="studio-piece-index">{String(index + 1).padStart(2, '0')}</span><strong>{item.name}</strong><code>{item.code}</code></div>)}
          {!items.length && <div className="studio-board-empty"><Sofa size={38} /><strong>Start with a preset or add a piece</strong><span>Drag pieces to reposition · select and rotate · snap spacing is 16″</span></div>}
        </div></div>
        <div className="studio-board-controls"><span><span className="studio-wall-key"/> Walls &amp; room boundary</span><span>Drag pieces to move · grid snap 16″</span>{selectedItem && <div className="studio-selected-actions"><strong>{selectedItem.name} · {selectedItem.code}</strong><button type="button" onClick={rotateSelected} aria-label="Rotate selected piece"><RotateCw size={15}/> Rotate 90°</button><button type="button" onClick={removeSelected} aria-label="Remove selected piece"><Minus size={15}/> Remove</button></div>}</div>
        {notice && <p className="studio-notice" role="status">{notice}</p>}
      </section>
      <aside className="studio-parts card"><div className="studio-section-head"><div><p className="eyebrow">{profile?.sectional_family} · {profile?.model_code}</p><h2>Collection pieces</h2></div><span className="studio-parts-count">{pieces.length} types</span></div><label className="form-field"><span>Piece type · only indexed for {profile?.model_name}</span><select value={selectedPiece?.key || ''} onChange={(event) => { setSelectedKey(event.target.value); setSelectedVariant(''); }}>{pieces.map((piece) => <option key={piece.key} value={piece.key}>{piece.name} · {piece.prefix}</option>)}</select></label>
        {variants.length > 1 && <label className="form-field"><span>Piece prefix / power variant</span><select value={selectedCode} onChange={(event) => setSelectedVariant(event.target.value)}>{variants.map((entry) => <option key={entry.code} value={entry.code}>{entry.code}{entry.label ? ` · ${entry.label}` : ''}</option>)}</select></label>}
        <div className="studio-piece-detail"><Armchair size={19}/><span><strong>{selectedPiece?.name || 'Choose a piece'}</strong><small>{selectedPiece?.dimensionsLabel || 'Dimensions are not indexed for this piece.'}</small></span></div>
        <button type="button" className="primary-button studio-add" onClick={addPiece}><Plus size={16}/> Add piece to floor plan</button>
        <div className={`studio-check ${validation.valid && items.length ? 'valid' : validation.errors.length ? 'invalid' : ''}`} role="status"><strong>{!items.length ? 'Plan your room' : validation.valid ? 'Layout checks passed · source confirmation still required' : 'Review the layout'}</strong>{validation.errors.map((error) => <small key={error}>{error}</small>)}{validation.warnings.map((warning) => <small key={warning}>{warning}</small>)}</div>
        <div className="studio-cover"><p className="eyebrow">UPHOLSTERY PLACEHOLDER</p><label className="form-field"><span>Cover / grade reference</span><select value={cover} onChange={(event) => setCover(event.target.value)}><option value="D">D · enter confirmed cover below</option>{coverCodes.map((entry) => <option key={entry.code} value={entry.code}>{entry.code} · {entry.name}</option>)}</select></label><div className="studio-cover-digits"><label>Pattern <input maxLength="4" inputMode="numeric" value={pattern} onChange={(event) => setPattern(event.target.value.replace(/\D/g, '').slice(0, 4))}/></label><label>Color <input maxLength="2" inputMode="numeric" value={color} onChange={(event) => setColor(event.target.value.replace(/\D/g, '').slice(0, 2))}/></label></div><small>{activeCover?.name || 'Cover/grade'} and digits are a placeholder until exact-style eligibility is confirmed.</small></div>
      </aside>
    </div>
    <section className="studio-order-drawer" aria-live="polite"><div className="studio-drawer-head"><div><p className="eyebrow"><Layers3 size={12}/> LIVE RMS ORDER SUMMARY</p><strong>{items.length} configured {items.length === 1 ? 'piece' : 'pieces'}</strong></div><span className="studio-preview-badge">ENTRY PREVIEW · NOT ORDER-VALIDATED</span></div>{items.length ? <><div className="studio-order-list">{items.map((item, index) => { const supported = getSectionalPieceOptions(catalog, item.family, item.modelCode, item.code); return <article key={item.id}><span className="studio-order-num">{String(index + 1).padStart(2, '0')}</span><span><strong>{item.modelName} · {item.name}</strong><small>Prefix {item.code} · Model {item.modelCode} · {cover} {pattern} {color}</small></span><code>{rmsRows[index]}</code>{supported.length > 0 && <small className="studio-order-options">Indexed options: {supported.join(', ')}</small>}</article>; })}</div><div className="studio-copy-row"><pre>{rmsText}</pre><button type="button" className="copy-button" disabled={!canCopy} onClick={copy}><Copy size={14}/> Copy for RMS</button></div></> : <p className="studio-order-empty">Add a piece to see its model, prefix, cover placeholder and draft entry string here.</p>}<p className="studio-order-disclaimer"><Info size={14}/> These are catalog-derived entry references, not guaranteed order SKUs. Verify exact-style cover, options, current availability and assembly with the live RMS/order guide before promising or submitting.</p></section>
  </section>;
}
