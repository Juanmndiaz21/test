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
            className={`fixed bottom-5 right-5 z-[90] h-11 w-11 rounded-xl border border-lime-300/40 bg-[#171229]/90 backdrop-blur text-lime-300 flex items-center justify-center hover:bg-lime-300 hover:text-black transition-all ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
            }`}
        >
            <Icon name="chevron-up" className="w-5 h-5" strokeWidth={2.4} />
        </button>
    );
}