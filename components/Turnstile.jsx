'use client';

import { useEffect, useRef } from 'react';

export default function Turnstile({ siteKey, onToken, onExpire }) {
    const containerRef = useRef(null);
    const loadedRef = useRef(false);

    useEffect(() => {
        const sitekey = siteKey ?? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
        if (!sitekey) return;

        const render = () => {
            if (!window.turnstile || loadedRef.current) return;
            loadedRef.current = true;
            window.turnstile.render(containerRef.current, {
                sitekey,
                theme: 'dark',
                callback: (token) => onToken?.(token),
                'expired-callback': () => onExpire?.() && onToken?.(''),
                'error-callback': () => onExpire?.(),
            });
        };

        if (window.turnstile) {
            render();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.onload = render;
        document.body.appendChild(script);

        return () => {
            if (window.turnstile && containerRef.current) {
                try {
                    window.turnstile.remove(containerRef.current);
                } catch {
                    /* ignore */
                }
            }
            loadedRef.current = false;
        };
    }, [siteKey, onToken, onExpire]);

    if (!(siteKey ?? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)) return null;

    return <div ref={containerRef} />;
}