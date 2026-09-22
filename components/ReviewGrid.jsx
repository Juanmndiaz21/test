'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Icon from './Icon';

function Stars({ rating, starsAria }) {
    const stars = [];
    for (let i = 1; i <= 5; i += 1) {
        stars.push(
            <svg
                key={i}
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={`w-3.5 h-3.5 ${i <= rating ? 'fill-[#9d7cff]' : 'fill-white/20'}`}
            >
                <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
        );
    }
    return (
        <div
            role="img"
            aria-label={starsAria ? `${starsAria}: ${rating}/5` : `${rating} out of 5 stars`}
            className="flex gap-0.5"
        >
            {stars}
        </div>
    );
}

function formatReviewDate(dateValue) {
    if (!dateValue) return 'Recent';
    try {
        const d = new Date(dateValue);
        if (isNaN(d.getTime())) return 'Recent';
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch {
        return 'Recent';
    }
}

export default function ReviewGrid({ reviews = [], starsAria }) {
    const t = useTranslations('home');

    // Base reviews: ensure at least 6 items for smooth endless wrapping
    const base = useMemo(() => {
        if (!reviews || reviews.length === 0) return [];
        let list = [...reviews];
        while (list.length < 6) {
            list = [...list, ...reviews];
        }
        return list;
    }, [reviews]);

    const containerRef = useRef(null);
    const trackRef = useRef(null);
    const set1Ref = useRef(null);
    const set2Ref = useRef(null);

    const posRef = useRef(0);
    const trackWidthRef = useRef(0);
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const startPosRef = useRef(0);
    const [isDragging, setIsDragging] = useState(false);

    // WCAG 2.2.2 user pause control (default to active auto-rotation)
    const [isPaused, setIsPaused] = useState(false);
    const isVisibleRef = useRef(true);

    const isPausedRef = useRef(false);
    isPausedRef.current = isPaused;

    // Speed setting
    const [speedMultiplier, setSpeedMultiplier] = useState(1);
    const speedMultiplierRef = useRef(1);
    speedMultiplierRef.current = speedMultiplier;

    // Measure single-cycle track width
    const measureTrack = useCallback(() => {
        let w = 0;
        if (set1Ref.current && set2Ref.current) {
            w = set2Ref.current.offsetLeft - set1Ref.current.offsetLeft;
        }
        if (!w && set1Ref.current) {
            w = set1Ref.current.scrollWidth || set1Ref.current.offsetWidth || 0;
        }
        if (w > 0) {
            trackWidthRef.current = w;
            if (posRef.current === 0) {
                posRef.current = -w / 2;
            }
        }
        return w;
    }, []);

    useEffect(() => {
        measureTrack();

        const ro = new ResizeObserver(() => {
            measureTrack();
        });
        if (set1Ref.current) ro.observe(set1Ref.current);
        window.addEventListener('resize', measureTrack);

        return () => {
            ro.disconnect();
            window.removeEventListener('resize', measureTrack);
        };
    }, [base.length, measureTrack]);

    // IntersectionObserver to pause loop when off-screen (saves battery/CPU)
    useEffect(() => {
        const el = containerRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') return;

        const observer = new IntersectionObserver(([entry]) => {
            isVisibleRef.current = entry.isIntersecting;
        }, { threshold: 0.05 });

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Continuous auto-rotation loop
    useEffect(() => {
        let animId;
        let lastTime = performance.now();

        const loop = (time) => {
            const delta = Math.min((time - lastTime) / 1000, 0.1);
            lastTime = time;

            // Self-healing track width measurement if not ready on initial mount
            if (trackWidthRef.current <= 0) {
                measureTrack();
            }

            if (
                isVisibleRef.current &&
                !isPausedRef.current &&
                !isDraggingRef.current &&
                trackWidthRef.current > 0
            ) {
                const W = trackWidthRef.current;
                // Scroll leftwards smoothly (35px per second * speed)
                posRef.current -= 35 * speedMultiplierRef.current * delta;

                while (posRef.current <= -W) {
                    posRef.current += W;
                }
                while (posRef.current >= 0) {
                    posRef.current -= W;
                }

                if (trackRef.current) {
                    trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
                }
            }

            animId = requestAnimationFrame(loop);
        };

        animId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animId);
    }, [measureTrack]);

    // Pointer events for interactive drag-to-scrub
    const handlePointerDown = (e) => {
        if (e.button !== undefined && e.button !== 0) return;

        isDraggingRef.current = true;
        setIsDragging(true);
        startXRef.current = e.clientX;
        startPosRef.current = posRef.current;

        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
            // Ignore pointer capture error
        }
    };

    const handlePointerMove = (e) => {
        if (!isDraggingRef.current) return;

        const diff = e.clientX - startXRef.current;
        let newPos = startPosRef.current + diff;
        const W = trackWidthRef.current;

        if (W > 0) {
            while (newPos <= -W) newPos += W;
            while (newPos >= 0) newPos -= W;
        }

        posRef.current = newPos;

        if (trackRef.current) {
            trackRef.current.style.transform = `translate3d(${newPos}px, 0, 0)`;
        }
    };

    const handlePointerUp = (e) => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        setIsDragging(false);

        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
            // Ignore
        }
    };

    // Quick nudge buttons
    const handleNudge = useCallback((direction) => {
        const W = trackWidthRef.current;
        const delta = direction === 'right' ? 320 : -320;
        let nextPos = posRef.current + delta;
        if (W > 0) {
            while (nextPos <= -W) nextPos += W;
            while (nextPos >= 0) nextPos -= W;
        }
        posRef.current = nextPos;
        if (trackRef.current) {
            trackRef.current.style.transform = `translate3d(${nextPos}px, 0, 0)`;
        }
    }, []);

    if (!base || base.length === 0) return null;

    const renderCard = (review, idx, setPrefix) => (
        <figure
            key={`${setPrefix}-${review.id || 'rev'}-${idx}`}
            className="panel-surface rounded-2xl p-6 md:p-7 w-[300px] sm:w-[360px] md:w-[400px] shrink-0 flex flex-col justify-between border border-white/10 bg-[#171229] hover:border-[#9d7cff]/50 transition-colors duration-150 relative overflow-hidden select-none shadow-[0_16px_36px_rgba(0,0,0,0.35)]"
        >
            <div>
                <div className="flex items-center justify-between gap-2 mb-3.5">
                    <Stars rating={review.rating || 5} starsAria={starsAria} />
                    <span className="text-[11px] font-mono font-bold tracking-wider text-[#9d7cff] bg-[#9d7cff]/10 px-2.5 py-1 rounded-full border border-[#9d7cff]/20 uppercase">
                        Verified
                    </span>
                </div>
                <p className="font-['Trebuchet_MS',sans-serif] font-bold text-white text-base mb-2 line-clamp-1">
                    {review.title || 'Verified Climb'}
                </p>
                <blockquote className="text-slate-300 text-sm md:text-base leading-relaxed line-clamp-4 font-normal">
                    &ldquo;{review.content}&rdquo;
                </blockquote>
            </div>
            <figcaption className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                <strong className="block text-white font-bold text-sm truncate">
                    {review.author || 'Player'}
                </strong>
                <span suppressHydrationWarning className="text-xs text-slate-400 data-readout font-mono">
                    {formatReviewDate(review.created_at)}
                </span>
            </figcaption>
        </figure>
    );

    return (
        <div
            ref={containerRef}
            className="relative select-none"
        >
            {/* Control & Live Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <span className="relative flex h-2 w-2" aria-hidden="true">
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isPaused ? 'bg-slate-400' : 'bg-[#9d7cff] animate-pulse'}`} />
                    </span>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 data-readout">
                        {isPaused ? (t ? t('paused') : 'PAUSED') : (t ? t('autoRotating') : 'ROTATING')}
                    </span>
                    <span className="hidden sm:inline-block text-xs font-mono text-slate-400 bg-white/5 border border-white/10 rounded-full px-3 py-1 data-readout">
                        {t ? t('dragToScrub') : 'DRAG TO SCRUB'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* WCAG 2.2.2 Pause/Play Button */}
                    <button
                        type="button"
                        onClick={() => setIsPaused((p) => !p)}
                        aria-label={isPaused ? (t ? t('play') : 'Play') : (t ? t('pause') : 'Pause')}
                        title={isPaused ? (t ? t('play') : 'Play') : (t ? t('pause') : 'Pause')}
                        className="min-h-[40px] px-3.5 rounded-lg border border-white/15 bg-white/5 text-slate-300 hover:border-[#9d7cff]/50 hover:text-[#9d7cff] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#9d7cff] transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-mono font-bold"
                    >
                        <Icon name={isPaused ? 'play' : 'pause'} className="w-3.5 h-3.5" />
                        <span className="uppercase">{isPaused ? (t ? t('play') : 'PLAY') : (t ? t('pause') : 'PAUSE')}</span>
                    </button>

                    {/* Manual Nudge Buttons */}
                    <button
                        type="button"
                        onClick={() => handleNudge('left')}
                        aria-label={t ? t('prevReviews') : 'Previous reviews'}
                        title={t ? t('prevReviews') : 'Previous'}
                        className="min-h-[40px] min-w-[40px] h-10 w-10 rounded-lg border border-white/15 bg-white/5 text-slate-300 hover:border-[#9d7cff]/50 hover:text-[#9d7cff] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#9d7cff] transition-colors flex items-center justify-center cursor-pointer"
                    >
                        <Icon name="chevron-left" className="w-4 h-4" strokeWidth={2.4} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleNudge('right')}
                        aria-label={t ? t('nextReviews') : 'Next reviews'}
                        title={t ? t('nextReviews') : 'Next'}
                        className="min-h-[40px] min-w-[40px] h-10 w-10 rounded-lg border border-white/15 bg-white/5 text-slate-300 hover:border-[#9d7cff]/50 hover:text-[#9d7cff] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#9d7cff] transition-colors flex items-center justify-center cursor-pointer"
                    >
                        <Icon name="chevron-right" className="w-4 h-4" strokeWidth={2.4} />
                    </button>
                </div>
            </div>

            {/* Viewport with pointer capture for interactive scrub */}
            <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{ touchAction: 'pan-y' }}
                className={`relative overflow-hidden -mx-5 px-5 py-3 ${
                    isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
            >
                {/* Left Gradient Fade */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 md:w-32 bg-gradient-to-r from-[#120e1c] via-[#120e1c]/80 to-transparent z-10"
                />

                {/* Right Gradient Fade */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 md:w-32 bg-gradient-to-l from-[#120e1c] via-[#120e1c]/80 to-transparent z-10"
                />

                {/* Moving Track */}
                <div
                    ref={trackRef}
                    className="flex gap-5 w-max will-change-transform"
                >
                    {/* Set 1 */}
                    <div ref={set1Ref} className="flex gap-5 shrink-0">
                        {base.map((review, i) => renderCard(review, i, 's1'))}
                    </div>

                    {/* Set 2 (Identical duplicate for seamless wrap) */}
                    <div ref={set2Ref} className="flex gap-5 shrink-0">
                        {base.map((review, i) => renderCard(review, i, 's2'))}
                    </div>

                    {/* Set 3 (Buffer for wide viewports during manual drag) */}
                    <div className="flex gap-5 shrink-0">
                        {base.map((review, i) => renderCard(review, i, 's3'))}
                    </div>
                </div>
            </div>
        </div>
    );
}
