'use client';

import { useToastStore } from '../store/useToastStore';
import SwipeToast from './SwipeToast';

export default function ToastViewport() {
    const toasts = useToastStore((state) => state.toasts);
    const dismiss = useToastStore((state) => state.dismiss);

    if (toasts.length === 0) return null;

    return (
        <aside
            aria-label="Notifications"
            className="fixed top-20 right-4 sm:right-6 z-[100] flex flex-col gap-2.5 pointer-events-none w-[calc(100vw-2rem)] sm:w-[360px]"
        >
            {toasts.map((item) => {
                const fuseColor =
                    item.type === 'error'
                        ? '#ef4444'
                        : item.type === 'warning'
                        ? '#f59e0b'
                        : item.type === 'success'
                        ? '#10b981'
                        : '#059669';

                const defaultTitle =
                    item.title ||
                    (item.type === 'error'
                        ? 'Error'
                        : item.type === 'success'
                        ? 'Success'
                        : item.type === 'warning'
                        ? 'Warning'
                        : 'Notice');

                return (
                    <SwipeToast
                        key={item.id}
                        open={true}
                        onClose={() => dismiss(item.id)}
                        title={defaultTitle}
                        description={item.message}
                        actionLabel={item.actionLabel}
                        onAction={item.onAction}
                        background="#18181b"
                        color="#f4f4f5"
                        fuseColor={fuseColor}
                        width="100%"
                        radius={14}
                        slideMs={400}
                        settleBounce={0.2}
                        swipeDistance={40}
                        duration={item.duration || 4000}
                        fuse="bottom"
                        pauseOnHover
                        closeButton
                    />
                );
            })}
        </aside>
    );
}