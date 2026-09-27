'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '../i18n/navigation';
import Icon from './Icon';

const LOCALES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-bold uppercase tracking-wide text-slate-200 hover:border-[#9d7cff]/40 hover:text-[#9d7cff] transition-[border-color,color,transform] duration-150 active:scale-[0.96] cursor-pointer"
            >
                <Icon name="globe" className="w-3.5 h-3.5" />
                {current.code}
                <Icon name="chevron-down" className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} strokeWidth={2.5} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        role="menu"
                        initial={{ opacity: 0, transform: 'scale(0.95)' }}
                        animate={{ opacity: 1, transform: 'scale(1)' }}
                        exit={{ opacity: 0, transform: 'scale(0.95)' }}
                        transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                        style={{ transformOrigin: 'top right' }}
                        className="absolute right-0 top-full mt-2 w-40 panel-surface rounded-xl overflow-hidden z-50 border border-[#9d7cff]/20 shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
                    >
                        {LOCALES.map((option) => (
                            <button
                                key={option.code}
                                type="button"
                                role="menuitem"
                                onClick={() => select(option.code)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-[background-color,color] duration-150 active:scale-[0.98] cursor-pointer ${
                                    option.code === locale
                                        ? 'bg-[#9d7cff] text-[#0d0914] font-black'
                                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                {option.label}
                                {option.code === locale && <Icon name="check" className="w-3.5 h-3.5 text-[#0d0914]" strokeWidth={3} />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}