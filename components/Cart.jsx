'use client';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '../store/useCartStore';
import { toast } from '../utils/toast';

export default function Cart() {
    const { cart, getTotal, getItemCount, updateQuantity, removeFromCart, clearCart } = useCartStore();
    const t = useTranslations('cart');
    const common = useTranslations('common');
    const shouldReduceMotion = useReducedMotion();

    if (cart.length === 0) return null;

    const handleClear = () => {
        clearCart();
        toast.warning(t('clearList') || 'Cart cleared');
    };

    const handleRemove = (item) => {
        removeFromCart(item.key);
        toast.info(t('remove', { name: item.name }) || `Removed ${item.name}`);
    };

    return (
        <div className="panel-surface p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="display-font text-2xl uppercase text-slate-200">{t('yourSelection')}</h2>
                    <p className="text-xs text-slate-400 mt-1">{t('itemCount', { count: getItemCount() })}</p>
                </div>
                <button onClick={handleClear} className="text-xs text-red-300 hover:text-white transition-colors cursor-pointer">
                    {t('clearList')}
                </button>
            </div>

            <ul className="space-y-4 mb-6">
                <AnimatePresence initial={false}>
                    {cart.map((item) => (
                        <motion.li
                            key={item.key}
                            layout={!shouldReduceMotion}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{
                                opacity: 0,
                                scale: shouldReduceMotion ? 1 : 0.96,
                                transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] },
                            }}
                            className="bg-black/20 p-4 rounded-lg border border-white/10"
                        >
                        <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0">
                                <p className="font-medium text-slate-200 break-words">{item.name}</p>
                                {Array.isArray(item.addons) && item.addons.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {item.addons.map((addon, aIdx) => (
                                            <span
                                                key={aIdx}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#9d7cff]/15 border border-[#9d7cff]/30 text-[#c8b4ff] text-[11px] font-mono"
                                            >
                                                <span className="text-[#9d7cff]">✓</span> {addon}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-[#9d7cff] mt-2 font-mono">
                                    ${item.price} × {item.quantity} = <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                                </p>
                            </div>
                            <button onClick={() => handleRemove(item)} aria-label={t('remove', { name: item.name })} className="shrink-0 text-red-400 hover:text-red-300 font-bold text-sm cursor-pointer">
                                ×
                            </button>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => updateQuantity(item.key, item.quantity - 1)}
                                    aria-label={t('decreaseQuantity')}
                                    className="h-8 w-8 rounded-lg border border-white/10 text-white text-lg font-black hover:border-[#9d7cff] hover:text-[#9d7cff] transition-colors"
                                >
                                    −
                                </button>
                                <span className="w-8 text-center font-black text-white tabular-nums">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.key, item.quantity + 1)}
                                    aria-label={t('increaseQuantity')}
                                    className="h-8 w-8 rounded-lg border border-white/10 text-white text-lg font-black hover:border-[#9d7cff] hover:text-[#9d7cff] transition-colors"
                                >
                                    +
                                </button>
                            </div>
                            <strong className="font-bold text-[#9d7cff] font-mono">${(item.price * item.quantity).toFixed(2)}</strong>
                        </div>
                    </motion.li>
                ))}
                </AnimatePresence>
            </ul>

            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <span className="text-slate-400 uppercase text-sm font-bold">{t('estimatedTotal')}</span>
                <div className="text-right text-3xl font-black text-white">
                    ${getTotal().toFixed(2)} <span className="text-lg text-slate-400 font-medium">{common('usd')}</span>
                </div>
            </div>
        </div>
    );
}