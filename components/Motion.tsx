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

      let matTeardown = () => {};
      if (!reduced) {
        qa('[data-parallax]').forEach((el) => {
          const speed = parseFloat((el as HTMLElement).dataset.parallax || '1');
          const dist = (1 - speed) * 220;
          gsap.fromTo(el, { y: -dist }, {
            y: dist, ease: 'none',
            scrollTrigger: { trigger: el.parentElement as HTMLElement, start: 'top bottom', end: 'bottom top', scrub: true },
          });
        });

        /* materials collage levitation — items drift away from the cursor,
           each at its own depth, on a heavy 0.05 lerp; the rAF loop IS the
           easing, so the items carry no CSS transition. Desktop pointer only. */
        const matItems = qa('.materials__item') as HTMLElement[];
        if (matItems.length && matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches) {
          const target = { x: innerWidth / 2, y: innerHeight / 2 };
          const cur = { ...target };
          const onMove = (e: MouseEvent) => { target.x = e.clientX; target.y = e.clientY; };
          addEventListener('mousemove', onMove);
          /* measure the section (not the stage — the stage carries its own
             scrub transform) so per-item scroll drift can't feed back */
          const matSection = q('.materials') as HTMLElement | null;
          const float = () => {
            cur.x += (target.x - cur.x) * 0.05;
            cur.y += (target.y - cur.y) * 0.05;
            const r = matSection?.getBoundingClientRect();
            const p = r ? Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height))) : 0.5;
            for (const el of matItems) {
              const d = parseFloat(el.dataset.depth || '0.8');
              /* deeper pieces lag the scroll harder — up to ±25vh each on top
                 of the stage's own drift, so the collage pulls apart in Z */
              const sy = (0.5 - p) * innerHeight * 0.5 * d;
              el.style.transform =
                `translate3d(${((innerWidth / 2 - cur.x) / 15) * d}px, ${((innerHeight / 2 - cur.y) / 15) * d + sy}px, 0)`;
            }
          };
          gsap.ticker.add(float);
          matTeardown = () => { gsap.ticker.remove(float); removeEventListener('mousemove', onMove); };

          /* the whole plate rides -25vh → 25vh across the section's pass, so
             the collage scrolls slower than the page around it */
          gsap.fromTo('.materials__stage', { y: '-25vh' }, {
            y: '25vh', ease: 'none',
            scrollTrigger: { trigger: '.materials', start: 'top bottom', end: 'bottom top', scrub: true },
          });
        }

        /* the sky photo rides up 10vh as the section enters — a lift on the top
           edge only, well inside the slack that scale(1.4) leaves at the bottom */
        const worldBg = q('.z9-world__bg');
        if (worldBg) {
          gsap.fromTo(worldBg, { y: '10vh' }, {
            y: 0, ease: 'none',
            scrollTrigger: { trigger: '.z9-world', start: 'top bottom', end: 'top top', scrub: true },
          });
        }

        /* the collage drifts up inside its own frame while the section is held,
           so the pinned plate never reads as a still image */
        const galleryStage = q('.gallery__stage');
        if (galleryStage) {
          gsap.fromTo(galleryStage, { y: '8vh' }, {
            y: '-8vh', ease: 'none',
            scrollTrigger: { trigger: '.gallery', start: 'top bottom', end: 'bottom top', scrub: true },
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
      const current = q('.journey__current');
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
                const i = Math.min(slides.length, Math.max(1, Math.round(p * (slides.length - 1)) + 1));
                if (current) current.textContent = String(i);
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
          if (sizeEl) sizeEl.textContent = f.size;
          if (descEl) descEl.textContent = f.desc;
          const S = 320 / 1200;
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
        const cur = q('.spaces__current');
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
          if (cur) cur.textContent = String(i + 1);
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
      const amenCur = q('.amen__current');
      let amenIdx = 0;
      const setAmen = (i: number) => {
        if (!amenImgs.length) return;
        amenIdx = (i + amenImgs.length) % amenImgs.length;
        amenImgs.forEach((im, n) => im.classList.toggle('is-active', n === amenIdx));
        const d = (amenImgs[amenIdx] as HTMLElement).dataset;
        if (amenTitle) amenTitle.innerHTML = (d.title || '').replace('\n', '<br>');
        if (amenDesc) amenDesc.textContent = d.desc || '';
        if (amenCur) amenCur.textContent = String(amenIdx + 1);
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

      /* day cycle stepper */
      const dayImgs = qa('.daycycle__media img');
      const clock = q('.daycycle__clock');
      const dial = q('.daycycle__ring') as HTMLElement | null;
      let dayIdx = 0;
      const setDay = (i: number) => {
        if (!dayImgs.length || !clock) return;
        dayIdx = (i + dayImgs.length) % dayImgs.length;
        dayImgs.forEach((im, n) => im.classList.toggle('is-active', n === dayIdx));
        const time = (dayImgs[dayIdx] as HTMLElement).dataset.time || '';
        clock.textContent = time;
        /* swing the dial to the same hour — CSS transitions the rotation */
        const [hh, mm] = time.split(':').map(Number);
        if (dial && !Number.isNaN(hh)) {
          dial.style.setProperty('--h', String((hh % 12) * 30 + (mm || 0) * 0.5));
          dial.style.setProperty('--m', String((mm || 0) * 6));
        }
      };
      setDay(0);
      q('.daycycle .arrow--next')?.addEventListener('click', () => setDay(dayIdx + 1));
      q('.daycycle .arrow--prev')?.addEventListener('click', () => setDay(dayIdx - 1));

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
        techTeardown();
        matTeardown();
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
