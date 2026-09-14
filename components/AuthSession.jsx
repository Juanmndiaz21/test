'use client';

import { SessionProvider } from 'next-auth/react';
import ToastViewport from './ToastViewport';

export default function AuthSession({ children }) {
    return (
        <SessionProvider>
            {children}
            <ToastViewport />
        </SessionProvider>
    );
}