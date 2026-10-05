'use client';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '../store/useCartStore';
import { toast } from '../utils/toast';
import SwipeRow from './SwipeRow';
import { HugeiconsIcon } from '@hugeicons/react';
import { Archive02Icon, Delete02Icon } from '@hugeicons/core-free-icons';

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
        <div className="panel-surface p-6 rounded-2xl bg-zinc-900/70 border border-white/10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="display-font text-2xl uppercase text-zinc-100">{t('yourSelection')}</h2>
                    <p className="text-xs text-zinc-400 mt-1">{t('itemCount', { count: getItemCount() })}</p>
                </div>
                <button onClick={handleClear} className="text-xs text-rose-400 hover:text-white transition-colors cursor-pointer">
                    {t('clearList')}
                </button>
            </div>

            <ul className="space-y-3 mb-6">
                <AnimatePresence initial={false}>
                    {cart.map((item) => (
                        <SwipeRow
                            key={item.key}
                            actions={[
                                { id: 'delete', label: 'Delete', icon: <HugeiconsIcon icon={Delete02Icon} size={20} /> },
                                { id: 'archive', label: 'Archive', icon: <HugeiconsIcon icon={Archive02Icon} size={20} />, dismiss: true }
                            ]}
                            onAction={action => console.log(action.id)}
                            onCommit={action => handleRemove(item)}
                            actionColor="#e5484d"
                            drawerColor="#27272a"
                            rowColor="#18181b"
                            textColor="#f4f4f5"
                            radius={16}
                            actionWidth={80}
                            direction="left"
                            snapBounce={0.2}
                            resistance={0.55}
                            collapseMs={200}
                            commitAt={0.5}
                            fullSwipe
                            style={{ marginBottom: 8 }}
                        >
                            <div className="p-4 border border-white/10 rounded-2xl bg-zinc-950/60">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-zinc-200 break-words">{item.name}</p>
                                        </div>
                                        {Array.isArray(item.addons) && item.addons.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {item.addons.map((addon, aIdx) => (
                                                    <span
                                                        key={aIdx}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-mono"
                                                    >
                                                        <span className="text-emerald-400">✓</span> {addon}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-xs text-emerald-400 mt-2 font-mono">
                                            ${item.price} × {item.quantity} = <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(item)}
                                        aria-label={t('remove', { name: item.name })}
                                        className="shrink-0 text-zinc-500 hover:text-rose-400 p-1 font-bold text-sm cursor-pointer transition-colors"
                                        title="Click or swipe left to remove"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/10">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateQuantity(item.key, item.quantity - 1);
                                            }}
                                            aria-label={t('decreaseQuantity')}
                                            className="h-7 w-7 rounded-lg border border-white/10 text-white text-base font-black hover:border-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer"
                                        >
                                            −
                                        </button>
                                        <span className="w-7 text-center font-black text-white tabular-nums text-sm">{item.quantity}</span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateQuantity(item.key, item.quantity + 1);
                                            }}
                                            aria-label={t('increaseQuantity')}
                                            className="h-7 w-7 rounded-lg border border-white/10 text-white text-base font-black hover:border-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <strong className="font-bold text-emerald-400 font-mono text-sm">${(item.price * item.quantity).toFixed(2)}</strong>
                                </div>
                            </div>
                        </SwipeRow>
                    ))}
                </AnimatePresence>
            </ul>

            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <span className="text-zinc-400 uppercase text-sm font-bold">{t('estimatedTotal')}</span>
                <div className="text-right text-3xl font-black text-white">
                    ${getTotal().toFixed(2)} <span className="text-lg text-zinc-400 font-medium">{common('usd')}</span>
                </div>
            </div>
        </div>
    );
}