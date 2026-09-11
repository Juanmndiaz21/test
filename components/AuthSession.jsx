'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AuthSession({ children }) {
    return (
        <SessionProvider>
            {children}
            <ToastContainer
                position="top-right"
                autoClose={7000}
                theme="dark"
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </SessionProvider>
    );
}