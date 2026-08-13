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

      /* logo: hero-sized at top → 1x, then the zebra ink clip every frame.
         The mark is `white-space: nowrap` inside an overflow-hidden body, so
         a fixed scale clips it mid-letter on narrow screens — cap the hero
         size to what actually fits instead. Fonts first: measuring the
         wordmark before Hanken loads gives a fallback-metric width. */
      await document.fonts.ready;
      const logoNode = q('.logo') as HTMLElement | null;
      if (!reduced && logoNode) {
        const restWidth = logoNode.getBoundingClientRect().width || 1;
        const heroScale = Math.min(2.1, (innerWidth - 32) / restWidth);
        gsap.fromTo(
          '.logo',
          { scale: heroScale, y: '28vh' },
          { scale: 1, y: 0, ease: 'none', scrollTrigger: { start: 0, end: () => innerHeight * 0.9, scrub: true } }
        );
      }
      const inkLayer = q('.logo__layer--ink') as HTMLElement | null;
      const logoEl = q('.logo') as HTMLElement | null;
      const lightSections = qa('.ui-light');
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
          inkLayer.style.clipPath = `inset(${Math.max(0, t)}% 0 ${Math.max(0, b)}% 0)`;
        }
      };
      gsap.ticker.add(updateLogoInk);

      /* split headlines into masked lines */
      qa('.reveal-lines').forEach((el) => {
        el.innerHTML = el.innerHTML
          .split(/<br\s*\/?>/i)
          .map((l) => `<span class="line"><span>${l}</span></span>`)
          .join('');
      });

      qa('.img-reveal, .reveal-lines').forEach((el) => {
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
          gsap.to(track, {
            x: () => -(track.scrollWidth - innerWidth),
            ease: 'none',
            scrollTrigger: {
              trigger: '.journey__pin', pin: true, scrub: 0.6,
              end: () => `+=${slides.length * innerHeight * 0.9}`,
              onUpdate: (st) => {
                const i = Math.min(slides.length, Math.max(1, Math.round(st.progress * (slides.length - 1)) + 1));
                if (current) current.textContent = String(i);
                typewrite(qa('.journey__desc')[Math.round(st.progress * (slides.length - 1))]);
              },
              invalidateOnRefresh: true,
            },
          });
        }
        typewrite(qa('.journey__desc')[0]);
      }

      /* pinned gallery stepper — one slide drops in per scroll step */
      const gallerySlides = qa('.gallery__slide');
      if (!reduced && gallerySlides.length) {
        ScrollTrigger.create({
          trigger: '.gallery__pin', pin: true, scrub: true, start: 'top top',
          end: () => `+=${gallerySlides.length * innerHeight * 0.8}`,
          refreshPriority: 1,
          onUpdate: (st) => {
            const i = Math.min(gallerySlides.length - 1, Math.floor(st.progress * gallerySlides.length));
            gallerySlides.forEach((s, n) => s.classList.toggle('is-active', n === i));
          },
          invalidateOnRefresh: true,
        });
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

      /* day cycle stepper */
      const dayImgs = qa('.daycycle__media img');
      const clock = q('.daycycle__clock');
      let dayIdx = 0;
      const setDay = (i: number) => {
        if (!dayImgs.length || !clock) return;
        dayIdx = (i + dayImgs.length) % dayImgs.length;
        dayImgs.forEach((im, n) => im.classList.toggle('is-active', n === dayIdx));
        clock.textContent = (dayImgs[dayIdx] as HTMLElement).dataset.time || '';
      };
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
