'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCartStore } from '@/store/useCartStore';
import PageHeaderBanner from '@/components/PageHeaderBanner';
import Icon from '@/components/Icon';
import { toast } from '@/utils/toast';
import { capturePayPalPaymentAction } from '../actions';

export default function CheckoutSuccessPage({ searchParams }) {
    const t = useTranslations('checkout');
    const clearCart = useCartStore((state) => state.clearCart);
    const [copied, setCopied] = useState(false);

    const resolvedParams = use(searchParams);
    const orderId = resolvedParams?.order_id || null;
    const orderCode = resolvedParams?.order_code || null;
    const provider = resolvedParams?.provider || null;
    const token = resolvedParams?.token || null;

    useEffect(() => {
        clearCart();

        if (provider === 'paypal' && token && orderId) {
            capturePayPalPaymentAction({
                orderId: Number(orderId),
                paypalOrderId: token,
            }).catch((err) => {
                console.error('PayPal capture on success page error:', err);
            });
        }
    }, [clearCart, provider, token, orderId]);

    const handleCopy = () => {
        if (!orderCode) return;
        navigator.clipboard.writeText(orderCode);
        setCopied(true);
        toast.success(t('codeCopied'));
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <div className="min-h-screen bg-[#120e1c] text-slate-100 pb-20">
            <PageHeaderBanner
                title={t('successTitle')}
                subtitle={t('successSubtitle')}
                maxWidth="max-w-4xl"
            />

            <div className="max-w-3xl mx-auto px-5 py-12">
                <div className="panel-surface p-8 sm:p-12 rounded-2xl border border-[#9d7cff]/30 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#9d7cff]/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="mx-auto w-16 h-16 rounded-full bg-[#9d7cff]/20 border border-[#9d7cff]/40 flex items-center justify-center text-[#c8b4ff] mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h2 className="display-font text-3xl font-black uppercase text-white mb-3">
                        {t('orderConfirmed')}
                    </h2>

                    {orderId && (
                        <p className="font-mono text-slate-400 text-sm mb-4">
                            ID: #{orderId}
                        </p>
                    )}

                    {orderCode && (
                        <div className="my-6 max-w-md mx-auto p-4 sm:p-5 rounded-xl bg-black/40 border border-[#9d7cff]/40 shadow-[0_0_20px_rgba(157,124,255,0.15)]">
                            <span className="text-xs uppercase font-mono tracking-widest text-[#9d7cff] block mb-1.5 font-bold">
                                {t('orderCodeLabel')}
                            </span>
                            <div className="flex items-center justify-center gap-3">
                                <span className="font-mono text-2xl sm:text-3xl font-black tracking-wider text-white">
                                    {orderCode}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-[#9d7cff]/20 text-[#9d7cff] transition-colors border border-white/10"
                                    title={t('copyCode')}
                                    aria-label={t('copyCode')}
                                >
                                    <Icon name={copied ? 'check' : 'copy'} className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                {t('orderCodeHelp')}
                            </p>
                        </div>
                    )}

                    <p className="text-slate-300 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                        {t('successNote')}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                        {orderCode ? (
                            <Link
                                href={`/track?code=${encodeURIComponent(orderCode)}`}
                                className="w-full flex items-center justify-center gap-2 bg-[#9d7cff] hover:bg-[#8b63fc] text-[#120e1c] font-black uppercase py-3.5 px-6 rounded-lg transition-all"
                            >
                                <Icon name="search" className="w-4 h-4" />
                                {t('trackOrder')}
                            </Link>
                        ) : (
                            <Link
                                href="/store"
                                className="w-full flex items-center justify-center gap-2 bg-[#9d7cff] hover:bg-[#8b63fc] text-[#120e1c] font-black uppercase py-3.5 px-6 rounded-lg transition-all"
                            >
                                {t('backToStore')}
                            </Link>
                        )}
                        <Link
                            href="/store"
                            className="w-full flex items-center justify-center gap-2 bg-black/30 border border-white/10 hover:border-[#9d7cff]/50 text-white font-bold py-3.5 px-6 rounded-lg transition-all"
                        >
                            {t('backToStore')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
