'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '../../components/Icon';
import AdminNotifications from '../../components/AdminNotifications';

const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
    { href: '/admin/orders', label: 'Boosting orders', icon: 'clipboard' },
    { href: '/admin/products', label: 'Service catalog', icon: 'box' },
    { href: '/admin/users', label: 'Users & roles', icon: 'users' },
    { href: '/admin/help', label: 'Edit help', icon: 'circle-help' },
];

export default function AdminNav({ email, role }) {
    const pathname = usePathname();

    return (
        <>
<div className="flex items-center justify-between mb-8">
                <div className="display-font text-xl text-lime-300">
                    CONTROL ROOM
                </div>
                <AdminNotifications />
            </div>

            <div className="text-xs text-slate-400 mb-4 bg-[#171229] p-2 rounded border border-lime-300/10 space-y-1">
                <p>Admin: {email}</p>
                <p className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-lime-300" />
                    <span className="font-bold text-lime-300 uppercase tracking-wider">Role · {role || '—'}</span>
                </p>
            </div>

            <nav className="flex flex-col gap-1 font-medium">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                                isActive
                                    ? 'bg-lime-300 text-black font-black'
                                    : 'text-slate-200 hover:text-lime-300'
                            }`}
                        >
                            <Icon name={item.icon} className="w-4 h-4 shrink-0" />
                            {item.label}
                        </Link>
                    );
                })}

                <Link href="/" className="flex items-center gap-3 text-slate-400 hover:text-slate-300 mt-8 text-sm">
                    <Icon name="store" className="w-4 h-4 shrink-0" />
                    Back to the store
                </Link>
            </nav>
        </>
    );
}