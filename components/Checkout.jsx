'use client';
import { useActionState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '../store/useCartStore';
import { toast } from '../utils/toast';
import { recordDemoOrder } from '@/app/(public)/[locale]/checkout/actions';
import Icon from './Icon';

const initialState = { success: false, orderId: null, error: null };

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
    const t = useTranslations('checkout');
    const { cart, clearCart } = useCartStore();
    const [state, formAction, isPending] = useActionState(recordDemoOrder, initialState);

    useEffect(() => {
        if (state?.success) {
            toast.success(t('toastSuccess', { orderId: state.orderId }));
            clearCart();
        } else if (state?.error) {
            toast.error(state.error);
        }
    }, [state, clearCart, t]);

    if (cart.length === 0) return null;

    return (
        <div className="panel-surface p-6 rounded-2xl relative overflow-hidden">
            <h2 className="display-font text-2xl mb-2 uppercase relative z-10 text-slate-100">
                {t('infoTitle')}
            </h2>
            <p className="text-slate-400 text-sm mb-6 relative z-10">
                {t('infoText')}
            </p>

            <form action={formAction} className="space-y-4 relative z-10">
                <div>
                    <label htmlFor="checkout-name" className="block text-sm text-slate-400 mb-1">{t('nameLabel')}</label>
                    <input
                        id="checkout-name"
                        name="name"
                        type="text"
                        placeholder={t('namePlaceholder')}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none transition-colors"
                    />
                </div>
                <div>
                    <label htmlFor="checkout-email" className="block text-sm text-slate-400 mb-1">{t('emailLabel')}</label>
                    <input
                        id="checkout-email"
                        name="email"
                        type="email"
                        required
                        placeholder={t('emailPlaceholder')}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none transition-colors"
                    />
                </div>

                <input type="hidden" name="items" value={serializeCart(cart)} />

                <div className="space-y-3 pt-4">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full flex justify-center items-center gap-2 bg-lime-300 text-black font-black py-4 px-6 rounded-lg hover:bg-white disabled:bg-slate-700 transition-all"
                    >
                        {isPending ? (
                            <>
                                <span className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                                {t('placeInProgress')}
                            </>
                        ) : (
                            t('payPal')
                        )}
                    </button>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full flex justify-center items-center gap-2 bg-black/20 border border-white/10 text-white font-bold py-4 px-6 rounded-lg hover:border-lime-300/50 transition-all group disabled:opacity-60"
                    >
                        <Icon name="wallet" className="w-[18px] h-[18px] text-lime-300 group-hover:text-white transition-colors" />
                        {t('web3')}
                    </button>
                </div>
            </form>

            <div className="mt-6 flex items-center justify-center gap-6 relative z-10">
                <span className="text-xs text-slate-400">{t('demoModeNote')}</span>
            </div>
        </div>
    );
}