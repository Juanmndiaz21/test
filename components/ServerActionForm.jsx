'use client';

import { useTransition } from 'react';
import { toast } from '../utils/toast';

export default function ServerActionForm({ action, successMessage, errorMessage, className = '', children }) {
    const [, startTransition] = useTransition();

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
            try {
                await action(formData);
                toast.success(successMessage);
            } catch (error) {
                toast.error(error.message || errorMessage);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className={className}>
            {children}
        </form>
    );
}