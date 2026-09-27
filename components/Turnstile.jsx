'use client';

import { useEffect, useRef, useState } from 'react';

const SCRIPT_ID = 'cf-turnstile-script';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export default function Turnstile({ siteKey, onToken, onExpire, action }) {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);
    const [devError, setDevError] = useState(null);
    const [bypassed, setBypassed] = useState(false);

    // Keep latest callbacks in refs to prevent unnecessary widget re-creations on every render
    const onTokenRef = useRef(onToken);
    onTokenRef.current = onToken;

    const onExpireRef = useRef(onExpire);
    onExpireRef.current = onExpire;

    useEffect(() => {
        const sitekey = siteKey ?? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
        if (!sitekey) return;

        let isMounted = true;
        let pollTimer = null;
        const currentContainer = containerRef.current;

        const renderWidget = () => {
            if (!isMounted || !window.turnstile || !currentContainer || widgetIdRef.current) return;
            try {
                // Ensure container is clean
                currentContainer.innerHTML = '';
                widgetIdRef.current = window.turnstile.render(currentContainer, {
                    sitekey,
                    ...(action ? { action } : {}),
                    theme: 'dark',
                    callback: (token) => {
                        if (isMounted) {
                            setDevError(null);
                            onTokenRef.current?.(token);
                        }
                    },
                    'expired-callback': () => {
                        if (isMounted) {
                            onExpireRef.current?.();
                            onTokenRef.current?.('');
                        }
                    },
                    'error-callback': (code) => {
                        console.warn('Turnstile widget warning/error code:', code);
                        if (isMounted) {
                            onExpireRef.current?.();
                            onTokenRef.current?.('');
                            setDevError(code || 'error');
                        }
                    },
                });
            } catch (err) {
                console.warn('Turnstile render caught error:', err);
            }
        };

        if (window.turnstile) {
            renderWidget();
        } else {
            let script = document.getElementById(SCRIPT_ID);
            if (!script) {
                script = document.createElement('script');
                script.id = SCRIPT_ID;
                script.src = SCRIPT_SRC;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            }

            script.addEventListener('load', renderWidget);

            // Fallback poll in case the script tag already loaded earlier
            pollTimer = setInterval(() => {
                if (window.turnstile) {
                    clearInterval(pollTimer);
                    pollTimer = null;
                    renderWidget();
                }
            }, 100);
        }

        return () => {
            isMounted = false;
            if (pollTimer) clearInterval(pollTimer);
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch {
                    /* ignore */
                }
                widgetIdRef.current = null;
            }
        };
    }, [siteKey, action]); // Only re-render when siteKey or action changes, NOT on every keystroke

    const sitekey = siteKey ?? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!sitekey) return null;

    const isDev = process.env.NODE_ENV !== 'production';

    const handleDevBypass = () => {
        setBypassed(true);
        onTokenRef.current?.('dev-bypass');
    };

    return (
        <div className="space-y-2">
            <div ref={containerRef} suppressHydrationWarning />
            {isDev && devError && !bypassed && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span>
                        Turnstile code: <strong>{devError}</strong> (if on localhost, add <code>localhost</code> to your Cloudflare widget allowed domains).
                    </span>
                    <button
                        type="button"
                        onClick={handleDevBypass}
                        className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 font-semibold cursor-pointer whitespace-nowrap"
                    >
                        Bypass on Localhost
                    </button>
                </div>
            )}
            {isDev && bypassed && (
                <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono">
                    <span>✓</span> Security check bypassed in development mode
                </div>
            )}
        </div>
    );
}
