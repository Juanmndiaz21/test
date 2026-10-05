'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { registerUser } from '@/app/login/actions';
import { toast } from '@/utils/toast';
import Turnstile from '@/components/Turnstile';
import Icon from '@/components/Icon';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function SignupFormDemo({ onSwitchToLogin, onSuccess }) {
    const t = useTranslations('login');
    const router = useRouter();
    const shouldReduceMotion = useReducedMotion();

    const [firstname, setFirstname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [setupToken, setSetupToken] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');
    const [turnstileEpoch, setTurnstileEpoch] = useState(0);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
    const setupTokenRequired = process.env.NEXT_PUBLIC_SETUP_TOKEN_REQUIRED === 'true';

    const rotateChallenge = () => {
        setTurnstileToken('');
        setTurnstileEpoch((epoch) => epoch + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError(t('errorInvalid') || 'Please fill in both email and password.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        if (turnstileEnabled && !turnstileToken) {
            setError(t('errorCompleteSecurity') || 'Please complete the security verification challenge.');
            return;
        }

        setIsLoading(true);

        try {
            const res = await registerUser(email, password, turnstileToken, setupToken, firstname);

            if (res?.success) {
                toast.success(
                    res.role === 'ADMIN'
                        ? (t('toastCreatedAdmin') || 'Account created — you are the administrator.')
                        : (t('toastCreated') || 'Account created successfully! Signing you in...')
                );

                const loginRes = await signIn('credentials', {
                    redirect: false,
                    email,
                    password,
                    turnstile: turnstileToken,
                });

                if (loginRes?.ok) {
                    if (onSuccess) {
                        onSuccess();
                    } else {
                        router.push('/');
                        router.refresh();
                    }
                } else if (onSwitchToLogin) {
                    onSwitchToLogin();
                } else {
                    router.push('/login');
                }
            } else {
                setError(res?.error || t('errorGeneric') || 'Failed to create account.');
                rotateChallenge();
            }
        } catch (err) {
            console.error('Error during registration:', err);
            setError(err.message || t('errorGeneric') || 'An unexpected error occurred.');
            rotateChallenge();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'translateY(8px) scale(0.98)' }}
            animate={{ opacity: 1, transform: 'translateY(0) scale(1)' }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="w-full max-w-md panel-surface bg-zinc-900 border border-white/10 p-8 rounded-2xl relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.65)]"
            suppressHydrationWarning
        >
            {/* Subtle top rim light */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9225CF]/50 to-transparent" />

            <p className="eyebrow mb-3 text-purple-400 font-mono text-xs uppercase tracking-wider">
                {t('accessTerminal') || 'ACCESS TERMINAL'}
            </p>
            <h2 className="display-font text-4xl text-white mb-2 tracking-tight">
                OGMODZ
            </h2>
            <p className="text-sm text-zinc-400 mb-7">
                {t('createSub') || 'Create a free account. Boosts are tracked by email.'}
            </p>

            {error && (
                <div
                    role="alert"
                    className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg mb-6 text-sm text-center"
                >
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10" noValidate suppressHydrationWarning>
                <div>
                    <label htmlFor="signup-firstname" className="block text-sm text-zinc-400 mb-1">
                        First name
                    </label>
                    <input
                        id="signup-firstname"
                        type="text"
                        placeholder="Tyler"
                        autoComplete="given-name"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white placeholder:text-zinc-600 focus:border-[#9225CF] outline-none transition-colors"
                    />
                </div>

                <div>
                    <label htmlFor="signup-email" className="block text-sm text-zinc-400 mb-1">
                        {t('email') || 'Email'}
                    </label>
                    <input
                        id="signup-email"
                        type="email"
                        required
                        placeholder="projectmayhem@fc.com"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white placeholder:text-zinc-600 focus:border-[#9225CF] outline-none transition-colors"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label htmlFor="signup-password" className="block text-sm text-zinc-400">
                            {t('password') || 'Password'}
                        </label>
                    </div>
                    <div className="relative">
                        <input
                            id="signup-password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 pr-12 text-white placeholder:text-zinc-600 focus:border-[#9225CF] outline-none transition-colors"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((visible) => !visible)}
                            aria-label={showPassword ? (t('hidePassword') || 'Hide password') : (t('showPassword') || 'Show password')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-purple-400 transition-colors cursor-pointer"
                        >
                            {showPassword ? (
                                <Icon name="eye-off" className="w-[18px] h-[18px]" />
                            ) : (
                                <Icon name="eye" className="w-[18px] h-[18px]" />
                            )}
                        </button>
                    </div>
                </div>

                {setupTokenRequired && (
                    <div>
                        <label htmlFor="signup-setup" className="block text-sm text-zinc-400 mb-1">
                            {t('setupToken') || 'Setup code'}
                        </label>
                        <input
                            id="signup-setup"
                            type="password"
                            placeholder="Admin token (if first setup)"
                            autoComplete="off"
                            value={setupToken}
                            onChange={(e) => setSetupToken(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white placeholder:text-zinc-600 focus:border-[#9225CF] outline-none transition-colors"
                        />
                        <p className="text-xs text-zinc-400 mt-1">
                            {t('setupTokenHint') || 'Setup code for the first administrator.'}
                        </p>
                    </div>
                )}

                {turnstileEnabled && (
                    <div className="pt-1">
                        <Turnstile
                            key={turnstileEpoch}
                            action="register"
                            onToken={setTurnstileToken}
                            onExpire={() => setTurnstileToken('')}
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#9225CF] hover:bg-[#a83ff0] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:opacity-60 text-white font-black py-3.5 px-4 rounded-lg transition-[background-color,color,transform,box-shadow] duration-150 ease-out active:scale-[0.98] mt-4 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(146,37,207,0.25)] hover:shadow-[0_0_24px_rgba(146,37,207,0.45)] uppercase tracking-wider text-sm"
                >
                    {isLoading && (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-loading-spin" />
                    )}
                    <span>
                        {isLoading
                            ? (t('processing') || 'PROCESSING...')
                            : (t('createAccountBtn') || 'CREATE ACCOUNT')}
                    </span>
                </button>
            </form>

            <div className="text-center mt-6 text-sm text-zinc-400">
                <p>
                    {t('hasAccount') || 'Already have an account?'}
                    {onSwitchToLogin ? (
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="text-purple-400 hover:text-white font-bold transition-colors cursor-pointer ml-1.5"
                        >
                            {t('signInLink') || 'Sign In'}
                        </button>
                    ) : (
                        <a
                            href="/login"
                            className="text-purple-400 hover:text-white font-bold transition-colors cursor-pointer ml-1.5"
                        >
                            {t('signInLink') || 'Sign In'}
                        </a>
                    )}
                </p>
                <span className="block text-xs text-zinc-400 mt-3">
                    {t('roleHint') || 'Customer accounts get the USER role. The very first account created becomes the administrator only when the setup code is entered.'}
                </span>
            </div>
        </motion.div>
    );
}

export default SignupFormDemo;
