'use client';

import { Icon } from '@iconify/react';

const BADGES = [
    {
        title: 'Money-Back Guarantee',
        description: 'Covered by our refund policy',
        icon: 'solar:shield-check-bold-duotone',
    },
    {
        title: 'Secure checkout',
        description: 'Encrypted payments',
        icon: 'solar:lock-password-bold-duotone',
    },
    {
        title: 'Fast start',
        description: 'Quick order review',
        icon: 'solar:bolt-bold-duotone',
    },
    {
        title: '24/7 support',
        description: 'Before and after delivery',
        icon: 'solar:headphones-round-sound-bold-duotone',
    },
];

export default function ProductTrustBadges() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6">
            {BADGES.map((item, index) => {
                return (
                    <div
                        key={index}
                        className="panel-surface rounded-2xl p-4 border border-white/10 bg-[#171229] flex items-center gap-3.5 hover:border-[#9d7cff]/40 transition-colors"
                    >
                        <div className="w-11 h-11 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/20 flex items-center justify-center text-[#9d7cff] shrink-0 shadow-sm">
                            <Icon icon={item.icon} className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <strong className="block text-white text-sm font-bold leading-tight">
                                {item.title}
                            </strong>
                            <span className="block text-xs text-slate-400 mt-1 leading-tight">
                                {item.description}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
