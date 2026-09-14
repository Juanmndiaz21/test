'use client';

import { useTranslations } from 'next-intl';
import { useCartStore } from '../store/useCartStore';
import { Link } from '../i18n/navigation';
import Icon from './Icon';

export default function CartLink({ className = '' }) {
    const t = useTranslations('siteHeader');
    const count = useCartStore((state) => state.cart.reduce((total, item) => total + item.quantity, 0));

    return (
        <Link
            href="/checkout"
            aria-label={t('cartAria', { count })}
            className={`relative inline-flex items-center justify-center transition-colors ${className}`}
        >
            <Icon name="cart" className="w-[22px] h-[22px]" strokeWidth={2} />
        </Link>
    );
}