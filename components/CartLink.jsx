'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '../store/useCartStore';
import { Link } from '../i18n/navigation';
import Icon from './Icon';

export default function CartLink({ className = '', iconClassName = 'w-[19px] h-[19px]' }) {
    const t = useTranslations('siteHeader');
    const count = useCartStore((state) => state.cart.reduce((total, item) => total + item.quantity, 0));
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const displayCount = mounted ? count : 0;

    return (
        <Link
            href="/checkout"
            aria-label={t('cartAria', { count: displayCount })}
            className={`relative inline-flex items-center justify-center transition-colors ${className}`}
        >
            <Icon name="cart" className={iconClassName} strokeWidth={2} />
            {displayCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#9d7cff] text-[#0d0914] text-[10px] font-black flex items-center justify-center leading-none shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
                    {displayCount > 99 ? '99+' : displayCount}
                </span>
            )}
        </Link>
    );
}