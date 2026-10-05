'use client';

import { useState, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { motion, useReducedMotion } from 'motion/react';
import PageHeaderBanner from '@/components/PageHeaderBanner';
import Icon from '@/components/Icon';
import { resetPassword } from '@/app/login/actions';
import { toast } from '@/utils/toast';

export default function ResetPasswordPage({ searchParams }) {
    const t = useTranslations('resetPassword');
    const router = useRouter();
    const shouldReduceMotion = useReducedMotion();
    const resolvedParams = use(searchParams);
    const token = resolvedParams?.token || '';
    const email = resolvedParams?.email || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 8) {
            setError(t('passwordMinLength'));
            return;
        }

        if (newPassword !== confirmPassword) {
            setError(t('passwordsMismatch'));
            return;
        }

        setIsLoading(true);

        try {
            const res = await resetPassword(token, email, newPassword);
            if (res.success) {
                setIsSuccess(true);
                toast.success(t('successTitle'));
            } else {
                setError(res.error || t('invalidToken'));
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-5 bg-zinc-950 text-zinc-100">
                <div className="max-w-md w-full panel-surface bg-zinc-900 border border-white/10 p-8 rounded-2xl text-center">
                    <Icon name="alert-circle" className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">{t('invalidToken')}</h2>
                    <p className="text-sm text-zinc-400 mb-6">
                        The reset link is missing required parameters or is no longer valid.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase text-sm px-6 py-3 rounded-lg transition-colors cursor-pointer"
                    >
                        {t('requestNewLink')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div suppressHydrationWarning className="min-h-[calc(100vh-80px)] flex items-center justify-center p-5 bg-zinc-950 text-zinc-100">
            <motion.div
                initial={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'translateY(8px) scale(0.98)' }}
                animate={{ opacity: 1, transform: 'translateY(0) scale(1)' }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="w-full max-w-md panel-surface bg-zinc-900 border border-white/10 p-8 rounded-2xl relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.65)]"
                suppressHydrationWarning
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

                <p className="eyebrow mb-3 text-emerald-400">OGMODZ</p>
                <h2 className="display-font text-3xl sm:text-4xl text-white mb-2 tracking-tight">
                    {t('title')}
                </h2>
                <p className="text-sm text-zinc-400 mb-6">
                    {t('subtitle')}
                </p>

                {error && (
                    <div className="bg-rose-900/50 border border-rose-500 text-rose-200 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                {isSuccess ? (
                    <div className="p-6 rounded-xl bg-black/40 border border-emerald-500/40 text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                            <Icon name="check" className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white">{t('successTitle')}</h3>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                            {t('successText')}
                        </p>
                        <Link
                            href="/login"
                            className="w-full inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black py-3.5 px-4 rounded-lg transition-colors cursor-pointer text-sm uppercase tracking-wider mt-2"
                        >
                            {t('goToLogin')}
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate suppressHydrationWarning>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">{t('newPassword')}</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={8}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 pr-12 text-white focus:border-emerald-500 outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                                >
                                    <Icon name={showPassword ? 'eye-off' : 'eye'} className="w-[18px] h-[18px]" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">{t('confirmPassword')}</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={8}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-black py-3.5 px-4 rounded-lg transition-all active:scale-[0.98] mt-6 flex items-center justify-center gap-2 cursor-pointer uppercase text-sm tracking-wider shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:shadow-[0_0_24px_rgba(16,185,129,0.45)]"
                        >
                            {isLoading && (
                                <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-loading-spin" />
                            )}
                            <span>{isLoading ? t('saving') : t('submitBtn')}</span>
                        </button>

                        <div className="text-center pt-4">
                            <Link
                                href="/login"
                                className="text-xs text-zinc-400 hover:text-white transition-colors"
                            >
                                ← Back to Sign In
                            </Link>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
