'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Cart from '@/components/Cart';
import CheckoutPanel from '@/components/Checkout';
import { useCartStore } from '@/store/useCartStore';

export default function CheckoutPage() {
    const t = useTranslations('checkout');
    const [mounted, setMounted] = useState(false);
    const cart = useCartStore((state) => state.cart);
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="max-w-7xl mx-auto px-5 py-12 md:py-16 space-y-8 min-h-[50vh]">
                <div><p className="eyebrow mb-3">{t('eyebrow')}</p><h1 className="display-font text-5xl uppercase text-white">{t('title')}</h1></div>
                <div className="panel-surface rounded-2xl p-10 text-center text-slate-400">
                    <span className="inline-block h-5 w-5 rounded-full border-2 border-lime-300/40 border-t-lime-300 animate-spin mr-3 align-middle" />
                    Loading checkout…
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-5 py-12 md:py-16 space-y-8">
            <div><p className="eyebrow mb-3">{t('eyebrow')}</p><h1 className="display-font text-5xl uppercase text-white">{t('title')}</h1></div>

            {itemCount === 0 ? (
                <div className="panel-surface rounded-2xl p-10 md:p-14 text-center">
                    <h2 className="display-font text-3xl md:text-4xl uppercase text-white">{t('emptyTitle')}</h2>
                    <p className="text-slate-400 mt-4 max-w-md mx-auto leading-relaxed">
                        {t('emptyText')}
                    </p>
                    <Link href="/store" className="inline-block mt-8 bg-lime-300 hover:bg-lime-200 text-black font-black uppercase tracking-wide px-8 py-4 rounded-lg transition-colors">
                        {t('viewLadder')}
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <Cart />
                    <CheckoutPanel />
                </div>
            )}
        </div>
    );
}