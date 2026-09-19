'use client';

import { useState, useEffect, useRef } from 'react';
import { useToastStore } from '../store/useToastStore';
import Icon from './Icon';

const CONFIG = {
    success: {
        icon: 'check-circle',
        title: 'Success',
        accentText: 'text-lime-300',
        badgeBg: 'bg-lime-300/15 border-lime-300/30 text-lime-300',
        cardBorder: 'border-lime-300/30 hover:border-lime-300/60',
        sideBar: 'bg-lime-300',
        progress: 'bg-gradient-to-r from-lime-300 to-purple-400',
        glow: 'shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_24px_rgba(157,124,255,0.25)]',
    },
    error: {
        icon: 'alert-circle',
        title: 'Error',
        accentText: 'text-red-400',
        badgeBg: 'bg-red-500/15 border-red-500/30 text-red-400',
        cardBorder: 'border-red-500/30 hover:border-red-500/60',
        sideBar: 'bg-red-400',
        progress: 'bg-gradient-to-r from-red-500 to-rose-400',
        glow: 'shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_24px_rgba(239,68,68,0.2)]',
    },
    warning: {
        icon: 'alert-triangle',
        title: 'Warning',
        accentText: 'text-amber-300',
        badgeBg: 'bg-amber-400/15 border-amber-400/30 text-amber-300',
        cardBorder: 'border-amber-400/30 hover:border-amber-400/60',
        sideBar: 'bg-amber-400',
        progress: 'bg-gradient-to-r from-amber-400 to-yellow-300',
        glow: 'shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_24px_rgba(251,191,36,0.2)]',
    },
    info: {
        icon: 'info',
        title: 'Notice',
        accentText: 'text-sky-300',
        badgeBg: 'bg-sky-400/15 border-sky-400/30 text-sky-300',
        cardBorder: 'border-sky-400/30 hover:border-sky-400/60',
        sideBar: 'bg-sky-400',
        progress: 'bg-gradient-to-r from-sky-400 to-indigo-400',
        glow: 'shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_24px_rgba(56,189,248,0.2)]',
    },
};

function ToastItem({ toast, onDismiss }) {
    const [isHovered, setIsHovered] = useState(false);
    const duration = toast.duration || 5000;
    const remainingRef = useRef(duration);
    const startRef = useRef(Date.now());
    const timerRef = useRef(null);

    const typeConfig = CONFIG[toast.type] || CONFIG.info;

    const startTimer = () => {
        startRef.current = Date.now();
        timerRef.current = setTimeout(() => {
            onDismiss(toast.id);
        }, remainingRef.current);
    };

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startRef.current));
    };

    useEffect(() => {
        startTimer();
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [toast.id]);

    const handleMouseEnter = () => {
        setIsHovered(true);
        clearTimer();
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (remainingRef.current > 0) {
            startTimer();
        } else {
            onDismiss(toast.id);
        }
    };

    return (
        <div
            role="status"
            aria-live="polite"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`pointer-events-auto relative w-full overflow-hidden rounded-xl border bg-[#171229]/95 backdrop-blur-xl transition-all duration-300 ${typeConfig.cardBorder} ${typeConfig.glow} ${
                toast.leaving ? 'animate-toast-out' : 'animate-toast-in'
            }`}
        >
            {/* Left accent bar */}
            <span className={`absolute inset-y-0 left-0 w-1.5 ${typeConfig.sideBar}`} aria-hidden="true" />

            <div className="flex items-start gap-3.5 p-4 pl-4.5 pb-4.5">
                {/* Icon badge */}
                <div className={`shrink-0 h-9 w-9 rounded-xl border flex items-center justify-center ${typeConfig.badgeBg}`}>
                    <Icon name={typeConfig.icon} className="w-4.5 h-4.5" strokeWidth={2.4} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-black uppercase tracking-widest ${typeConfig.accentText}`}>
                            {toast.title || typeConfig.title}
                        </span>
                    </div>
                    <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-200 leading-snug break-words">
                        {toast.message}
                    </p>
                </div>

                {/* Close Button */}
                <button
                    type="button"
                    onClick={() => onDismiss(toast.id)}
                    aria-label="Dismiss notification"
                    className="shrink-0 -mr-1 -mt-1 h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <Icon name="x" className="w-4 h-4" />
                </button>
            </div>

            {/* Bottom Progress Bar (Toastify Signature) */}
            {!toast.leaving && (
                <div className="absolute bottom-0 inset-x-0 h-1 bg-white/5 overflow-hidden">
                    <span
                        className={`block h-full w-full ${typeConfig.progress}`}
                        style={{
                            animation: `toast-life ${duration}ms linear forwards`,
                            animationPlayState: isHovered ? 'paused' : 'running',
                        }}
                        aria-hidden="true"
                    />
                </div>
            )}
        </div>
    );
}

export default function ToastViewport() {
    const toasts = useToastStore((state) => state.toasts);
    const dismiss = useToastStore((state) => state.dismiss);

    if (toasts.length === 0) return null;

    return (
        <aside
            aria-label="Notifications"
            className="fixed top-20 right-4 sm:right-6 z-[100] flex flex-col gap-3 pointer-events-none w-[calc(100vw-2rem)] sm:w-[380px]"
        >
            {toasts.map((item) => (
                <ToastItem key={item.id} toast={item} onDismiss={dismiss} />
            ))}
        </aside>
    );
}