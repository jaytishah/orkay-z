import SiteChrome, { Footer } from '@/components/SiteChrome';
import Motion from '@/components/Motion';
import {
  formats, tileTypes, dayCycle,
  site, nearby, spaces, facilities, timeline,
} from '@/content/site';
/* the film-curtain block below is the /z9 layout language — reuse its sheet
   rather than re-declaring .z9-about/.z9-tile here */
import './z9/z9.css';

/* eslint-disable @next/next/no-img-element -- the design system sizes every
   image with object-fit inside fixed-height figures; next/image adds no value
   here and would fight the clip-path reveals. */

/* ORKAY stretch wordmark — slices of "ARKAY text 1-02" laid into a canvas
   sized to the fully-stretched word (the R band doubled). Motion.tsx scales
   the o/r bands on scroll; geometry baked by scripts/slice-wordmark.py.
   Percentages: left/width of canvas width, top/height of canvas height. */
const wordParts: Record<string, { l: number; t: number; w: number; h: number }> = {
  'o-top': { l: 0, t: 0, w: 21.42, h: 15.62 },
  'o-band': { l: 0, t: 15.62, w: 21.42, h: 21.011 },
  'o-bot': { l: 0, t: 36.632, w: 21.42, h: 16.827 },
  'r-top': { l: 23.895, t: 0.276, w: 17.449, h: 29.57 },
  'r-band': { l: 23.895, t: 29.846, w: 17.449, h: 33.173 },
  'r-bot': { l: 23.895, t: 63.019, w: 17.449, h: 3.793 },
  kay: { l: 44.327, t: 0.276, w: 55.673, h: 31.822 },
};

export default function Home() {
  return (
    <>
      <span id="top" />
      <SiteChrome />
      <Motion />

      <main>
        {/* the hero pins for one viewport and 00b rides up over it — the wrapper
            is what ends the pin, so `sticky` never leaks past the curtain */}
        <div className="z9-open">
        {/* 00 · HERO */}
        <section className="section hero ui-dark" data-polarity="dark">
          <h1 className="sr-only">
            ORKAY Tiles — vitrified porcelain tile manufacturer, Morbi, India.
            Crafted in Morbi, designed for the world.
          </h1>
          <figure className="hero__media" data-parallax="0.85">
            {site.heroVideo ? (
              <video src={site.heroVideo} poster={site.heroImage} autoPlay muted loop playsInline />
            ) : (
              <img src={site.heroImage} alt="Living room clad in large-format ORKAY marble-look slabs" />
            )}
          </figure>
          <div className="hero__panel">
            <p className="hero__lede h-mid reveal-lines">
              Premium tiles<br />crafted in Morbi,<br />designed for the world.
            </p>
            <a href="#about" className="hero__scroll" aria-label="Scroll to manufacturing">↓</a>
            <p className="hero__since text-small">Morbi, Gujarat, India</p>
          </div>
          <figure className="hero__ambassador">
            <img src="/img/ambassador_hero.webp" alt="The ORKAY brand ambassador" />
          </figure>
          {/* flex space-between so the glyphs span the viewport exactly,
              whatever the font metrics do */}
          <p className="hero__wordmark" aria-hidden="true">
            {[...'SINCE'].map((c, i) => <span key={i}>{c}</span>)}
            <span className="hero__wordmark-gap" />
            {[...'1996'].map((c, i) => <span key={i}>{c}</span>)}
          </p>
        </section>

        {/* 00b · FILM CURTAIN — full-bleed loop, headline + two tiles */}
        <section className="section z9-about ui-dark" id="terms" data-polarity="dark">
          <div className="z9-about__media" aria-hidden="true">
            <video src="/video/terms_bg.mp4" poster="/img/hero_dusk.jpg" autoPlay muted loop playsInline />
          </div>

          <div className="z9-about__inner" data-parallax="0.5">
            <h2 className="z9-about__title h-display reveal-lines">
              Morbi-made.<br />Market-matched.
            </h2>

            <div className="z9-about__cards">
              <a className="z9-tile z9-tile--dark" href="#applications">
                <span className="z9-tile__label text-small">About the factory</span>
                <span className="z9-tile__play" aria-hidden="true">▶</span>
              </a>

              <a className="z9-tile z9-tile--light" href="#range">
                <span className="z9-tile__label text-small">Private label<br />and mixed loads</span>
                <span className="z9-tile__mid h-mid">Custom Runs</span>
                <span className="z9-tile__cta">
                  <span className="z9-tile__word text-small">
                    See the range
                    <i className="z9-tile__rule" aria-hidden="true" />
                  </span>
                </span>
              </a>
            </div>
          </div>
        </section>
        </div>

        {/* 00c · LOCATION */}
        <section className="section z9-loc ui-light" id="location" data-polarity="light">
          <figure className="z9-loc__media img-reveal">
            <img
              src="/img/privilege_dining.jpg"
              alt="Dining room floored and tabled in ORKAY black marble-look vitrified porcelain at dusk"
            />
          </figure>
          <p className="z9-loc__statement h-mid reveal-lines">
            <span className="z9-loc__indent" aria-hidden="true" />
            Thirty years in Morbi, the town that taught India to fire porcelain.
            Luxury here is not a finish applied at the end. It is fired into the
            body, and it stays.
          </p>
          <div className="z9-loc__word">
            <p className="h-display reveal-lines">Morbi</p>
          </div>
          <hr className="z9-loc__line" />
          <div className="z9-loc__deck">
          <div className="z9-loc__strip">
            {nearby.map((n) => (
              <figure className="z9-loc-card" key={n.title}>
                <img src={n.img} alt={n.alt} />
                <figcaption className="z9-loc-card__lb">
                  <p className="text-small z9-loc-card__meta">{n.meta}</p>
                  <p className="h-mid">{n.title}</p>
                </figcaption>
              </figure>
            ))}
          </div>
            <button className="z9-loc__hit z9-loc__hit--prev" data-strip="prev" aria-label="Previous images" />
            <button className="z9-loc__hit z9-loc__hit--next" data-strip="next" aria-label="Next images" />
          </div>
        </section>

        {/* 00c2 · BRAND WORDMARK */}
        <section className="section exportmap ui-light" id="exports" data-polarity="light">
          <h2 className="sr-only">ORKAY</h2>
          {/* the O and R pull downward as the section scrolls — Motion.tsx
              drives the band scales, the R travelling twice as far */}
          <div className="exportmap__word" aria-hidden="true">
            {Object.entries(wordParts).map(([name, p]) => (
              <img
                key={name}
                data-part={name}
                src={`/img/wordmark-${name}.png`}
                alt=""
                style={{
                  left: `${p.l}%`, top: `${p.t}%`, width: `${p.w}%`,
                  /* 1px bleed on any slice with a neighbour below: at a
                     fractional box edge two alpha edges composite to ~84%
                     and the light section shows through as a hairline. The
                     joint rows are constant-width columns, so the extra
                     pixel of stretch is invisible. */
                  height: /-(top|band)$/.test(name) ? `calc(${p.h}% + 1px)` : `${p.h}%`,
                }}
              />
            ))}
          </div>
        </section>

        {/* 00d · WORLD — two screens */}
        <section className="section z9-world ui-dark" id="world" data-polarity="dark">
          <img
            className="z9-world__bg"
            src="/img/hero_dusk.jpg"
            alt="ORKAY-clad facade at blue hour"
          />
          <img
            className="z9-world__figure"
            src="/img/ambassador_dusk.webp"
            alt="The ORKAY brand ambassador"
          />
          <hr className="z9-world__rule" />
          <div className="z9-world__grid">
            <p className="z9-world__eyebrow text-small">It&apos;s a surface that adapts to you</p>
            <p className="z9-world__statement reveal-lines">
              It is not just a slab and a finish. It is a floor that holds its polish through
              thirty years of traffic, a wall that carries one vein end to end, and a factory
              that answers the phone when you call it.
            </p>
          </div>
        </section>

        {/* 01 · STATEMENT */}
        <section className="section statement ui-light" id="about" data-polarity="light">
          <h2 className="statement__title h-mid reveal-lines">
            Seven manufacturing units. 60,000 sq m a day. Thirty years of craft
            reflected in every single surface we press, fire, polish and pack.
          </h2>
          <figure className="statement__media img-reveal img-reveal--r">
            <img
              src="/img/statement_garage.png"
              alt="Glazed garage gallery floored in polished ORKAY porcelain, a red sports car behind the glass"
            />
          </figure>
        </section>

        {/* 01b · STYLE — single frame. The red-bathroom pair and the reveal
            animation were removed per CR S-06; the title wraps instead of clipping */}
        <section className="section z9-style ui-light" id="style" data-polarity="light">
          <h2 className="z9-style__title h-mid">
            Full-slab walls and<br />mirror-polished floors<br />from our own kilns
          </h2>
          <figure className="z9-style__b">
            <img src="/img/style_horse.png" alt="Black ORKAY marble-look vitrified porcelain slabs stood in an open yard, a figure in black beside a red horse" />
          </figure>
        </section>

        {/* the curtain stack: day cycle (stuck) → experience → spaces ride up
            over one another; the gallery that used to open it was removed (CR S-08) */}
        <div className="curtain">

        {/* 06 · DAY CYCLE */}
        <section className="section daycycle ui-dark" data-polarity="dark">
          <div className="daycycle__media">
            {dayCycle.map((d, i) => (
              <img
                key={d.time}
                src={d.img}
                alt={`The same room at ${d.time} — ${d.label.toLowerCase()}`}
                data-time={d.time}
                data-label={d.label}
                className={i === 0 ? 'is-active' : undefined}
              />
            ))}
          </div>
          <div className="daycycle__panel">
            <div className="daycycle__clock" aria-live="polite">
              <span className="daycycle__time">{dayCycle[0].time}</span>
              <span className="daycycle__label text-small">{dayCycle[0].label}</span>
            </div>
            <p className="text-small daycycle__hint reveal-lines">
              One floor. Every light.<br />The same ORKAY surface, photographed from morning to night.
            </p>
            <p className="text-small daycycle__cue" aria-hidden="true">Scroll to move through the day ↓</p>
          </div>
          {/* the ring is the dial: Motion swings these two hands to each hour */}
          <div className="daycycle__ring" aria-hidden="true">
            <i className="daycycle__hand daycycle__hand--h" />
            <i className="daycycle__hand daycycle__hand--m" />
            <i className="daycycle__pivot" />
          </div>
        </section>
        {/* scroll budget for the stuck day cycle — Motion steps the hour as this
            passes behind it, then the experience climbs over */}
        <div className="daycycle-dwell" aria-hidden="true" />

        {/* 06b · EXPERIENCE — rides up over the pinned day cycle */}
        <section className="section experience ui-dark" id="experience" data-polarity="dark">
          <figure className="experience__media">
            <img src="/img/experience_black.png" alt="A single black marble-look ORKAY slab stood on a black-sand shore, a woman in a black and gold sari beside it" />
          </figure>
          <p className="experience__caption text-small">
            The lobby is built the way grand hotels are built: two-metre mirrors, dark glossy
            stone walls, and a floor that holds the reflection of every light above it.
          </p>
          <h2 className="experience__title h-display reveal-lines">
            The Luxury<br />of Experience
          </h2>
        </section>

        {/* 06c · SPACES — the panel holds while the photo steps through */}
        <div className="spaces-scroll">
          <section className="section spaces ui-dark" id="spaces" data-polarity="dark">
            {spaces.map((s, i) => (
              <article className={`spaces__slide${i === 0 ? ' is-active' : ''}`} key={s.name}>
                <div className="spaces__panel">
                  <h3 className="h-display">{s.name}</h3>
                  <p className="spaces__desc text-small">{s.desc}</p>
                </div>
                <figure className={`spaces__media${'extra' in s && s.extra ? ' spaces__media--split' : ''}`}>
                  <img src={s.img} alt={s.alt} />
                  {'extra' in s && s.extra ? (
                    <span className="spaces__stack">
                      {s.extra.map((x) => <img key={x.img} src={x.img} alt={x.alt} />)}
                    </span>
                  ) : null}
                </figure>
              </article>
            ))}
          </section>
        </div>
        </div>

        {/* 07 · WHAT WE MAKE — the six ranges, on the pinned horizontal track */}
        <section className="section journey ui-light" id="ranges" data-polarity="light">
          <div className="journey__pin">
            <div className="journey__track">
              {tileTypes.map((j) => (
                <article className="journey__slide" key={j.title}>
                  <div className="journey__info">
                    <h3 className="h-mid">
                      {j.title.split('\n').map((line, n) => (
                        <span key={n}>
                          {line}
                          {n === 0 && j.title.includes('\n') ? <br /> : null}
                        </span>
                      ))}
                    </h3>
                    <p className="text-small journey__desc">{j.desc}</p>
                  </div>
                  <figure className="journey__media">
                    <img src={j.img} alt={j.alt} />
                  </figure>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 07c · APPLICATIONS — steps on scroll; the arrows drive the scroll */}
        <div className="amen-scroll">
        <section className="section amen ui-dark" id="applications" data-polarity="dark">
          <div className="amen__panel">
            <h2 className="amen__title h-mid">
              {facilities[0].title.split('\n').map((line, n) => (
                <span key={n}>
                  {line}
                  {n === 0 ? <br /> : null}
                </span>
              ))}
            </h2>
            <hr className="amen__rule" />
            <div className="amen__row">
              <div className="amen__arrows">
                <button className="arrow arrow--prev" aria-label="Previous space">←</button>
                <button className="arrow arrow--next" aria-label="Next space">→</button>
              </div>
            </div>
            <p className="amen__desc text-small" aria-live="polite">{facilities[0].desc}</p>
          </div>
          <figure className="amen__media">
            {facilities.map((f, i) => (
              <img
                key={f.img}
                src={f.img}
                alt={f.alt}
                data-title={f.title}
                data-desc={f.desc}
                className={i === 0 ? 'is-active' : undefined}
              />
            ))}
          </figure>
        </section>
        </div>

        {/* 07d · RANGE — climbs over the applications panel */}
        <section className="section park ui-light" id="range" data-polarity="light">
          <h2 className="park__title h-display reveal-lines">
            One thousand<br />designs deep
          </h2>
          <figure className="park__a img-reveal">
            <img src="/img/park_travertino.png" alt="Bone Travertino Ivory slab detail" />
          </figure>
          <figure className="park__b img-reveal img-reveal--r">
            <img src="/img/park_interior.png" alt="Interior floored with ORKAY statuario slabs" />
          </figure>
          <p className="park__note reveal-lines">
            Travertine, statuario, onyx, concrete, wood and terrazzo — over a thousand faces
            across every size and finish we press. Pick one, or send us the reference you
            already have and we will run it.
          </p>
        </section>

        {/* 07e · PLATE — pins while the formats panel climbs over it */}
        <div className="curtain">
        <section className="section plate ui-dark" data-polarity="dark">
          <figure className="img-reveal">
            <img src="/img/plate_dining.png" alt="Dining room around a black marble-look ORKAY table at sunset" />
          </figure>
        </section>

        {/* 08a · CHOOSE YOUR FORMAT */}
        <section className="section formats ui-dark" id="formats" data-polarity="dark">
          <div className="formats__pin">
            <nav className="formats__tabs text-small" aria-label="Tile categories">
              {formats.map((f, i) => (
                <button className={`formats__tab${i === 0 ? ' is-active' : ''}`} data-step={i} key={f.name}>
                  {f.name}
                </button>
              ))}
            </nav>
            <div className="formats__panel">
              <p className="formats__size h-mid">
                <span id="fmt-size">{formats[0].name}</span>
              </p>
              <p className="formats__sizes text-small" id="fmt-sizes">{formats[0].sizes.join(' · ')} mm</p>
              <div className="formats__plan" id="fmt-plan">
                <svg viewBox="0 0 420 360" fill="none" aria-hidden="true">
                  <rect id="fmt-rect" x="60" y="20" width="160" height="320" stroke="currentColor" strokeWidth="1.5" pathLength="100" />
                  <line id="fmt-dimv" x1="36" y1="20" x2="36" y2="340" stroke="currentColor" strokeWidth="0.75" />
                  <line id="fmt-dimh" x1="60" y1="352" x2="220" y2="352" stroke="currentColor" strokeWidth="0.75" />
                  <text id="fmt-lblv" x="14" y="185" fill="currentColor" fontSize="12" letterSpacing="1" transform="rotate(-90 22 185)">1200</text>
                  <text id="fmt-lblh" x="128" y="345" fill="currentColor" fontSize="12" letterSpacing="1" textAnchor="middle">600</text>
                </svg>
              </div>
              <p className="formats__desc text-small" id="fmt-desc">{formats[0].desc}</p>
            </div>
            <figure className="formats__media">
              {formats.map((f, i) => (
                <img key={f.name} src={f.img} alt={f.alt} data-fmt={i} className={i === 0 ? 'is-active' : undefined} />
              ))}
            </figure>
            <p className="formats__kicker text-small">Choose your category</p>
          </div>
        </section>
        </div>

        {/* 07f · TECHNOLOGIES & SERVICES */}
        <section className="section tech ui-dark" id="services" data-polarity="dark">
          <figure className="tech__media">
            {/* keyed by name, not img: swapping an image URL would otherwise
                remount the node and strand Motion's cached NodeList */}
            {timeline.map((s, i) => (
              <img key={s.year} src={s.img} alt={s.alt} className={i === 0 ? 'is-active' : undefined} />
            ))}
          </figure>
          <div className="tech__cards">
            {timeline.map((s) => (
              <article className="tech__card" key={s.year}>
                <p className="text-small tech__label">{s.year} · {s.capacity}</p>
                <div className="tech__body">
                  <p className="text-small tech__product">{s.product}</p>
                  <p className="text-small tech__meta">{s.sizes}</p>
                  <p className="text-small tech__desc">{s.tech}</p>
                </div>
              </article>
            ))}
          </div>
          <h2 className="tech__title h-mid reveal-lines">
            Five hundred<br />to sixty<br />thousand a day
          </h2>
        </section>

        {/* 07g · PEAK — same plate treatment as 06b, holds while the next
            section climbs over it */}
        <div className="curtain">
        <section className="section experience experience--free ui-dark" id="peak" data-polarity="dark">
          <figure className="experience__media">
            <img src="/img/peak_residence.png" alt="Residence floored in polished ORKAY porcelain" />
          </figure>
          <p className="experience__caption text-small">
            Take the surface to the top of the building. The same slab runs from the entrance
            hall to the terrace threshold — one vein, one shade, one batch, however many floors
            sit between them.
          </p>
          <h2 className="experience__title h-display reveal-lines">
            Residences with<br />mirror-polished floors
          </h2>
        </section>

        {/* 07h · SCALE — tall plate, then the closing statement */}
        <section className="section penth ui-dark" id="scale" data-polarity="dark">
          <figure className="penth__tall img-reveal">
            <img src="/img/scale_goldenhour.png" alt="Clifftop terrace paved in stone-look ORKAY porcelain above an infinity pool at sunset" />
          </figure>
          <p className="penth__lede reveal-lines">
            Light is what a surface is judged on. A slab that leaves our line flat, dense and
            polished to the same gloss across the batch keeps a reflection running unbroken from
            one wall to the next — at any hour of the day.
          </p>
        </section>
        </div>

        <Footer />
      </main>
    </>
  );
}
