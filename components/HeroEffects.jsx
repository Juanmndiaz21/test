'use client';

import { useEffect, useRef } from 'react';

const PARTICLES = [
    { left: '8%', top: '22%', size: 5, tint: 'bg-lime-300' },
    { left: '22%', top: '12%', size: 7, tint: 'bg-lime-300' },
    { left: '35%', top: '38%', size: 4, tint: 'bg-lime-300/70' },
    { left: '48%', top: '18%', size: 6, tint: 'bg-lime-300' },
    { left: '60%', top: '34%', size: 4, tint: 'bg-lime-300/60' },
    { left: '72%', top: '14%', size: 6, tint: 'bg-lime-300' },
    { left: '85%', top: '26%', size: 5, tint: 'bg-lime-300/70' },
    { left: '92%', top: '10%', size: 4, tint: 'bg-lime-300/60' },
    { left: '14%', top: '70%', size: 4, tint: 'bg-lime-300/40' },
    { left: '42%', top: '64%', size: 5, tint: 'bg-lime-300/60' },
    { left: '68%', top: '72%', size: 4, tint: 'bg-lime-300/40' },
    { left: '88%', top: '60%', size: 5, tint: 'bg-lime-300/60' },
    { left: '4%', top: '46%', size: 3, tint: 'bg-lime-300/50' },
    { left: '96%', top: '44%', size: 3, tint: 'bg-lime-300/50' },
    { left: '30%', top: '84%', size: 5, tint: 'bg-lime-300/40' },
    { left: '80%', top: '86%', size: 4, tint: 'bg-lime-300/40' },
];

export default function HeroEffects() {
    const layerRef = useRef(null);

    useEffect(() => {
        const layer = layerRef.current;
        if (!layer) return undefined;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return undefined;

        let animation;
        let cancelled = false;

        (async () => {
            const anime = (await import('animejs')).default;
            if (cancelled || !layerRef.current) return;

            const dots = layerRef.current.querySelectorAll('span');
            animation = anime({
                targets: dots,
                translateY: [0, -14],
                opacity: [0.0, 0.65, 0.0],
                rotate: [0, 360],
                duration: (el, index) => 2600 + (index % 5) * 520,
                delay: (el, index) => index * 110,
                loop: true,
                easing: 'easeInOutSine',
            });
        })();

        return () => {
            cancelled = true;
            if (animation) animation.pause();
        };
    }, []);

    return (
        <div
            ref={layerRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
        >
            {PARTICLES.map((particle, index) => (
                <span
                    key={index}
                    className={`absolute rounded-full ${particle.tint}`}
                    style={{
                        left: particle.left,
                        top: particle.top,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                    }}
                />
            ))}
        </div>
    );
}