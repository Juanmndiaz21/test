'use client';

function ShieldCheckIcon({ className = 'w-5 h-5' }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}

function ShieldLockIcon({ className = 'w-5 h-5' }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <rect x="9" y="11" width="6" height="5" rx="1" />
            <path d="M10 11V9a2 2 0 1 1 4 0v2" />
        </svg>
    );
}

function LightningIcon({ className = 'w-5 h-5' }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
    );
}

function SupportChatIcon({ className = 'w-5 h-5' }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}

const BADGES = [
    {
        title: 'Money-Back Guarantee',
        description: 'Covered by our refund policy',
        icon: ShieldCheckIcon,
    },
    {
        title: 'Secure checkout',
        description: 'Encrypted payments',
        icon: ShieldLockIcon,
    },
    {
        title: 'Fast start',
        description: 'Quick order review',
        icon: LightningIcon,
    },
    {
        title: '24/7 support',
        description: 'Before and after delivery',
        icon: SupportChatIcon,
    },
];

export default function ProductTrustBadges() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6">
            {BADGES.map((item, index) => {
                const IconComponent = item.icon;
                return (
                    <div
                        key={index}
                        className="panel-surface rounded-2xl p-4 border border-white/10 bg-[#171229] flex items-center gap-3.5 hover:border-[#9d7cff]/40 transition-colors"
                    >
                        <div className="w-11 h-11 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/20 flex items-center justify-center text-[#9d7cff] shrink-0 shadow-[0_0_12px_rgba(157,124,255,0.15)]">
                            <IconComponent className="w-5 h-5" />
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

