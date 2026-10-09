'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Cinematic motion system (GSAP + ScrollTrigger + Lenis).
 *
 * Markup API (all optional, server components just add attributes):
 *   data-hero="1..6"            Hero intro choreography, played in numeric order on load
 *   data-hero-parallax="bg"     Hero background layer, drifts slower on scroll-out
 *   data-hero-parallax="content" Hero copy, lifts + fades slightly on scroll-out
 *   data-reveal                 Section fade-up when it enters the viewport
 *   data-reveal-group           Container whose [data-reveal-item] children stagger in
 *   data-motion-text="words"    Plain-text heading split into masked words
 *   data-magnetic="0.2"         Pointer-following magnetic hover (fine pointers only)
 */

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: 'power3.out', duration: 0.85 });
}

function splitWords(element) {
    if (element.dataset.motionSplit === 'true') return null;
    const original = element.textContent || '';
    const parts = original.split(/(\s+)/);

    element.textContent = '';
    element.setAttribute('aria-label', original.trim());

    parts.forEach((part) => {
        if (!part.trim()) {
            element.appendChild(document.createTextNode(part));
            return;
        }
        const mask = document.createElement('span');
        const word = document.createElement('span');
        mask.className = 'motion-word-mask';
        mask.setAttribute('aria-hidden', 'true');
        word.className = 'motion-word';
        word.textContent = part;
        mask.appendChild(word);
        element.appendChild(mask);
    });

    element.dataset.motionSplit = 'true';
    // Restore function so React never sees a mutated tree after cleanup
    return () => {
        element.textContent = original;
        element.removeAttribute('aria-label');
        delete element.dataset.motionSplit;
    };
}

export default function MotionSystem() {
    const pathname = usePathname();

    // ── Lenis smooth scroll (created once, synced to the GSAP ticker) ──
    useEffect(() => {
        const root = document.documentElement;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        root.classList.add('motion-booted');
        if (reduceMotion) return;

        const lenis = new Lenis({
            lerp: 0.085,
            smoothWheel: true,
            wheelMultiplier: 0.9,
            anchors: true,
            allowNestedScroll: true,
        });
        window.__lenis = lenis;

        lenis.on('scroll', ScrollTrigger.update);
        const tick = (time) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        // Pause smooth scroll while a modal/drawer locks the page
        const syncLock = () => {
            const locked =
                document.body.style.overflow === 'hidden' ||
                root.style.overflow === 'hidden';
            if (locked) lenis.stop();
            else lenis.start();
        };
        const lockObserver = new MutationObserver(syncLock);
        lockObserver.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });
        lockObserver.observe(root, { attributes: true, attributeFilter: ['style'] });

        const onLoad = () => ScrollTrigger.refresh();
        window.addEventListener('load', onLoad);

        return () => {
            window.removeEventListener('load', onLoad);
            lockObserver.disconnect();
            gsap.ticker.remove(tick);
            lenis.destroy();
            delete window.__lenis;
        };
    }, []);

    // ── Per-route scenes ──
    useEffect(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        const restorers = [];
        const cleanups = [];

        // New route always starts at the absolute top across desktop & mobile
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            if (document.documentElement) document.documentElement.scrollTop = 0;
            if (document.body) document.body.scrollTop = 0;
        }
        window.__lenis?.scrollTo(0, { immediate: true });

        const ctx = gsap.context(() => {
            const all = '[data-hero], [data-reveal], [data-reveal-item], [data-motion-text]';

            if (reduceMotion) {
                gsap.set(all, { autoAlpha: 1, clearProps: 'transform,filter' });
                return;
            }

            // 1. Hero choreography: background → logo → headline lines → copy → CTA → trust
            const heroSteps = gsap.utils
                .toArray('[data-hero]')
                .sort((a, b) => Number(a.dataset.hero) - Number(b.dataset.hero));

            if (heroSteps.length) {
                const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 });
                heroSteps.forEach((el, i) => {
                    const isLine = el.hasAttribute('data-hero-line');
                    const isBg = el.dataset.hero === '0';
                    if (isBg) {
                        tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.6, ease: 'power2.out' }, 0);
                        return;
                    }
                    tl.fromTo(
                        el,
                        isLine
                            ? { yPercent: 105, autoAlpha: 0 }
                            : { y: 26, autoAlpha: 0, filter: 'blur(6px)' },
                        isLine
                            ? { yPercent: 0, autoAlpha: 1, duration: 1.15 }
                            : { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 1.05 },
                        0.15 + i * 0.11
                    );
                });
            }

            // 2. Hero scroll-out parallax: background drifts slower, copy lifts away
            const hero = document.querySelector('[data-hero-section]');
            if (hero) {
                const bg = hero.querySelector('[data-hero-parallax="bg"]');
                const content = hero.querySelector('[data-hero-parallax="content"]');
                const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1.2 };
                if (bg) gsap.to(bg, { yPercent: 18, ease: 'none', scrollTrigger: st });
                if (content) gsap.to(content, { y: -70, autoAlpha: 0.35, ease: 'none', scrollTrigger: { ...st } });
            }

            // 3. Word-split section headings
            gsap.utils.toArray('[data-motion-text="words"]').forEach((el) => {
                const restore = splitWords(el);
                if (restore) restorers.push(restore);
                gsap.set(el, { autoAlpha: 1 });
                gsap.fromTo(
                    el.querySelectorAll('.motion-word'),
                    { yPercent: 110, autoAlpha: 0 },
                    {
                        yPercent: 0,
                        autoAlpha: 1,
                        duration: 0.95,
                        ease: 'power4.out',
                        stagger: 0.055,
                        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
                    }
                );
            });

            // 4. Staggered groups (cards, grids)
            gsap.utils.toArray('[data-reveal-group]').forEach((group) => {
                const items = group.querySelectorAll('[data-reveal-item]');
                if (!items.length) return;
                gsap.fromTo(
                    items,
                    { y: 34, autoAlpha: 0 },
                    {
                        y: 0,
                        autoAlpha: 1,
                        duration: 0.95,
                        ease: 'power4.out',
                        stagger: 0.08,
                        scrollTrigger: { trigger: group, start: 'top 84%', once: true },
                    }
                );
            });

            // 5. Section reveals
            gsap.utils.toArray('[data-reveal]').forEach((el) => {
                gsap.fromTo(
                    el,
                    { y: 40, autoAlpha: 0 },
                    {
                        y: 0,
                        autoAlpha: 1,
                        duration: 1.05,
                        ease: 'power4.out',
                        delay: Number(el.dataset.revealDelay || 0),
                        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
                    }
                );
            });

            // 6. Magnetic CTAs (fine pointers only)
            if (finePointer) {
                gsap.utils.toArray('[data-magnetic]').forEach((el) => {
                    const strength = Number(el.dataset.magnetic || 0.2);
                    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
                    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
                    const onMove = (e) => {
                        const r = el.getBoundingClientRect();
                        xTo((e.clientX - r.left - r.width / 2) * strength);
                        yTo((e.clientY - r.top - r.height / 2) * strength);
                    };
                    const onLeave = () => {
                        xTo(0);
                        yTo(0);
                    };
                    el.addEventListener('pointermove', onMove);
                    el.addEventListener('pointerleave', onLeave);
                    cleanups.push(() => {
                        el.removeEventListener('pointermove', onMove);
                        el.removeEventListener('pointerleave', onLeave);
                    });
                });
            }
        });

        // Layout settles after fonts/images; re-measure trigger positions
        const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 400);
        document.fonts?.ready?.then(() => ScrollTrigger.refresh());

        return () => {
            clearTimeout(refreshTimer);
            cleanups.forEach((fn) => fn());
            ctx.revert();
            restorers.forEach((fn) => fn());
        };
    }, [pathname]);

    return null;
}
