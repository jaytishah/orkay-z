import { MAP_W, MAP_H, origin, pins, arcs, landPath } from '@/content/worldmap';

/* Static server-rendered export map — dark world, red pins, arcs out of Morbi.
   All animation is CSS, triggered by the shared .is-inview reveal in Motion. */
export default function GlobalMap() {
  return (
    <div className="globalmap">
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        role="img"
        aria-label="World map of ORKAY export markets — shipping from Morbi, India to 40+ countries"
      >
        <defs>
          {/* soft heat under the hub — a gradient, not a filter, so it costs nothing to paint */}
          <radialGradient id="gm-hub">
            <stop offset="0%" stopColor="#ed1c24" stopOpacity="0.34" />
            <stop offset="55%" stopColor="#ed1c24" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ed1c24" stopOpacity="0" />
          </radialGradient>
        </defs>

        <path className="globalmap__land" d={landPath} />
        <circle className="globalmap__glow" cx={origin.x} cy={origin.y} r={110} fill="url(#gm-hub)" />

        {arcs.map((d, i) => (
          <path
            key={d}
            className="globalmap__arc"
            d={d}
            pathLength={1}
            style={{ transitionDelay: `${0.5 + i * 0.06}s` }}
          />
        ))}

        {pins.map((p, i) => (
          <g key={p.name} className="globalmap__pin" style={{ transitionDelay: `${1.5 + i * 0.06}s` }}>
            <title>{p.name}</title>
            <circle className="globalmap__pulse" cx={p.x} cy={p.y} r={4} style={{ animationDelay: `${i * 0.23}s` }} />
            <circle className="globalmap__dot" cx={p.x} cy={p.y} r={2.4} />
          </g>
        ))}

        <g className="globalmap__pin globalmap__origin">
          <title>{origin.name}</title>
          <circle className="globalmap__pulse" cx={origin.x} cy={origin.y} r={6} />
          <circle className="globalmap__ring" cx={origin.x} cy={origin.y} r={12} />
          <circle className="globalmap__dot" cx={origin.x} cy={origin.y} r={4} />
          <text className="globalmap__label" x={origin.x} y={origin.y + 18}>
            MORBI · INDIA
          </text>
        </g>
      </svg>
    </div>
  );
}
