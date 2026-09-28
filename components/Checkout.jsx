'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useCartStore } from '../store/useCartStore';
import { toast } from '../utils/toast';
import { recordDemoOrder, validateCouponAction, getActivePaymentMethodsAction } from '@/app/(public)/[locale]/checkout/actions';
import Icon from './Icon';

const initialState = { success: false, orderId: null, redirectUrl: null, error: null };

function serializeCart(cart) {
    return JSON.stringify(
        cart.map((item) => ({
            id: item.id ?? null,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            platform: item.platform || null,
            boost_amount: item.boost_amount || null,
            game: item.game || item.name || null,
            edition: item.edition || null,
            package: item.package || null,
            addons: Array.isArray(item.addons) ? item.addons : [],
        }))
    );
}

export default function Checkout() {
    const { data: session } = useSession();
    const t = useTranslations('checkout');
    const router = useRouter();
    const { cart, getTotal, clearCart } = useCartStore();

    const [activeMethods, setActiveMethods] = useState({
        stripe: true,
        paypal: true,
        crypto: true,
        crypto_discord: true,
        crypto_discord_title: 'Crypto / Binance Pay (Discord Ticket)',
        crypto_discord_instructions: 'Upon placing your order, your purchase code will be generated. Please open a ticket on our Discord server and share your code to receive payment details (Binance Pay / USDT) and activate your service instantly.',
        crypto_discord_url: 'https://discord.gg/qwyQjn4Aqx',
    });
    const [paymentMethod, setPaymentMethod] = useState('paypal');
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState(null);
    const [isCheckingCoupon, startCheckingCoupon] = useTransition();

    const [state, formAction, isPending] = useActionState(recordDemoOrder, initialState);

    useEffect(() => {
        let isSubscribed = true;
        getActivePaymentMethodsAction()
            .then((methods) => {
                if (!isSubscribed || !methods) return;
                setActiveMethods(methods);
                setPaymentMethod((prev) => {
                    if (methods[prev]) return prev;
                    if (methods.paypal) return 'paypal';
                    if (methods.crypto_discord) return 'crypto_discord';
                    if (methods.stripe) return 'stripe';
                    if (methods.crypto) return 'crypto';
                    return prev;
                });
            })
            .catch(() => {});
        return () => {
            isSubscribed = false;
        };
    }, []);

    const subtotal = getTotal();
    const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const finalTotal = Math.max(0, subtotal - discountAmount);

    useEffect(() => {
        if (state?.success) {
            if (state.redirectUrl) {
                toast.info(t('redirectingToStripe'));
                window.location.href = state.redirectUrl;
                return;
            }
            toast.success(t('toastSuccess', { orderId: state.orderId }));
            clearCart();
            router.push(`/checkout/success?order_id=${state.orderId}${state.orderCode ? `&order_code=${state.orderCode}` : ''}`);
        } else if (state?.error) {
            toast.error(state.error);
        }
    }, [state, clearCart, router, t]);

    const handleApplyCoupon = (e) => {
        if (e) e.preventDefault();
        const code = couponInput.trim();
        if (!code) {
            setCouponError(t('couponPlaceholder'));
            return;
        }

        setCouponError(null);
        startCheckingCoupon(async () => {
            const res = await validateCouponAction(code, serializeCart(cart));
            if (res.success && res.coupon) {
                setAppliedCoupon(res.coupon);
                setCouponError(null);
                toast.success(t('couponApplied', { code: res.coupon.code }));
                const errorMsg = res.error || t('invalidCoupon');
                setCouponError(errorMsg);
                toast.error(errorMsg);
            }
        });
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponInput('');
        setCouponError(null);
    };

    if (cart.length === 0) return null;

    return (
        <div className="panel-surface p-6 sm:p-8 rounded-2xl relative overflow-hidden border border-white/10">
            <div className="flex items-center gap-3 mb-2">
                <span className="h-2 w-2 rounded-full bg-[#9d7cff] animate-pulse" />
                <h2 className="display-font text-2xl uppercase tracking-wider text-slate-100">
                    {t('infoTitle')}
                </h2>
            </div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                {t('infoText')}
            </p>

            <form action={formAction} className="space-y-6 relative z-10">
                {/* Contact Information */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="checkout-name" className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                            {t('nameLabel')}
                        </label>
                        <input
                            id="checkout-name"
                            name="name"
                            type="text"
                            placeholder={t('namePlaceholder')}
                            className="w-full bg-[#120e1c]/80 border border-white/10 rounded-lg p-3 text-white placeholder-slate-500 focus:border-[#9d7cff] outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label htmlFor="checkout-email" className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                            {t('emailLabel')} <span className="text-[#9d7cff]">*</span>
                        </label>
                        <input
                            key={session?.user?.email || 'anon'}
                            id="checkout-email"
                            name="email"
                            type="email"
                            required
                            defaultValue={session?.user?.email || ''}
                            placeholder={t('emailPlaceholder')}
                            className="w-full bg-[#120e1c]/80 border border-white/10 rounded-lg p-3 text-white placeholder-slate-500 focus:border-[#9d7cff] outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Discount Coupon Section */}
                <div className="pt-2 border-t border-white/10">
                    <label htmlFor="checkout-coupon-input" className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-2">
                        {t('couponLabel')}
                    </label>

                    {!appliedCoupon ? (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Icon
                                        name="tag"
                                        className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                    />
                                    <input
                                        id="checkout-coupon-input"
                                        type="text"
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleApplyCoupon();
                                            }
                                        }}
                                        placeholder={t('couponPlaceholder')}
                                        className="w-full bg-[#120e1c]/80 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-slate-500 text-sm focus:border-[#9d7cff] uppercase font-mono tracking-wider outline-none transition-colors"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleApplyCoupon}
                                    disabled={isCheckingCoupon || !couponInput.trim()}
                                    className="px-4 py-2.5 rounded-lg bg-[#9d7cff]/20 border border-[#9d7cff]/40 text-[#c8b4ff] hover:bg-[#9d7cff]/30 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                >
                                    {isCheckingCoupon ? (
                                        <>
                                            <span className="h-3 w-3 rounded-full border-2 border-[#9d7cff]/40 border-t-[#9d7cff] animate-spin" />
                                            {t('applyingCoupon')}
                                        </>
                                    ) : (
                                        t('applyCoupon')
                                    )}
                                </button>
                            </div>
                            {couponError && (
                                <p className="text-xs text-rose-400 font-medium pl-1 flex items-center gap-1">
                                    <Icon name="alert-circle" className="w-3.5 h-3.5 shrink-0" />
                                    {couponError}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-[#9d7cff]/10 border border-[#9d7cff]/40">
                            <div className="flex items-center gap-2.5">
                                <span className="p-1 rounded-md bg-[#9d7cff]/20 text-[#9d7cff]">
                                    <Icon name="tag" className="w-4 h-4" />
                                </span>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-white text-sm">
                                            {appliedCoupon.code}
                                        </span>
                                        <span className="text-[11px] font-semibold text-[#c8b4ff] bg-[#9d7cff]/20 px-2 py-0.5 rounded-full">
                                            {appliedCoupon.discountType === 'percentage'
                                                ? `-${appliedCoupon.discountValue}%`
                                                : `-$${appliedCoupon.discountValue}`}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#c8b4ff]/80">
                                        You save: <span className="font-bold font-mono">-${appliedCoupon.discountAmount.toFixed(2)} USD</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleRemoveCoupon}
                                className="text-slate-400 hover:text-rose-400 p-1 rounded-md hover:bg-white/5 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                title={t('removeCoupon')}
                            >
                                <Icon name="x" className="w-4 h-4" />
                                <span className="sr-only sm:not-sr-only">{t('removeCoupon')}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Payment Gateway Selector */}
                <div className="pt-2 border-t border-white/10">
                    <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-3">
                        {t('paymentMethod')}
                    </label>

                    {([activeMethods.stripe, activeMethods.paypal, activeMethods.crypto, activeMethods.crypto_discord].filter(Boolean).length === 0) ? (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
                            Payment processing is temporarily offline. Please contact support.
                        </div>
                    ) : (
                        <div className={`grid gap-2.5 ${
                            [activeMethods.stripe, activeMethods.paypal, activeMethods.crypto, activeMethods.crypto_discord].filter(Boolean).length === 1
                                ? 'grid-cols-1'
                                : [activeMethods.stripe, activeMethods.paypal, activeMethods.crypto, activeMethods.crypto_discord].filter(Boolean).length === 2
                                ? 'grid-cols-1 sm:grid-cols-2'
                                : [activeMethods.stripe, activeMethods.paypal, activeMethods.crypto, activeMethods.crypto_discord].filter(Boolean).length === 3
                                ? 'grid-cols-1 sm:grid-cols-3'
                                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                        }`}>
                            {/* 1. Stripe Card */}
                            {activeMethods.stripe && (
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('stripe')}
                                    className={`p-3.5 rounded-xl border text-left transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out relative flex flex-col justify-between ${
                                        paymentMethod === 'stripe'
                                            ? 'bg-[#9d7cff]/15 border-[#9d7cff] shadow-[0_0_15px_rgba(157,124,255,0.15)] text-white'
                                            : 'bg-[#120e1c]/50 border-white/10 hover:border-white/20 text-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold flex items-center gap-1.5">
                                            <Icon name="shield" className="w-4 h-4 text-[#9d7cff]" />
                                            Card
                                        </span>
                                        {paymentMethod === 'stripe' && (
                                            <span className="h-2 w-2 rounded-full bg-[#9d7cff]" />
                                        )}
                                    </div>
                                    <span className="text-[11px] text-slate-400">
                                        Stripe · Apple Pay · Cards
                                    </span>
                                </button>
                            )}

                            {/* 2. PayPal */}
                            {activeMethods.paypal && (
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('paypal')}
                                    className={`p-3.5 rounded-xl border text-left transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out relative flex flex-col justify-between ${
                                        paymentMethod === 'paypal'
                                            ? 'bg-[#9d7cff]/15 border-[#9d7cff] shadow-[0_0_15px_rgba(157,124,255,0.15)] text-white'
                                            : 'bg-[#120e1c]/50 border-white/10 hover:border-white/20 text-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold flex items-center gap-1.5">
                                            <span className="font-serif italic font-black text-sky-400">P</span>
                                            PayPal
                                        </span>
                                        {paymentMethod === 'paypal' && (
                                            <span className="h-2 w-2 rounded-full bg-[#9d7cff]" />
                                        )}
                                    </div>
                                    <span className="text-[11px] text-slate-400">
                                        Balance & Cards
                                    </span>
                                </button>
                            )}

                            {/* 3. Original Web3 / Crypto */}
                            {activeMethods.crypto && (
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('crypto')}
                                    className={`p-3.5 rounded-xl border text-left transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out relative flex flex-col justify-between ${
                                        paymentMethod === 'crypto'
                                            ? 'bg-[#9d7cff]/15 border-[#9d7cff] shadow-[0_0_15px_rgba(157,124,255,0.15)] text-white'
                                            : 'bg-[#120e1c]/50 border-white/10 hover:border-white/20 text-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold flex items-center gap-1.5">
                                            <Icon name="wallet" className="w-4 h-4 text-emerald-400" />
                                            Web3 / Crypto
                                        </span>
                                        {paymentMethod === 'crypto' && (
                                            <span className="h-2 w-2 rounded-full bg-[#9d7cff]" />
                                        )}
                                    </div>
                                    <span className="text-[11px] text-slate-400">
                                        USDT · BTC · ETH
                                    </span>
                                </button>
                            )}

                            {/* 4. NEW: Crypto (Discord Ticket / Binance Pay) - Wallet Icon */}
                            {activeMethods.crypto_discord && (
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('crypto_discord')}
                                    className={`p-3.5 rounded-xl border text-left transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out relative flex flex-col justify-between ${
                                        paymentMethod === 'crypto_discord'
                                            ? 'bg-[#9d7cff]/15 border-[#9d7cff] shadow-[0_0_15px_rgba(157,124,255,0.15)] text-white'
                                            : 'bg-[#120e1c]/50 border-white/10 hover:border-white/20 text-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold flex items-center gap-1.5">
                                            <Icon name="wallet" className="w-4 h-4 text-amber-400" />
                                            <span className="truncate">{activeMethods.crypto_discord_title || 'Binance Pay'}</span>
                                        </span>
                                        {paymentMethod === 'crypto_discord' && (
                                            <span className="h-2 w-2 rounded-full bg-[#9d7cff]" />
                                        )}
                                    </div>
                                    <span className="text-[11px] text-slate-400">
                                        Discord Ticket
                                    </span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Discord Ticket Notice for Crypto Discord */}
                    {paymentMethod === 'crypto_discord' && activeMethods.crypto_discord && (
                        <div className="mt-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-200">
                            <div className="flex items-center gap-2 text-white font-bold mb-1.5">
                                <Icon name="wallet" className="w-4 h-4 text-amber-400" />
                                <span>{activeMethods.crypto_discord_title || 'Crypto / Binance Pay (Discord Ticket)'}</span>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-[11px] mb-2.5">
                                {activeMethods.crypto_discord_instructions || 'Upon placing your order, your purchase code will be generated. Please open a ticket on our Discord server and share your code to receive payment details (Binance Pay / USDT) and activate your service instantly.'}
                            </p>
                            <a
                                href={activeMethods.crypto_discord_url || 'https://discord.gg/qwyQjn4Aqx'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-[#9d7cff] font-bold hover:underline"
                            >
                                <Icon name="discord" className="w-3.5 h-3.5 text-[#5865F2]" />
                                Open Discord Server →
                            </a>
                        </div>
                    )}
                </div>

                {/* Pricing Breakdown Summary */}
                <div className="p-4 rounded-xl bg-[#120e1c]/60 border border-white/10 space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>{t('subtotalLabel')}</span>
                        <span className="font-mono text-slate-200">${subtotal.toFixed(2)}</span>
                    </div>

                    {appliedCoupon && (
                        <div className="flex justify-between items-center text-xs text-[#9d7cff]">
                            <span className="flex items-center gap-1">
                                <Icon name="tag" className="w-3 h-3" />
                                {t('discountLabel')} ({appliedCoupon.code})
                            </span>
                            <span className="font-mono font-bold">-${discountAmount.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                        <span className="text-sm uppercase font-bold text-white tracking-wider">
                            {t('totalToPay')}
                        </span>
                        <div className="text-right">
                            <span className="font-mono text-2xl font-black text-white">
                                ${finalTotal.toFixed(2)}
                            </span>
                            <span className="ml-1 text-xs text-slate-400 font-sans">USD</span>
                        </div>
                    </div>
                </div>

                {/* Hidden form fields */}
                <input type="hidden" name="items" value={serializeCart(cart)} />
                <input type="hidden" name="payment_method" value={paymentMethod} />
                <input type="hidden" name="coupon_code" value={appliedCoupon ? appliedCoupon.code : ''} />

                {/* Submit Payment Button */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full flex justify-center items-center gap-2.5 bg-[#9d7cff] text-[#120e1c] font-black text-base uppercase tracking-wider py-4 px-6 rounded-xl hover:bg-[#8b63fc] hover:shadow-[0_0_25px_rgba(157,124,255,0.4)] disabled:opacity-60 disabled:cursor-not-allowed transition-[background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.98]"
                    >
                        {isPending ? (
                            <>
                                <span className="h-4 w-4 rounded-full border-2 border-[#120e1c]/40 border-t-[#120e1c] animate-spin" />
                                {t('placeInProgress')}
                            </>
                        ) : paymentMethod === 'stripe' ? (
                            <>
                                <Icon name="shield" className="w-5 h-5 text-[#120e1c]" />
                                {t('payWithCard')} · ${finalTotal.toFixed(2)}
                            </>
                        ) : paymentMethod === 'paypal' ? (
                            <>
                                <span className="font-serif italic font-black text-lg">P</span>
                                {t('payWithPayPal')} · ${finalTotal.toFixed(2)}
                            </>
                        ) : paymentMethod === 'crypto' ? (
                            <>
                                <Icon name="wallet" className="w-5 h-5 text-[#120e1c]" />
                                {t('payWithCrypto')} · ${finalTotal.toFixed(2)}
                            </>
                        ) : (
                            <>
                                <Icon name="wallet" className="w-5 h-5 text-[#120e1c]" />
                                Pay with Crypto (Discord Ticket) · ${finalTotal.toFixed(2)}
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-5 text-center relative z-10">
                <span className="text-[11px] text-slate-400 block leading-tight">
                    {t('stripeSandboxNotice')}
                </span>
            </div>
        </div>
    );
}