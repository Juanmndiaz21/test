'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { registerUser, requestPasswordReset } from '@/app/login/actions';
import { toast } from '@/utils/toast';
import Turnstile from '@/components/Turnstile';
import Icon from '@/components/Icon';

export default function Login() {
    const t = useTranslations('login');
    const shouldReduceMotion = useReducedMotion();
    const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState('');
    const [turnstileEpoch, setTurnstileEpoch] = useState(0);
    const [setupToken, setSetupToken] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [forgotSuccess, setForgotSuccess] = useState(false);
    const router = useRouter();

    const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
    const setupTokenRequired = process.env.NEXT_PUBLIC_SETUP_TOKEN_REQUIRED === 'true';

    const guardChallenge = () => {
        if (turnstileEnabled && !turnstileToken) {
            setError(t('errorCompleteSecurity'));
            return false;
        }
        return true;
    };

    const rotateChallenge = () => {
        setTurnstileToken('');
        setTurnstileEpoch((epoch) => epoch + 1);
    };

    const redirectAfterAuth = async () => {
        const session = await getSession();
        router.push(session?.user?.role === 'ADMIN' ? '/admin' : '/');
        router.refresh();
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setError('');
        setPassword('');
        setSetupToken('');
        setForgotSuccess(false);
        rotateChallenge();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!guardChallenge()) {
                setIsLoading(false);
                return;
            }

            if (mode === 'forgot') {
                const res = await requestPasswordReset(email, turnstileToken);
                if (res?.success) {
                    setForgotSuccess(true);
                    setError('');
                } else {
                    setError(res?.error || t('resetError'));
                    rotateChallenge();
                }
            } else if (mode === 'login') {
                const res = await signIn('credentials', {
                    redirect: false,
                    email,
                    password,
                    turnstile: turnstileToken,
                });

                if (res?.error) {
                    setError(t('errorInvalid'));
                    rotateChallenge();
                } else {
                    toast.success(t('toastWelcome'));
                    await redirectAfterAuth();
                }
            } else {
                const res = await registerUser(email, password, turnstileToken, setupToken);
                if (res?.success) {
                    toast.success(res.role === 'ADMIN' ? t('toastCreatedAdmin') : t('toastCreated'));
                    switchMode('login');
                } else {
                    setError(res?.error || t('errorGeneric'));
                    rotateChallenge();
                }
            }
        } catch (err) {
            console.error('Error in form submission:', err);
            setError(err.message || t('errorGeneric'));
            rotateChallenge();
        } finally {
            setIsLoading(false);
        }
    };

    const getSubtitle = () => {
        if (mode === 'forgot') return t('forgotSub');
        if (mode === 'register') return t('createSub');
        return t('signInSub');
    };

    return (
        <div suppressHydrationWarning className="min-h-[calc(100vh-80px)] flex items-center justify-center p-5">
            <motion.div
                initial={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'translateY(8px) scale(0.98)' }}
                animate={{ opacity: 1, transform: 'translateY(0) scale(1)' }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="w-full max-w-md panel-surface p-8 rounded-2xl relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.65)]"
                suppressHydrationWarning
            >
                {/* Subtle top rim light */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9d7cff]/40 to-transparent" />

                <p className="eyebrow mb-3">{t('accessTerminal')}</p>
                <h2 className="display-font text-4xl text-white mb-2 tracking-tight">
                    {mode === 'forgot' ? t('forgotTitle') : 'OGMODZ'}
                </h2>

                <AnimatePresence mode="wait">
                    <motion.p
                        key={mode}
                        initial={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'translateY(-4px)' }}
                        animate={{ opacity: 1, transform: 'translateY(0)' }}
                        exit={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'translateY(4px)' }}
                        transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                        className="text-sm text-slate-400 mb-7"
                    >
                        {getSubtitle()}
                    </motion.p>
                </AnimatePresence>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            role="alert"
                            initial={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'translateY(-6px)' }}
                            animate={{ opacity: 1, transform: 'translateY(0)' }}
                            exit={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'translateY(-6px)' }}
                            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                            className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg mb-6 text-sm text-center"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {mode === 'forgot' && forgotSuccess ? (
                    <motion.div
                        initial={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'scale(0.96)' }}
                        animate={{ opacity: 1, transform: 'scale(1)' }}
                        className="p-5 rounded-xl bg-black/40 border border-[#9d7cff]/40 text-center space-y-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#9d7cff]/20 text-[#9d7cff] flex items-center justify-center mx-auto">
                            <Icon name="mail" className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            {t('resetLinkSent')}
                        </p>
                        <button
                            type="button"
                            onClick={() => switchMode('login')}
                            className="w-full bg-[#9d7cff] hover:bg-white text-[#0d0914] font-black py-3 px-4 rounded-lg transition-colors cursor-pointer text-sm uppercase tracking-wider"
                        >
                            {t('backToLogin')}
                        </button>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10" noValidate suppressHydrationWarning>
                        <div>
                            <label htmlFor="auth-email" className="block text-sm text-slate-400 mb-1">{t('email')}</label>
                            <input
                                id="auth-email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-[#9d7cff] outline-none transition-colors"
                            />
                        </div>

                        {mode !== 'forgot' && (
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label htmlFor="auth-password" className="block text-sm text-slate-400">{t('password')}</label>
                                    {mode === 'login' && (
                                        <button
                                            type="button"
                                            onClick={() => switchMode('forgot')}
                                            className="text-xs text-[#9d7cff] hover:text-white transition-colors cursor-pointer"
                                        >
                                            {t('forgotPassword')}
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        id="auth-password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                        minLength={mode === 'login' ? undefined : 8}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 pr-12 text-white focus:border-[#9d7cff] outline-none transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((visible) => !visible)}
                                        aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#9d7cff] transition-colors"
                                    >
                                        {showPassword ? (
                                            <Icon name="eye-off" className="w-[18px] h-[18px]" />
                                        ) : (
                                            <Icon name="eye" className="w-[18px] h-[18px]" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        <AnimatePresence>
                            {mode === 'register' && setupTokenRequired && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                                >
                                    <label htmlFor="auth-setup" className="block text-sm text-slate-400 mb-1">{t('setupToken')}</label>
                                    <input
                                        id="auth-setup"
                                        type="password"
                                        autoComplete="off"
                                        value={setupToken}
                                        onChange={(e) => setSetupToken(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-[#9d7cff] outline-none transition-colors"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">{t('setupTokenHint')}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="pt-1">
                            <Turnstile
                                key={turnstileEpoch}
                                action={mode}
                                onToken={setTurnstileToken}
                                onExpire={() => setTurnstileToken('')}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#9d7cff] hover:bg-white disabled:bg-slate-700 disabled:opacity-60 text-[#0d0914] font-black py-3.5 px-4 rounded-lg transition-[background-color,color,transform,box-shadow] duration-150 ease-out active:scale-[0.98] mt-4 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(157,124,255,0.25)] hover:shadow-[0_0_24px_rgba(157,124,255,0.45)]"
                        >
                            {isLoading && (
                                <span className="w-4 h-4 border-2 border-[#0d0914] border-t-transparent rounded-full animate-loading-spin" />
                            )}
                            <span>
                                {isLoading
                                    ? (mode === 'forgot' ? t('sendingResetLink') : t('processing'))
                                    : (mode === 'forgot' ? t('sendResetLink') : (mode === 'login' ? t('signInBtn') : t('createAccountBtn')))}
                            </span>
                        </button>
                    </form>
                )}

                {/* Footer Switcher */}
                <div className="text-center mt-6 text-sm text-slate-400">
                    {mode === 'forgot' ? (
                        <button
                            type="button"
                            onClick={() => switchMode('login')}
                            className="text-[#9d7cff] hover:text-white font-bold transition-colors cursor-pointer"
                        >
                            ← {t('backToLogin')}
                        </button>
                    ) : mode === 'login' ? (
                        <p>
                            {t('noAccount')}
                            <button
                                type="button"
                                onClick={() => switchMode('register')}
                                className="text-[#9d7cff] hover:text-white font-bold transition-colors cursor-pointer ml-1.5"
                            >
                                {t('createOne')}
                            </button>
                        </p>
                    ) : (
                        <div>
                            <p>
                                {t('hasAccount')}
                                <button
                                    type="button"
                                    onClick={() => switchMode('login')}
                                    className="text-[#9d7cff] hover:text-white font-bold transition-colors cursor-pointer ml-1.5"
                                >
                                    {t('signInLink')}
                                </button>
                            </p>
                            <span className="block text-xs text-slate-400 mt-3">
                                {t('roleHint')}
                            </span>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
