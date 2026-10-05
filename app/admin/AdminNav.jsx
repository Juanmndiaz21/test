'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Icon from '../../components/Icon';

const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
    { href: '/admin/products', label: 'Products', icon: 'box' },
    { href: '/admin/categories', label: 'Categories / Games', icon: 'gamepad' },
    { href: '/admin/orders', label: 'Orders', icon: 'clipboard' },
    { href: '/admin/reviews', label: 'Reviews', icon: 'star' },
    { href: '/admin/users', label: 'Users', icon: 'users' },
    { href: '/admin/help', label: 'Help / FAQs', icon: 'circle-help' },
    { href: '/admin/blog', label: 'Blog & Guides', icon: 'book' },
    { href: '/admin/contact', label: 'Contact Messages', icon: 'mail' },
    { href: '/admin/settings', label: 'Payment Methods', icon: 'sliders' },
];

export default function AdminNav({ session }) {
    const pathname = usePathname();
    const email = session?.user?.email;
    const role = session?.user?.role;

    return (
        <>
            <div className="text-xs text-slate-400 mb-4 bg-zinc-900 p-2.5 rounded-xl border border-white/10 space-y-1">
                <p className="truncate text-slate-300 font-medium">Admin: {email}</p>
                <p className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#9225CF]" />
                    <span className="font-bold text-purple-400 uppercase tracking-wider text-[11px] font-mono">Role · {role || '—'}</span>
                </p>
            </div>

            <nav className="flex flex-col gap-1 font-medium">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                                isActive
                                    ? 'bg-[#9225CF] text-white font-bold shadow-[0_4px_12px_rgba(146,37,207,0.35)]'
                                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Icon name={item.icon} className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    );
                })}

                <Link href="/" className="flex items-center gap-3 text-slate-400 hover:text-purple-400 mt-8 text-sm px-3 py-2 transition-colors">
                    <Icon name="store" className="w-4 h-4 shrink-0" />
                    Back to the store
                </Link>
            </nav>
        </>
    );
}