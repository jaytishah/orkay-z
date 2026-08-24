'use client';

import { useEffect } from 'react';
import { formats } from '@/content/site';

/* The whole motion system, ported from the static build.
   Mounted once by the homepage; every effect is guarded so the
   collection pages can mount a subset without errors. */
export default function Motion() {
  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      /* touch-only: a mobile URL bar collapsing fires a resize, and refreshing
         every pin mid-scroll jumps the page. Desktop resize still refreshes. */
      ScrollTrigger.config({ ignoreMobileResize: true });
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const q = (s: string) => document.querySelector(s);
      const qa = (s: string) => Array.from(document.querySelectorAll(s));

      /* autoplay ignores the OS motion preference — honour it ourselves */
      if (reduced) qa('video').forEach((v) => (v as HTMLVideoElement).pause());

      const lenis = new Lenis({ lerp: 0.08, smoothWheel: !reduced });
      lenis.on('scroll', ScrollTrigger.update);
      const raf = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      /* anchors route through lenis */
      const anchorHandlers: Array<[Element, EventListener]> = [];
      qa('a[href^="#"]').forEach((a) => {
        const h: EventListener = (e) => {
          const target = document.querySelector((a as HTMLAnchorElement).getAttribute('href') || '');
          if (!target) return;
          e.preventDefault();
          q('.menu')?.classList.remove('is-open');
          lenis.scrollTo(target as HTMLElement, { duration: 1.6 });
        };
        a.addEventListener('click', h);
        anchorHandlers.push([a, h]);
      });

      const thumb = q('.scrollbar__thumb') as HTMLElement | null;
      if (thumb) {
        lenis.on('scroll', ({ progress }: { progress: number }) => {
          thumb.style.transform = `translateY(${progress * (innerHeight - 120)}px)`;
        });
      }

      const menu = q('.menu');
      const burger = q('.burger');
      const burgerHandler = () => {
        menu?.classList.toggle('is-open');
        menu?.setAttribute('aria-hidden', String(!menu.classList.contains('is-open')));
      };
      burger?.addEventListener('click', burgerHandler);
      /* the overlay covers the page, so a link click that leaves it open reads
         as a dead link — close on any click inside the nav, not per-link */
      const menuNav = q('.menu__nav');
      menuNav?.addEventListener('click', burgerHandler);
      /* the drawer takes the right half; the container is the scrim over the
         left half, and a click on it (not on the panel) closes the menu */
      const scrimHandler = (e: Event) => {
        if (e.target === menu) burgerHandler();
      };
      menu?.addEventListener('click', scrimHandler);

      /* the hero now carries its own giant wordmark, so the fixed mark stays
         1x and only runs the zebra ink clip every frame */
      await document.fonts.ready;
      const inkLayer = q('.logo__layer--ink') as HTMLElement | null;
      const logoEl = q('.logo') as HTMLElement | null;
      const lightSections = qa('.ui-light');
      /* dark photos that sit inside a light section — the ink layer has to stop
         at their left edge or the mark goes black over black */
      const darkInserts = qa('.ui-light .z9-loc__media');
      const updateLogoInk = () => {
        if (!inkLayer || !logoEl) return;
        const r = logoEl.getBoundingClientRect();
        let top: number | null = null;
        let bottom: number | null = null;
        for (const sec of lightSections) {
          const s = sec.getBoundingClientRect();
          const iT = Math.max(r.top, s.top);
          const iB = Math.min(r.bottom, s.bottom);
          if (iB > iT) {
            if (top === null || iT < top) top = iT;
            if (bottom === null || iB > bottom) bottom = iB;
          }
        }
        const scale = r.height || 1;
        if (top === null || bottom === null) {
          inkLayer.style.clipPath = 'inset(0 0 100% 0)';
        } else {
          const t = ((top - r.top) / scale) * 100;
          const b = ((r.bottom - bottom) / scale) * 100;
          let right = 0;
          for (const el of darkInserts) {
            const m = el.getBoundingClientRect();
            if (m.bottom > r.top && m.top < r.bottom && m.left < r.right) {
              const cut = ((r.right - Math.max(m.left, r.left)) / (r.width || 1)) * 100;
              if (cut > right) right = cut;
            }
          }
          inkLayer.style.clipPath =
            `inset(${Math.max(0, t)}% ${Math.min(100, right)}% ${Math.max(0, b)}% 0)`;
        }
      };
      gsap.ticker.add(updateLogoInk);

      const locSection = q('.z9-loc__media');
      if (locSection && logoEl) {
        ScrollTrigger.create({
          trigger: locSection, start: 'top 40%', end: 'bottom top',
          onToggle: (s) => logoEl.classList.toggle('logo--xl', s.isActive),
        });
      }

      /* amenity strip arrows — one card per click, native smooth scroll */
      const strip = q('.z9-loc__strip') as HTMLElement | null;
      if (strip) {
        qa('[data-strip]').forEach((b) => b.addEventListener('click', () => {
          const card = strip.firstElementChild as HTMLElement | null;
          const step = (card?.offsetWidth || strip.clientWidth) + 10;
          const dir = (b as HTMLElement).dataset.strip === 'prev' ? -1 : 1;
          strip.scrollBy({ left: dir * step, behavior: 'smooth' });
        }));
      }

      /* split headlines into masked lines */
      qa('.reveal-lines').forEach((el) => {
        el.innerHTML = el.innerHTML
          .split(/<br\s*\/?>/i)
          .map((l) => `<span class="line"><span>${l}</span></span>`)
          .join('');
      });

      qa('.img-reveal, .reveal-lines, .globalmap').forEach((el) => {
        ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => el.classList.add('is-inview') });
      });

      if (!reduced) {
        qa('[data-parallax]').forEach((el) => {
          const speed = parseFloat((el as HTMLElement).dataset.parallax || '1');
          const dist = (1 - speed) * 220;
          gsap.fromTo(el, { y: -dist }, {
            y: dist, ease: 'none',
            scrollTrigger: { trigger: el.parentElement as HTMLElement, start: 'top bottom', end: 'bottom top', scrub: true },
          });
        });

        /* the sky photo rides up 10vh as the section enters — a lift on the top
           edge only, well inside the slack that scale(1.4) leaves at the bottom */
        const worldBg = q('.z9-world__bg');
        if (worldBg) {
          gsap.fromTo(worldBg, { y: '10vh' }, {
            y: 0, ease: 'none',
            scrollTrigger: { trigger: '.z9-world', start: 'top bottom', end: 'top top', scrub: true },
          });
        }

        /* reference behaviour: the rule draws out across screen one and retracts
           across screen two — pure scrub, no autoplay */
        const worldRule = q('.z9-world__rule');
        if (worldRule) {
          gsap.timeline({
            scrollTrigger: { trigger: '.z9-world', start: 'top bottom', end: 'bottom top', scrub: true },
          })
            .fromTo(worldRule, { scaleX: 0 }, { scaleX: 1, ease: 'none' })
            .to(worldRule, { scaleX: 0, ease: 'none' });
        }
      }

      /* pinned manufacturing journey */
      const track = q('.journey__track') as HTMLElement | null;
      const slides = qa('.journey__slide');
      const typed = new WeakSet<Element>();
      const typewrite = (el?: Element) => {
        if (!el || typed.has(el) || reduced) return;
        typed.add(el);
        const full = el.textContent || '';
        el.textContent = '';
        let i = 0;
        const step = () => {
          el.textContent = full.slice(0, i);
          i += 3;
          if (i <= full.length + 2) requestAnimationFrame(step);
        };
        step();
      };
      if (track && slides.length) {
        if (!reduced) {
          /* one screen of hold at the end: the infrastructure plate crossing
             over the last (held) slide */
          const hold = 1 / (1 + slides.length * 0.9);
          const travel = (slides.length * 0.9) / (1 + slides.length * 0.9);
          gsap.timeline({
            scrollTrigger: {
              trigger: '.journey__pin', pin: true, scrub: 0.6, anticipatePin: 1,
              end: () => `+=${innerHeight + slides.length * innerHeight * 0.9}`,
              onUpdate: (st) => {
                const p = Math.min(1, Math.max(0, st.progress / travel));
                typewrite(qa('.journey__desc')[Math.round(p * (slides.length - 1))]);
              },
              invalidateOnRefresh: true,
            },
          })
            .to(track, {
              x: () => -(track.scrollWidth - innerWidth),
              ease: 'none', duration: travel,
            })
            .to({}, { duration: hold });
        }
        typewrite(qa('.journey__desc')[0]);
      }

      /* pinned horizontal collections track — refreshPriority keeps pin math in document order */
      const collectionsTrack = q('.collections__track') as HTMLElement | null;
      if (!reduced && collectionsTrack) {
        gsap.to(collectionsTrack, {
          x: () => -(collectionsTrack.scrollWidth - innerWidth + 120),
          ease: 'none',
          scrollTrigger: {
            trigger: '.collections', pin: true, scrub: 0.6, start: 'top top',
            end: () => `+=${collectionsTrack.scrollWidth - innerWidth + innerHeight}`,
            invalidateOnRefresh: true, refreshPriority: -1,
          },
        });
      }

      /* choose-your-format stepper */
      const fmtPanel = q('.formats__panel');
      const fmtPlan = q('.formats__plan');
      const fmtImgs = qa('.formats__media img');
      const fmtTabs = qa('.formats__tab');
      let fmtStep = -1;
      const setFormat = (i: number) => {
        if (i === fmtStep || !fmtPanel || !fmtPlan) return;
        fmtStep = i;
        const f = formats[i];
        fmtTabs.forEach((t, n) => t.classList.toggle('is-active', n === i));
        fmtImgs.forEach((im, n) => im.classList.toggle('is-active', n === i));
        fmtPanel.classList.add('is-switching');
        setTimeout(() => {
          if (fmtStep !== i) return;
          const sizeEl = document.getElementById('fmt-size');
          const descEl = document.getElementById('fmt-desc');
          if (sizeEl) sizeEl.textContent = f.name;
          const sizesEl = document.getElementById('fmt-sizes');
          if (sizesEl) sizesEl.textContent = f.sizes.join(' · ') + ' mm';
          if (descEl) descEl.textContent = f.desc;
          const S = 320 / Math.max(f.v, f.h);
          const w = Math.max(80, f.h * S);
          const h = Math.max(80, f.v * S);
          const x = 60;
          const y = 350 - h - 10;
          const r = document.getElementById('fmt-rect');
          r?.setAttribute('x', String(x));
          r?.setAttribute('y', String(y));
          r?.setAttribute('width', String(w));
          r?.setAttribute('height', String(h));
          document.getElementById('fmt-dimv')?.setAttribute('y1', String(y));
          document.getElementById('fmt-dimv')?.setAttribute('y2', String(y + h));
          document.getElementById('fmt-dimh')?.setAttribute('x2', String(x + w));
          const lv = document.getElementById('fmt-lblv');
          if (lv) {
            lv.textContent = String(f.v);
            lv.setAttribute('y', String(y + h / 2));
            lv.setAttribute('transform', `rotate(-90 22 ${y + h / 2})`);
          }
          const lh = document.getElementById('fmt-lblh');
          if (lh) {
            lh.textContent = String(f.h);
            lh.setAttribute('x', String(x + w / 2));
          }
          fmtPlan.classList.remove('is-drawing');
          void (fmtPlan as HTMLElement).offsetWidth;
          fmtPlan.classList.add('is-drawing');
          fmtPanel.classList.remove('is-switching');
        }, reduced ? 0 : 420);
      };
      if (fmtPanel) {
        setFormat(0);
        if (!reduced) {
          const fmtST = ScrollTrigger.create({
            trigger: '.formats__pin', pin: true, scrub: true, start: 'top top',
            end: () => `+=${formats.length * innerHeight * 0.8}`,
            refreshPriority: -2,
            onUpdate: (st) => setFormat(Math.min(formats.length - 1, Math.floor(st.progress * formats.length))),
            invalidateOnRefresh: true,
          });
          fmtTabs.forEach((t, i) =>
            t.addEventListener('click', () => {
              const target = fmtST.start + ((i + 0.5) / formats.length) * (fmtST.end - fmtST.start);
              lenis.scrollTo(target, { duration: 1.2 });
            })
          );
        } else {
          fmtTabs.forEach((t, i) => t.addEventListener('click', () => setFormat(i)));
        }
      }

      /* spaces carousel — the panel is sticky in CSS, so this only picks the
         slide; no pin, nothing for it to fight with the curtain above */
      const spaceSlides = qa('.spaces__slide');
      const spacesWrap = q('.spaces-scroll') as HTMLElement | null;
      if (spaceSlides.length && spacesWrap) {
        let shown = -1;
        /* read the wrapper's own rect each frame instead of a ScrollTrigger:
           the pins and sticky curtain above keep moving the trigger's start,
           and this measurement cannot go stale. When the wrapper runs out the
           panel simply scrolls away with it — no slide-out, so nothing behind
           the curtain is ever uncovered. */
        const pickSpace = () => {
          const r = spacesWrap.getBoundingClientRect();
          const span = r.height - innerHeight;
          const scrolled = -r.top;
          const p = span > 0 ? Math.min(1, Math.max(0, scrolled / span)) : 0;
          const i = Math.min(spaceSlides.length - 1, Math.floor(p * spaceSlides.length));
          if (i === shown) return;
          shown = i;
          spaceSlides.forEach((s, n) => s.classList.toggle('is-active', n === i));
        };
        lenis.on('scroll', pickSpace);
        pickSpace();
      }

      /* services — the pinned photo follows whichever card is nearest the
         middle of the viewport */
      const techCards = qa('.tech__card');
      const techImgs = qa('.tech__media img');
      let techTeardown = () => {};
      const techMedia = q('.tech__media') as HTMLElement | null;
      if (techCards.length && techImgs.length) {
        let techShown = -1;
        const pickTech = () => {
          let best = 0;
          let bestD = Infinity;
          techCards.forEach((c, i) => {
            const r = c.getBoundingClientRect();
            const d = Math.abs(r.top + r.height / 2 - innerHeight / 2);
            if (d < bestD) { bestD = d; best = i; }
          });
          /* the photo drifts with the column as well as swapping, so the two
             halves read as one movement rather than a slideshow */
          if (techMedia && !reduced) {
            const first = techCards[0].getBoundingClientRect();
            const last = techCards[techCards.length - 1].getBoundingClientRect();
            const span = last.bottom - first.top - innerHeight;
            const p = span > 0 ? Math.min(1, Math.max(0, -first.top / span)) : 0;
            techMedia.style.setProperty('--drift', `${(p - 0.5) * 7}%`);
          }
          if (best === techShown) return;
          techShown = best;
          techImgs.forEach((im, n) => im.classList.toggle('is-active', n === best));
        };
        /* every frame, not on scroll events: the cards move with the page on the
           ticker's clock, so the drift has to be measured on the same clock or
           the photo trails the column by a frame or two */
        gsap.ticker.add(pickTech);
        techTeardown = () => gsap.ticker.remove(pickTech);
        pickTech();
      }

      /* applications carousel — copy travels on the images, same as day cycle */
      const amenImgs = qa('.amen__media img');
      const amenTitle = q('.amen__title');
      const amenDesc = q('.amen__desc');
      let amenIdx = 0;
      const setAmen = (i: number) => {
        if (!amenImgs.length) return;
        amenIdx = (i + amenImgs.length) % amenImgs.length;
        amenImgs.forEach((im, n) => im.classList.toggle('is-active', n === amenIdx));
        const d = (amenImgs[amenIdx] as HTMLElement).dataset;
        if (amenTitle) amenTitle.innerHTML = (d.title || '').replace('\n', '<br>');
        if (amenDesc) amenDesc.textContent = d.desc || '';
      };
      /* scroll owns the index while the panel is stuck, so the arrows scroll to
         the step rather than setting it — otherwise the next frame overrides */
      const amenWrap = q('.amen-scroll') as HTMLElement | null;
      /* the wrapper's last screen belongs to the section climbing over it, so
         the slides share everything above that */
      const amenSpan = () => (amenWrap ? amenWrap.getBoundingClientRect().height - innerHeight * 2 : 0);
      if (amenWrap && amenImgs.length) {
        lenis.on('scroll', () => {
          const span = amenSpan();
          if (span <= 0) return;
          const p = Math.min(1, Math.max(0, -amenWrap.getBoundingClientRect().top / span));
          const i = Math.min(amenImgs.length - 1, Math.floor(p * amenImgs.length));
          if (i !== amenIdx) setAmen(i);
        });
      }
      const goAmen = (i: number) => {
        const span = amenSpan();
        const n = amenImgs.length;
        if (!amenWrap || span <= 0 || !n) { setAmen(i); return; }
        const idx = (i + n) % n;
        const top = amenWrap.getBoundingClientRect().top + scrollY;
        lenis.scrollTo(top + span * ((idx + 0.5) / n), { duration: 1 });
      };
      q('.amen .arrow--next')?.addEventListener('click', () => goAmen(amenIdx + 1));
      q('.amen .arrow--prev')?.addEventListener('click', () => goAmen(amenIdx - 1));

      /* day cycle — scroll owns the hour: the section is stuck while the dwell
         spacer scrolls behind it, and the spacer's progress picks the step */
      const dayImgs = qa('.daycycle__media img');
      const clock = q('.daycycle__time');
      const dayLabel = q('.daycycle__label');
      const dial = q('.daycycle__ring') as HTMLElement | null;
      const daySection = q('.daycycle');
      const dayDwell = q('.daycycle-dwell') as HTMLElement | null;
      let dayIdx = -1;
      const setDial = (hours: number) => {
        if (!dial) return;
        const hh = Math.floor(hours);
        const mm = Math.round((hours - hh) * 60);
        dial.style.setProperty('--h', String((hh % 12) * 30 + mm * 0.5));
        dial.style.setProperty('--m', String(mm * 6));
      };
      const setDay = (i: number) => {
        if (!dayImgs.length || i === dayIdx) return;
        dayIdx = i;
        dayImgs.forEach((im, n) => im.classList.toggle('is-active', n === i));
        const el = dayImgs[i] as HTMLElement;
        if (clock) clock.textContent = el.dataset.time || '';
        if (dayLabel) dayLabel.textContent = el.dataset.label || '';
        /* the hands read the step's own time. They used to be swept by a
           separate linear 07:00→23:00 ramp, which disagreed with the readout
           everywhere except the first frame — the hours on show (07, 13, 19,
           23) are not evenly spaced, so no linear ramp can hit all four. */
        const [hh, mm] = (el.dataset.time || '0:0').split(':').map(Number);
        setDial(hh + mm / 60);
      };
      setDay(0);
      if (dayDwell && dayImgs.length) {
        lenis.on('scroll', () => {
          const r = dayDwell.getBoundingClientRect();
          if (r.height <= 0) return;
          /* the spacer's top sits at the fold the moment the section sticks */
          const p = Math.min(1, Math.max(0, (innerHeight - r.top) / r.height));
          /* photograph, readout and hands all step together at each quarter;
             the hands glide between hours on their CSS transition, so the
             scroll still visibly drives the clock */
          setDay(Math.min(dayImgs.length - 1, Math.floor(p * dayImgs.length)));
          daySection?.classList.toggle('is-moving', p > 0.02);
        });
      }

      if (!reduced && q('.global__title')) {
        gsap.fromTo('.global__title', { x: '60vw' }, {
          x: 0, ease: 'none',
          scrollTrigger: { trigger: '.global', start: 'top bottom', end: 'center center', scrub: true },
        });
      }

      qa('[data-count]').forEach((el) => {
        const target = parseInt((el as HTMLElement).dataset.count || '0', 10);
        ScrollTrigger.create({
          trigger: el, start: 'top 85%', once: true,
          onEnter: () => {
            if (reduced) { el.textContent = target.toLocaleString('en-IN'); return; }
            const obj = { v: target === 1996 ? 1900 : 0 };
            gsap.to(obj, {
              v: target, duration: 1.6, ease: 'power3.out',
              onUpdate: () => {
                el.textContent =
                  target === 1996 ? String(Math.round(obj.v)) : Math.round(obj.v).toLocaleString('en-IN');
              },
            });
          },
        });
      });

      ScrollTrigger.refresh();

      cleanup = () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
        gsap.ticker.remove(raf);
        gsap.ticker.remove(updateLogoInk);
        anchorHandlers.forEach(([a, h]) => a.removeEventListener('click', h));
        burger?.removeEventListener('click', burgerHandler);
        menuNav?.removeEventListener('click', burgerHandler);
        menu?.removeEventListener('click', scrimHandler);
        techTeardown();
        lenis.destroy();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return null;
}
