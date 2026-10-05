'use client';

import React from 'react';
import SignupFormDemo from '@/components/SignupForm';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-5 bg-zinc-950">
            <SignupFormDemo onSwitchToLogin={() => router.push('/login')} />
        </div>
    );
}
