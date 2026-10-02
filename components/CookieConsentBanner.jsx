'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import Icon from './Icon';

const CONSENT_STORAGE_KEY = 'ogmodz_cookie_consent_v1';

export default function CookieConsentBanner() {
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);
    const [showCustomize, setShowCustomize] = useState(false);
    const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

    useEffect(() => {
        setMounted(true);
        const consent = localStorage.getItem(CONSENT_STORAGE_KEY);
        if (!consent) {
            // Delay slightly for smooth entrance after initial paint
            const timer = setTimeout(() => setVisible(true), 750);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ essential: true, analytics: true, date: new Date().toISOString() }));
        setVisible(false);
    };

    const handleEssentialOnly = () => {
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ essential: true, analytics: false, date: new Date().toISOString() }));
        setVisible(false);
    };

    const handleSavePreferences = () => {
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ essential: true, analytics: analyticsAllowed, date: new Date().toISOString() }));
        setVisible(false);
    };

    if (!mounted || !visible) return null;

    return (
        <aside
            role="region"
            aria-label="Cookie and Privacy Consent"
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg z-50 p-5 rounded-2xl border border-[#9d7cff]/30 bg-[#161024]/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-slate-100 transition-all duration-200"
        >
            <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/20 text-[#9d7cff] shrink-0 mt-0.5">
                    <Icon name="shield" className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-['Trebuchet_MS',sans-serif] text-base font-bold text-white tracking-wide">
                        Privacy & Cookie Preferences
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        We use strictly necessary cookies to keep our marketplace running (sessions, cart, security via Cloudflare Turnstile). Optional analytics help us improve platform performance.
                    </p>
                </div>
            </div>

            {showCustomize ? (
                <div className="my-3 pt-3 border-t border-white/10 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-white/5">
                        <div>
                            <span className="font-bold text-white block">Strictly Necessary</span>
                            <span className="text-slate-400 text-[11px]">Authentication, cart state, CSRF & bot security</span>
                        </div>
                        <span className="font-mono text-[11px] text-[#9d7cff] font-bold px-2 py-0.5 rounded bg-[#9d7cff]/10">Required</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-white/5">
                        <div>
                            <span className="font-bold text-white block">Anonymous Analytics</span>
                            <span className="text-slate-400 text-[11px]">Vercel Web Analytics (first-party, cookieless metrics)</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={analyticsAllowed}
                                onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                                className="sr-only peer"
                                aria-label="Allow Anonymous Analytics"
                            />
                            <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9d7cff]" />
                        </label>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handleSavePreferences}
                            className="flex-1 py-2 px-3 rounded-lg bg-[#9d7cff] text-[#0d0914] text-xs font-bold uppercase tracking-wider hover:bg-[#b59dff] transition-colors focus-visible:ring-2 focus-visible:ring-white"
                        >
                            Save Choices
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowCustomize(false)}
                            className="py-2 px-3 rounded-lg bg-white/10 text-slate-300 text-xs font-medium hover:bg-white/15 transition-colors"
                        >
                            Back
                        </button>
                    </div>
                </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                <div className="flex items-center gap-3 text-[11px]">
                    <Link
                        href="/cookies"
                        className="text-[#c8b4ff] hover:text-white underline underline-offset-2 transition-colors"
                    >
                        Cookie Policy
                    </Link>
                    <Link
                        href="/privacy"
                        className="text-[#c8b4ff] hover:text-white underline underline-offset-2 transition-colors"
                    >
                        Privacy Policy
                    </Link>
                </div>

                {!showCustomize && (
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            type="button"
                            onClick={() => setShowCustomize(true)}
                            className="py-1.5 px-2.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#9d7cff]"
                        >
                            Customize
                        </button>
                        <button
                            type="button"
                            onClick={handleEssentialOnly}
                            className="py-1.5 px-3 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold uppercase tracking-wide transition-colors focus-visible:ring-2 focus-visible:ring-[#9d7cff]"
                        >
                            Essential Only
                        </button>
                        <button
                            type="button"
                            onClick={handleAcceptAll}
                            className="py-1.5 px-3.5 rounded-lg bg-[#9d7cff] text-[#0d0914] hover:bg-[#b59dff] text-xs font-bold uppercase tracking-wide transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-white"
                        >
                            Accept All
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}
