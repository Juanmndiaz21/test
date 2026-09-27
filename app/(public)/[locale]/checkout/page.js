'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Cart from '@/components/Cart';
import CheckoutPanel from '@/components/Checkout';
import PageHeaderBanner from '@/components/PageHeaderBanner';
import { useCartStore } from '@/store/useCartStore';
import LoadingWheel from '@/components/LoadingWheel';

export default function CheckoutPage() {
    const t = useTranslations('checkout');
    const tCart = useTranslations('cart');
    const [mounted, setMounted] = useState(false);
    const cart = useCartStore((state) => state.cart);
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

    useEffect(() => {
        setMounted(true);
    }, []);

    const bannerSubtitle = t('eyebrow');

    if (!mounted) {
        return (
            <div className="min-h-screen bg-[#120e1c] text-slate-100 pb-20">
                <PageHeaderBanner
                    title={t('title')}
                    subtitle={bannerSubtitle}
                    maxWidth="max-w-7xl"
                />
                <div className="max-w-7xl mx-auto px-5 py-10 sm:py-16">
                    <div className="rounded-2xl bg-[#171229] border border-white/10 p-12 text-center text-slate-300 shadow-xl flex flex-col items-center justify-center">
                        <LoadingWheel size="lg" showLogo={true} label={t('placeInProgress')} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#120e1c] text-slate-100 pb-20">
            <PageHeaderBanner
                title={t('title')}
                subtitle={bannerSubtitle}
                badge={itemCount > 0 ? tCart('itemCount', { count: itemCount }) : undefined}
                maxWidth="max-w-7xl"
            />

            <div className="max-w-7xl mx-auto px-5 py-10 sm:py-12">
                {itemCount === 0 ? (
                    <div className="rounded-2xl bg-[#171229] border border-white/10 p-10 md:p-14 text-center">
                        <h2 className="display-font text-2xl md:text-3xl font-black uppercase text-white">{t('emptyTitle')}</h2>
                        <p className="text-slate-300 mt-4 max-w-md mx-auto leading-relaxed font-sans">
                            {t('emptyText')}
                        </p>
                        <Link href="/store" className="inline-flex items-center gap-2 mt-8 bg-[#9d7cff] hover:bg-[#b59dff] text-[#0d0914] font-['Trebuchet_MS',sans-serif] font-black uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all duration-150">
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