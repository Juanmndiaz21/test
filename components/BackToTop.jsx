'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Icon from './Icon';

export default function BackToTop() {
    const [visible, setVisible] = useState(false);
    const t = useTranslations('common');

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 500);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <button
            type="button"
            aria-label={t('backToTop')}
            aria-hidden={!visible}
            tabIndex={visible ? 0 : -1}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`fixed bottom-5 right-5 z-[90] h-11 w-11 rounded-xl border border-white/10 bg-zinc-900/90 backdrop-blur text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-zinc-950 shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-[transform,opacity,background-color,color] duration-200 ease-out active:scale-[0.92] cursor-pointer ${
                visible ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
            }`}
        >
            <Icon name="chevron-up" className="w-5 h-5" strokeWidth={2.4} />
        </button>
    );
}