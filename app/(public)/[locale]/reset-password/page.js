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
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-5 bg-[#0d0914] text-slate-100">
                <div className="max-w-md w-full panel-surface p-8 rounded-2xl border border-red-500/30 text-center">
                    <Icon name="alert-circle" className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">{t('invalidToken')}</h2>
                    <p className="text-sm text-slate-400 mb-6">
                        The reset link is missing required parameters or is no longer valid.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block bg-[#9d7cff] hover:bg-white text-[#0d0914] font-black uppercase text-sm px-6 py-3 rounded-lg transition-colors"
                    >
                        {t('requestNewLink')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div suppressHydrationWarning className="min-h-[calc(100vh-80px)] flex items-center justify-center p-5 bg-[#0d0914] text-slate-100">
            <motion.div
                initial={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'translateY(8px) scale(0.98)' }}
                animate={{ opacity: 1, transform: 'translateY(0) scale(1)' }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="w-full max-w-md panel-surface p-8 rounded-2xl relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.65)]"
                suppressHydrationWarning
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9d7cff]/40 to-transparent" />

                <p className="eyebrow mb-3">OGMODZ</p>
                <h2 className="display-font text-3xl sm:text-4xl text-white mb-2 tracking-tight">
                    {t('title')}
                </h2>
                <p className="text-sm text-slate-400 mb-6">
                    {t('subtitle')}
                </p>

                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                {isSuccess ? (
                    <div className="p-6 rounded-xl bg-black/40 border border-[#9d7cff]/40 text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-[#9d7cff]/20 text-[#9d7cff] flex items-center justify-center mx-auto">
                            <Icon name="check" className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white">{t('successTitle')}</h3>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            {t('successText')}
                        </p>
                        <Link
                            href="/login"
                            className="w-full inline-flex items-center justify-center bg-[#9d7cff] hover:bg-white text-[#0d0914] font-black py-3.5 px-4 rounded-lg transition-colors cursor-pointer text-sm uppercase tracking-wider mt-2"
                        >
                            {t('goToLogin')}
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate suppressHydrationWarning>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">{t('newPassword')}</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={8}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 pr-12 text-white focus:border-[#9d7cff] outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#9d7cff] transition-colors"
                                >
                                    <Icon name={showPassword ? 'eye-off' : 'eye'} className="w-[18px] h-[18px]" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1">{t('confirmPassword')}</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={8}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-[#9d7cff] outline-none transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#9d7cff] hover:bg-white disabled:bg-slate-700 text-[#0d0914] font-black py-3.5 px-4 rounded-lg transition-all active:scale-[0.98] mt-6 flex items-center justify-center gap-2 cursor-pointer uppercase text-sm tracking-wider"
                        >
                            {isLoading && (
                                <span className="w-4 h-4 border-2 border-[#0d0914] border-t-transparent rounded-full animate-loading-spin" />
                            )}
                            <span>{isLoading ? t('saving') : t('submitBtn')}</span>
                        </button>

                        <div className="text-center pt-4">
                            <Link
                                href="/login"
                                className="text-xs text-slate-400 hover:text-white transition-colors"
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
