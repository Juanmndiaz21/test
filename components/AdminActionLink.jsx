'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function AdminActionLink({ game }) {
    const { data: session, status } = useSession();

    if (status !== 'authenticated' || !session?.user) return null;

    return (
        <Link href={`/admin/products?game=${encodeURIComponent(game)}`} className="bg-lime-300 hover:bg-white text-black font-black px-5 py-3 rounded-lg transition-colors">
            + Add service to {game}
        </Link>
    );
}