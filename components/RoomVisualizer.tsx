'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Quad, Room, VizTile } from '@/content/pages';

/* eslint-disable @next/next/no-img-element -- same reason as the rest of the site */

/* ── projective mapping ──────────────────────────────────────────────
   Maps the unit square (0,0) (1,0) (1,1) (0,1) onto an arbitrary convex
   quad and returns the 3x3 homography as a CSS matrix3d string.

   Closed form from Heckbert, "Fundamentals of Texture Mapping and Image
   Warping" §2.2. CSS matrix3d is column-major, so the 3x3
       | a b c |
       | d e f |
       | g h 1 |
   ships as matrix3d(a,d,0,g, b,e,0,h, 0,0,1,0, c,f,0,1). The g and h
   terms are what give the floor its perspective — an affine transform
   cannot do this, which is why the tile is not simply skewed.        */
function quadToMatrix3d(p: Quad, w: number, h: number): string {
  const [x0, y0] = [p[0][0] * w, p[0][1] * h];
  const [x1, y1] = [p[1][0] * w, p[1][1] * h];
  const [x2, y2] = [p[2][0] * w, p[2][1] * h];
  const [x3, y3] = [p[3][0] * w, p[3][1] * h];

  const sx = x0 - x1 + x2 - x3;
  const sy = y0 - y1 + y2 - y3;

  let a: number, b: number, c: number, d: number, e: number, f: number, g: number, hh: number;

  if (Math.abs(sx) < 1e-9 && Math.abs(sy) < 1e-9) {
    /* the quad is a parallelogram — affine is exact, no perspective term */
    a = x1 - x0; b = x2 - x1; c = x0;
    d = y1 - y0; e = y2 - y1; f = y0;
    g = 0; hh = 0;
  } else {
    const dx1 = x1 - x2, dx2 = x3 - x2;
    const dy1 = y1 - y2, dy2 = y3 - y2;
    const den = dx1 * dy2 - dx2 * dy1;
    if (Math.abs(den) < 1e-9) return 'matrix3d(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1)';
    g = (sx * dy2 - dx2 * sy) / den;
    hh = (dx1 * sy - sx * dy1) / den;
    a = x1 - x0 + g * x1;
    b = x3 - x0 + hh * x3;
    c = x0;
    d = y1 - y0 + g * y1;
    e = y3 - y0 + hh * y3;
    f = y0;
  }

  const m = [a, d, 0, g, b, e, 0, hh, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map((n) => Number(n.toFixed(6))).join(',')})`;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export default function RoomVisualizer({ rooms, tiles }: { rooms: Room[]; tiles: VizTile[] }) {
  const [roomIx, setRoomIx] = useState(0);
  const [tileIx, setTileIx] = useState(0);
  const [across, setAcross] = useState(7);
  const [shaded, setShaded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [quads, setQuads] = useState<Quad[]>(() => rooms.map((r) => r.quad.map((pt) => [...pt]) as Quad));
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [copied, setCopied] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const dragIx = useRef<number | null>(null);

  const room = rooms[roomIx];
  const tile = tiles[tileIx];
  const quad = quads[roomIx];

  /* the homography needs real pixels, so track the stage box */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const moveCorner = useCallback(
    (clientX: number, clientY: number) => {
      const el = stageRef.current;
      const i = dragIx.current;
      if (!el || i === null) return;
      const r = el.getBoundingClientRect();
      const nx = clamp((clientX - r.left) / r.width, -0.25, 1.25);
      const ny = clamp((clientY - r.top) / r.height, -0.25, 1.25);
      setQuads((prev) => {
        const next = prev.map((q) => q.map((pt) => [...pt]) as Quad);
        next[roomIx][i] = [nx, ny];
        return next;
      });
    },
    [roomIx],
  );

  useEffect(() => {
    if (!editing) return;
    const onMove = (e: PointerEvent) => {
      if (dragIx.current === null) return;
      e.preventDefault();
      moveCorner(e.clientX, e.clientY);
    };
    const onUp = () => { dragIx.current = null; };
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [editing, moveCorner]);

  const polygon = quad.map(([x, y]) => `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`).join(', ');
  const matrix = box.w > 0 ? quadToMatrix3d(quad, box.w, box.h) : '';
  /* tile size is measured across the near edge, so the slider reads as
     "how many tiles wide is the front of the room" */
  const tilePx = box.w > 0 ? box.w / across : 0;

  const copyQuad = async () => {
    const text = `quad: [${quad.map(([x, y]) => `[${x.toFixed(3)}, ${y.toFixed(3)}]`).join(', ')}],`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the numbers are on screen anyway */
      setCopied(false);
    }
  };

  return (
    <div className="viz">
      <div className="viz__stage" ref={stageRef}>
        <img className="viz__room" src={room.img} alt={room.alt} />

        {matrix ? (
          <>
            <div className="viz__surface" style={{ clipPath: `polygon(${polygon})` }} aria-hidden="true">
              <div
                className="viz__tile"
                style={{
                  width: box.w,
                  height: box.h,
                  transform: `${matrix} scale(${1 / box.w}, ${1 / box.h})`,
                  backgroundImage: `url(${tile.img})`,
                  backgroundSize: `${tilePx}px ${tilePx}px`,
                }}
              />
            </div>
            {/* the room's own photograph, re-applied over the new surface and
                clipped to the same floor, so the room's shadows, reflections and
                falloff land back on top of it. Multiplying the TILE directly
                would erase any tile lighter than the floor it replaced. */}
            {shaded ? (
              <div
                className="viz__shade"
                style={{ clipPath: `polygon(${polygon})`, backgroundImage: `url(${room.img})` }}
                aria-hidden="true"
              />
            ) : null}
          </>
        ) : null}

        {editing
          ? quad.map(([x, y], i) => (
              <button
                key={i}
                type="button"
                className="viz__handle"
                style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  dragIx.current = i;
                }}
                aria-label={`Move floor corner ${i + 1}`}
              />
            ))
          : null}

        <p className="text-small viz__caption">
          {room.name} · {tile.name}
        </p>
      </div>

      <div className="viz__controls">
        <div className="viz__group">
          <p className="text-small viz__legend">Room</p>
          <div className="viz__rooms">
            {rooms.map((r, i) => (
              <button
                key={r.name}
                type="button"
                className={`text-small viz__chip${i === roomIx ? ' is-active' : ''}`}
                onClick={() => setRoomIx(i)}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        <div className="viz__group">
          <p className="text-small viz__legend">Surface</p>
          <div className="viz__swatches">
            {tiles.map((t, i) => (
              <button
                key={t.name}
                type="button"
                className={`viz__swatch${i === tileIx ? ' is-active' : ''}`}
                onClick={() => setTileIx(i)}
                title={`${t.name} — ${t.meta}`}
                aria-label={`${t.name}, ${t.meta}`}
              >
                <img src={t.img} alt="" />
                <span className="text-small">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="viz__group viz__group--row">
          <label className="text-small viz__legend" htmlFor="viz-scale">
            Tiles across
          </label>
          <input
            id="viz-scale"
            type="range"
            min={3}
            max={16}
            step={1}
            value={across}
            onChange={(e) => setAcross(Number(e.target.value))}
            className="viz__range"
          />
          <span className="text-small viz__value">{across}</span>
        </div>

        <div className="viz__group viz__group--row">
          <p className="text-small viz__legend">Blend</p>
          <button
            type="button"
            className={`text-small viz__chip${shaded ? ' is-active' : ''}`}
            onClick={() => setShaded(true)}
          >
            Keep room light
          </button>
          <button
            type="button"
            className={`text-small viz__chip${!shaded ? ' is-active' : ''}`}
            onClick={() => setShaded(false)}
          >
            True colour
          </button>
        </div>

        <div className="viz__group viz__group--row">
          <button
            type="button"
            className={`text-small viz__chip${editing ? ' is-active' : ''}`}
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? 'Done adjusting' : 'Adjust floor'}
          </button>
          {editing ? (
            <>
              <button type="button" className="text-small viz__chip" onClick={copyQuad}>
                {copied ? 'Copied' : 'Copy coordinates'}
              </button>
              <button
                type="button"
                className="text-small viz__chip"
                onClick={() =>
                  setQuads((prev) => {
                    const next = prev.map((q) => q.map((pt) => [...pt]) as Quad);
                    next[roomIx] = rooms[roomIx].quad.map((pt) => [...pt]) as Quad;
                    return next;
                  })
                }
              >
                Reset
              </button>
            </>
          ) : null}
        </div>

        {editing ? (
          <p className="text-small viz__hint">
            Drag the four corners onto the real floor, then copy the coordinates into
            <code> vizRooms </code> in <code>content/pages.ts</code> so the room keeps them.
          </p>
        ) : null}
      </div>
    </div>
  );
}
