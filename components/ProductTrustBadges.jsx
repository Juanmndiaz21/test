'use client';

import Icon from './Icon';

const BADGES = [
    {
        title: 'Money-Back Guarantee',
        description: 'Covered by our refund policy',
        icon: 'shield-check',
    },
    {
        title: 'Secure checkout',
        description: 'Encrypted payments',
        icon: 'lock',
    },
    {
        title: 'Fast start',
        description: 'Quick order review',
        icon: 'bolt',
    },
    {
        title: '24/7 support',
        description: 'Before and after delivery',
        icon: 'headphones',
    },
];

export default function ProductTrustBadges() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6">
            {BADGES.map((item, index) => {
                return (
                    <div
                        key={index}
                        className="rounded-2xl p-4 border border-white/10 bg-zinc-900 flex items-center gap-3.5 hover:border-emerald-500/40 transition-colors"
                    >
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
                            <Icon icon={item.icon} className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <strong className="block text-white text-sm font-bold leading-tight">
                                {item.title}
                            </strong>
                            <span className="block text-xs text-zinc-400 mt-1 leading-tight">
                                {item.description}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
