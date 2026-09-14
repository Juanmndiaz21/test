'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '../i18n/navigation';
import Icon from './Icon';

const LOCALES = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
];

export default function LanguageSwitcher() {
    const locale = useLocale();
    const t = useTranslations('common');
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const closeOnOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
        };
        document.addEventListener('mousedown', closeOnOutside);
        return () => document.removeEventListener('mousedown', closeOnOutside);
    }, [open]);

    const select = (code) => {
        setOpen(false);
        if (code !== locale) router.replace(pathname, { locale: code });
    };

    const current = LOCALES.find((option) => option.code === locale) ?? LOCALES[0];

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={t('navLanguage')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-bold uppercase tracking-wide text-slate-200 hover:border-lime-300/40 hover:text-lime-300 transition-colors"
            >
                <Icon name="globe" className="w-3.5 h-3.5" />
                {current.code}
                <Icon name="chevron-down" className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2.5} />
            </button>

            {open && (
                <div role="menu" className="absolute right-0 top-full mt-2 w-40 panel-surface rounded-xl overflow-hidden z-50 border-lime-300/20">
                    {LOCALES.map((option) => (
                        <button
                            key={option.code}
                            type="button"
                            role="menuitem"
                            onClick={() => select(option.code)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                                option.code === locale
                                    ? 'bg-lime-300 text-black font-black'
                                    : 'text-slate-300 hover:bg-white/5'
                            }`}
                        >
                            {option.label}
                            {option.code === locale && <Icon name="check" className="w-3.5 h-3.5" strokeWidth={3} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}