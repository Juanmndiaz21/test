'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Cart from '@/components/Cart';
import CheckoutPanel from '@/components/Checkout';
import PageHeaderBanner from '@/components/PageHeaderBanner';
import { useCartStore } from '@/store/useCartStore';

export default function CheckoutPage() {
    const t = useTranslations('checkout');
    const [mounted, setMounted] = useState(false);
    const cart = useCartStore((state) => state.cart);
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

    useEffect(() => {
        setMounted(true);
    }, []);

    const bannerSubtitle = t('eyebrow');

    if (!mounted) {
        return (
            <div className="min-h-screen bg-[#1A1A24] text-slate-100 pb-20">
                <PageHeaderBanner
                    title={t('title')}
                    subtitle={bannerSubtitle}
                    maxWidth="max-w-7xl"
                />
                <div className="max-w-7xl mx-auto px-5 py-10 sm:py-12">
                    <div className="rounded-2xl bg-[#252530] p-10 text-center text-slate-400">
                        <span className="inline-block h-5 w-5 rounded-full border-2 border-[#9333EA]/40 border-t-[#9333EA] animate-spin mr-3 align-middle" />
                        Loading checkout…
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1A1A24] text-slate-100 pb-20">
            <PageHeaderBanner
                title={t('title')}
                subtitle={bannerSubtitle}
                badge={itemCount > 0 ? `${itemCount} items` : undefined}
                maxWidth="max-w-7xl"
            />

            <div className="max-w-7xl mx-auto px-5 py-10 sm:py-12">
                {itemCount === 0 ? (
                    <div className="rounded-2xl bg-[#252530] p-10 md:p-14 text-center">
                        <h2 className="font-['Trebuchet_MS',sans-serif] text-2xl md:text-3xl font-bold text-white">{t('emptyTitle')}</h2>
                        <p className="text-slate-400 mt-4 max-w-md mx-auto leading-relaxed">
                            {t('emptyText')}
                        </p>
                        <Link href="/store" className="inline-block mt-8 bg-[#9333EA] hover:bg-[#8229b8] text-white font-bold uppercase tracking-wide px-8 py-3.5 rounded-lg transition-colors">
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
        </div>
    );
}