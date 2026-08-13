import Link from 'next/link';
import SiteChrome, { Footer } from '@/components/SiteChrome';
import Motion from '@/components/Motion';
import { collections } from '@/content/collections';
import {
  formats, journey, stats, dayCycle, gallery, advantage,
  products, packing, contact, site,
} from '@/content/site';

/* eslint-disable @next/next/no-img-element -- the design system sizes every
   image with object-fit inside fixed-height figures; next/image adds no value
   here and would fight the clip-path reveals. */

function Cta({ label, red, href }: { label: string; red?: boolean; href: string }) {
  return (
    <a href={href} className={`btn btn--underline${red ? ' btn--red' : ''}`}>
      <span className="btn__mask">
        <span className="btn__text">{label}</span>
        <span className="btn__text btn__text--clone">{label}</span>
      </span>
    </a>
  );
}

export default function Home() {
  return (
    <>
      <span id="top" />
      <SiteChrome />
      <Motion />

      <main>
        {/* 00 · HERO */}
        <section className="section hero ui-dark" data-polarity="dark">
          <h1 className="sr-only">
            ORKAY Tiles International — vitrified and porcelain tile manufacturer, Morbi, India.
            Crafted in Morbi, designed for the world.
          </h1>
          <figure className="hero__media" data-parallax="0.85">
            {site.heroVideo ? (
              <video src={site.heroVideo} poster={site.heroImage} autoPlay muted loop playsInline />
            ) : (
              <img src={site.heroImage} alt="ORKAY manufacturing campus at dusk" />
            )}
          </figure>
          <figure className="hero__ambassador">
            <img src="/img/ambassador_hero.webp" alt="The ORKAY brand ambassador" />
          </figure>
          <div className="hero__caption">
            <p className="text-small reveal-lines">
              Crafted in Morbi.<br />Designed for the World.
            </p>
            <Cta label="Request Catalogue" red href="#partner" />
          </div>
          <p className="hero__since text-small">{site.since}</p>
        </section>

        {/* 01 · STATEMENT */}
        <section className="section statement ui-light" id="about" data-polarity="light">
          <h2 className="statement__title h-mid reveal-lines">
            Seven manufacturing units.<br />16,000 sq.m a day.<br />Thirty years of craft reflected<br />in every single surface.
          </h2>
          <figure className="statement__media img-reveal img-reveal--r">
            <img src="/img/light_facade.jpg" alt="Building facade clad in ORKAY large-format slabs" />
          </figure>
        </section>

        {/* 02 · SURFACES */}
        <section className="section surfaces ui-light" data-polarity="light">
          <div className="surfaces__grid">
            <figure className="surfaces__img surfaces__img--sm img-reveal" data-parallax="0.92">
              <img src="/img/slab_travertino.jpg" alt="Bone Travertino Ivory slab detail" />
            </figure>
            <figure className="surfaces__img surfaces__img--lg img-reveal img-reveal--r">
              <img src="/img/light_interior.jpg" alt="Interior floored with ORKAY statuario slabs" />
            </figure>
          </div>
          <h2 className="surfaces__title h-mid reveal-lines">
            Panoramic slabs<br />and architectural<br />surfaces
          </h2>
        </section>

        {/* 03 · MATERIALS collage */}
        <section className="section materials ui-light" data-polarity="light">
          <h2 className="materials__label h-display reveal-lines">Premium<br />Materials</h2>
          <div className="materials__stage">
            {/* Vivian is a white statuario — on the white panel it read as a
                missing image. Aura's grey body holds an edge without a border,
                which the design system does not allow. */}
            <figure className="materials__item materials__item--tall img-reveal" data-parallax="0.90">
              <img src="/img/slab_aura.jpg" alt="Aura Silver marble-look slab" />
            </figure>
            <figure className="materials__item materials__item--circle img-reveal" data-parallax="1.06">
              <img src="/img/slab_polar.jpg" alt="Polar Blue stone circle" />
            </figure>
            <figure className="materials__item materials__item--square img-reveal" data-parallax="0.97">
              <img src="/img/slab_armani.jpg" alt="Armani Beige slab" />
            </figure>
            <figure className="materials__item materials__item--disc img-reveal" data-parallax="1.10">
              <img src="/img/slab_blue.jpg" alt="Blue onyx surface" />
            </figure>
          </div>
        </section>

        {/* 04 · LUXURY */}
        <section className="section luxury ui-dark" data-polarity="dark">
          <div className="luxury__pair">
            <figure className="img-reveal" data-parallax="0.94">
              <img src="/img/lobby_dark.jpg" alt="Hotel lobby clad in dark ORKAY marble slabs" />
            </figure>
            <figure className="img-reveal img-reveal--r" data-parallax="1.04">
              <img src="/img/bath_dark.jpg" alt="Bathroom in dark stone-look porcelain" />
            </figure>
          </div>
          <p className="luxury__caption text-small reveal-lines">
            The most demanding spaces are built on ORKAY surfaces: grand hotel lobbies, dark glossy
            stone walls, floors that hold their polish for decades.
          </p>
          <h2 className="luxury__title h-display reveal-lines">The Luxury<br />of Surface</h2>
        </section>

        {/* 05 · GALLERY */}
        <section className="section gallery ui-dark" id="gallery" data-polarity="dark">
          <div className="gallery__pin">
            {gallery.map((g, i) => (
              <article className={`gallery__slide${i === 0 ? ' is-active' : ''}`} key={g.title}>
                <figure className="gallery__media">
                  <img src={g.img} alt={g.alt} />
                </figure>
                <div className="gallery__panel">
                  <p className="text-small gallery__index">
                    {String(i + 1).padStart(2, '0')} — {String(gallery.length).padStart(2, '0')}
                  </p>
                  <h3 className="h-mid">
                    {g.title.split('\n').map((line, n) => (
                      <span key={n}>
                        {line}
                        {n === 0 ? <br /> : null}
                      </span>
                    ))}
                  </h3>
                  <p className="text-small gallery__desc">{g.desc}</p>
                </div>
              </article>
            ))}
            <h2 className="gallery__kicker text-small">
              Gallery <span className="gallery__count">/{gallery.length} photos</span>
            </h2>
          </div>
        </section>

        {/* 06 · DAY CYCLE */}
        <section className="section daycycle ui-dark" data-polarity="dark">
          <div className="daycycle__media">
            {dayCycle.map((d, i) => (
              <img
                key={d.time}
                src={d.img}
                alt={`Room at ${d.time}`}
                data-time={d.time}
                className={i === 0 ? 'is-active' : undefined}
              />
            ))}
          </div>
          <div className="daycycle__panel">
            <p className="text-small daycycle__hint reveal-lines">
              One floor. Every light.<br />Watch an ORKAY surface live through the day.
            </p>
            <div className="daycycle__clock" aria-live="polite">
              {dayCycle[0].time}
            </div>
            <div className="daycycle__arrows">
              <button className="arrow arrow--prev" aria-label="Previous time">←</button>
              <button className="arrow arrow--next" aria-label="Next time">→</button>
            </div>
          </div>
          <div className="daycycle__ring" aria-hidden="true" />
        </section>

        {/* 07 · MANUFACTURING JOURNEY */}
        <section className="section journey ui-dark" data-polarity="dark">
          <div className="journey__pin">
            <p className="journey__pagination text-small">
              <span className="journey__current">1</span> — <span className="journey__total">{journey.length}</span>
            </p>
            <div className="journey__track">
              {journey.map((j) => (
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

        {/* 07a · DIRECT MANUFACTURER ADVANTAGE */}
        <section className="section advantage ui-light" id="advantage" data-polarity="light">
          <p className="advantage__label text-small">The Direct Manufacturer Advantage</p>
          <h2 className="advantage__title h-display reveal-lines">
            We are not traders.<br />We are not middlemen.
          </h2>
          <figure className="advantage__media img-reveal img-reveal--r" data-parallax="0.94">
            <img src="/img/advantage_yard.jpg" alt="Finished ORKAY porcelain slabs crated in the Morbi dispatch yard" />
          </figure>
          <p className="advantage__lede text-small reveal-lines">
            Every tile that carries the ORKAY name is designed, produced,<br />quality-checked and shipped directly by us.
          </p>
          <div className="advantage__grid">
            {advantage.map((a) => (
              <article className="advantage__item" key={a.label}>
                <p className="text-small advantage__item-label">{a.label}</p>
                <p className="text-small advantage__item-desc">{a.desc}</p>
              </article>
            ))}
          </div>
          <p className="advantage__bar text-small">
            ISO 9001:2015 · CE (CPR 305/2011) · DGFT IEC AAAFO3244L · AS 4459 &amp; AS/NZS 4586 compliant
          </p>
          <div className="advantage__cta">
            <Cta label="Talk to the Factory" red href="#partner" />
          </div>
        </section>

        {/* 08 · COLLECTIONS */}
        <section className="section collections ui-light" id="collections" data-polarity="light">
          <h2 className="collections__title h-display reveal-lines">Collections</h2>
          <p className="collections__note text-small reveal-lines">
            1,000+ designs across every finish, size and style.<br />A selection from the current export range.
          </p>
          <div className="collections__track">
            {collections.map((c) => (
              <Link className="collections__card" href={`/collections/${c.slug}`} key={c.slug}>
                <figure className="img-reveal img-reveal--r">
                  <img src={c.img} alt={c.name} />
                </figure>
                <p className="text-small">{c.name}</p>
                <p className="text-small collections__meta">{c.meta}</p>
                <span className="btn btn--underline btn--red collections__view">
                  <span className="btn__mask">
                    <span className="btn__text">View Collection</span>
                    <span className="btn__text btn__text--clone">View Collection</span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 08c · PRODUCT RANGE */}
        <section className="section products ui-light" id="products" data-polarity="light">
          <p className="products__label text-small">The Range</p>
          <h2 className="products__title h-display reveal-lines">Six ways<br />to build a surface</h2>
          <div className="products__grid">
            {products.map((p) => (
              <article className="products__card" key={p.name}>
                <p className="text-small products__meta">{p.meta}</p>
                <h3 className="h-mid products__name">{p.name}</h3>
                <p className="text-small products__desc">{p.desc}</p>
              </article>
            ))}
          </div>
          <div className="products__cta">
            <Cta label="Request Full Catalogue" red href="#partner" />
          </div>
        </section>

        {/* 08a · CHOOSE YOUR FORMAT */}
        <section className="section formats ui-dark" id="formats" data-polarity="dark">
          <div className="formats__pin">
            <nav className="formats__tabs text-small" aria-label="Tile formats">
              {formats.map((f, i) => (
                <button className={`formats__tab${i === 0 ? ' is-active' : ''}`} data-step={i} key={f.size}>
                  {f.size}
                </button>
              ))}
            </nav>
            <div className="formats__panel">
              <p className="formats__size h-display">
                <span id="fmt-size">{formats[0].size}</span> <sup className="text-small">MM</sup>
              </p>
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
                <img key={f.size} src={f.img} alt={f.alt} data-fmt={i} className={i === 0 ? 'is-active' : undefined} />
              ))}
            </figure>
            <p className="formats__kicker text-small">Choose your format</p>
          </div>
        </section>

        {/* 08d · PACKING & CONTAINER LOAD */}
        <section className="section packing ui-light" id="packing" data-polarity="light">
          <p className="packing__label text-small">Packing &amp; Container Load</p>
          <h2 className="packing__title h-mid reveal-lines">Plan the shipment<br />before you place the order.</h2>
          <p className="packing__note text-small reveal-lines">
            Box counts, weights and full-container coverage for every size we run.<br />
            Loading is calculated on a 20&apos; FCL. Ask the export team for palletised or mixed-load figures.
          </p>
          {packing.map((group) => (
            /* native <details> — click to reveal, keyboard-operable, and the
               numbers stay hidden even with JS off */
            <details className="packing__group" key={group.body}>
              <summary className="packing__body text-small">
                <span>{group.body}</span>
                <span className="packing__reveal">Reveal specs</span>
              </summary>
              <div className="packing__scroll">
                <table className="packing__table text-small">
                  <thead>
                    <tr>
                      <th scope="col">Size mm</th>
                      <th scope="col">Thk mm</th>
                      <th scope="col">Pcs / box</th>
                      <th scope="col">Sq.m / box</th>
                      <th scope="col">Kg / box</th>
                      <th scope="col">Sq.m / container</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((r) => (
                      <tr key={r.size}>
                        <th scope="row">{r.size}</th>
                        <td>{r.thick}</td>
                        <td>{r.box}</td>
                        <td>{r.sqm}</td>
                        <td>{r.kg}</td>
                        <td>{r.sqmC}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ))}
          <div className="packing__cta">
            <Cta label="Get a Loading Plan" red href="#partner" />
          </div>
        </section>

        {/* 09 · GLOBAL */}
        <section className="section global ui-dark" id="global" data-polarity="dark">
          <figure className="global__media" data-parallax="0.88">
            <img src="/img/global_port.jpg" alt="Container port at dusk" />
          </figure>
          <h2 className="global__title h-display">Global&nbsp;Presence</h2>
          <p className="global__caption text-small reveal-lines">
            From Morbi to 40+ countries. Export documentation,<br />logistics and private-label programs handled end to end.
          </p>
        </section>

        {/* 10 · CAMPUS */}
        <section className="section campus ui-light" data-polarity="light">
          <figure className="campus__media img-reveal">
            <img src="/img/campus_aerial.jpg" alt="Aerial view of the ORKAY manufacturing campus" />
          </figure>
          <h2 className="campus__title h-mid reveal-lines">The Morbi Campus —<br />seven units, one standard.</h2>
        </section>

        {/* 12 · STATS */}
        <section className="section stats ui-dark" data-polarity="dark">
          <div className="stats__grid">
            {stats.map((s) => (
              <div className="stats__item" key={s.label}>
                <p className="stats__num h-display">
                  <span data-count={s.value}>{s.value === 1996 ? '1996' : '0'}</span>
                  {s.display.endsWith('+') ? '+' : ''}
                </p>
                <p className="text-small">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="stats__certs text-small">{site.certs}</p>
        </section>

        {/* 12a · EXHIBITION FILM */}
        <section className="section exhibition ui-dark" id="exhibition" data-polarity="dark">
          <figure className="exhibition__media">
            {site.exhibitionVideo ? (
              <video
                src={site.exhibitionVideo}
                poster={site.exhibitionPoster}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img src={site.exhibitionPoster} alt="The ORKAY stand at an international tile exhibition" />
            )}
          </figure>
          <h2 className="exhibition__title h-display reveal-lines">
            Meet the<br />surface in person
          </h2>
          <p className="exhibition__caption text-small reveal-lines">
            Our stand travels to the floors where the trade meets — full-size slabs,<br />
            the current range in hand, and the people who fired it.
          </p>
        </section>

        {/* 13 · PARTNER + INQUIRY FORM */}
        <section className="section partner ui-dark" id="partner" data-polarity="dark">
          <h2 className="h-display reveal-lines">Let&apos;s build<br />something<br />extraordinary</h2>
          <div className="partner__ctas">
            <Cta label="Talk to Export Team" red href={`tel:${contact.exportPhone.replace(/\s/g, '')}`} />
            <Cta label="WhatsApp Us" href={`https://wa.me/${contact.whatsapp}`} />
            <Cta label="Email the Factory" href={`mailto:${contact.email}`} />
          </div>

          <div className="contact" id="contact">
            <div className="contact__block">
              <p className="text-small contact__label">Corporate Office</p>
              <p className="text-small contact__value">
                {contact.address.split('\n').map((l, i) => (
                  <span key={i}>
                    {l}
                    <br />
                  </span>
                ))}
              </p>
            </div>
            <div className="contact__block">
              <p className="text-small contact__label">Export Sales</p>
              <a className="text-small contact__value contact__link" href={`tel:${contact.exportPhone.replace(/\s/g, '')}`}>
                {contact.exportPhone}
              </a>
              <p className="text-small contact__label contact__label--sub">Domestic Sales</p>
              <a className="text-small contact__value contact__link" href={`tel:${contact.domesticPhone.replace(/\s/g, '')}`}>
                {contact.domesticPhone}
              </a>
            </div>
            <div className="contact__block">
              <p className="text-small contact__label">Email</p>
              <a className="text-small contact__value contact__link" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
              <p className="text-small contact__label contact__label--sub">Follow</p>
              <ul className="contact__socials">
                {contact.socials.map((s) => (
                  <li key={s.name}>
                    <a className="text-small contact__link" href={s.href} target="_blank" rel="noopener noreferrer">
                      {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
