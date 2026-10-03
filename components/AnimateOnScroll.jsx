'use client';

import { useEffect, useRef } from 'react';

/**
 * Global observer initializer following the animation-on-scroll skill specification.
 * Automatically discovers any `.animate-on-scroll` element and triggers the CSS animation.
 */
export function AnimationOnScrollInit({
    threshold = 0.15,
    rootMargin = '0px 0px -10% 0px',
    once = true,
}) {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (!window.__inViewIO) {
            window.__inViewIO = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('animate');
                            if (once) window.__inViewIO.unobserve(entry.target);
                        }
                    });
                },
                { threshold, rootMargin }
            );
        }

        window.initInViewAnimations = function (selector = '.animate-on-scroll') {
            if (!window.__inViewIO) return;
            document.querySelectorAll(selector).forEach((el) => {
                window.__inViewIO.observe(el);
            });
        };

        window.initInViewAnimations();

        // Observe elements that might mount after hydration
        const timer = setTimeout(() => {
            if (window.initInViewAnimations) window.initInViewAnimations();
        }, 150);

        return () => clearTimeout(timer);
    }, [threshold, rootMargin, once]);

    return null;
}

/**
 * React wrapper component for animating elements on scroll.
 * Applies the skill's keyframe animation: [animation:animationIn_0.8s_ease-out_0.1s_both] animate-on-scroll
 */
export default function AnimateOnScroll({
    children,
    className = '',
    duration = '0.8s',
    delay = '0.1s',
    threshold = 0.15,
    rootMargin = '0px 0px -10% 0px',
    once = true,
    as: Component = 'div',
    ...props
}) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || typeof window === 'undefined') return;

        if (!('IntersectionObserver' in window)) {
            el.classList.add('animate');
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('animate');
                    if (once) observer.unobserve(el);
                } else if (!once) {
                    el.classList.remove('animate');
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(el);

        return () => {
            observer.disconnect();
        };
    }, [threshold, rootMargin, once]);

    return (
        <Component
            ref={ref}
            className={`animate-on-scroll [animation:animationIn_${duration}_ease-out_${delay}_both] ${className}`}
            {...props}
        >
            {children}
        </Component>
    );
}
