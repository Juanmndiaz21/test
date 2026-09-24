'use client';
import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { registerUser } from '@/app/login/actions';
import { toast } from '@/utils/toast';
import Turnstile from '@/components/Turnstile';
import Icon from '@/components/Icon';

export default function Login() {
    const t = useTranslations('login');
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState('');
    const [turnstileEpoch, setTurnstileEpoch] = useState(0);
    const [setupToken, setSetupToken] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!guardChallenge()) return;

            if (isLogin) {
                const res = await signIn('credentials', {
                    redirect: false,
                    email,
                    password,
                    turnstile: turnstileToken,
                });

                if (res.error) {
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
                    setError('');
                    setPassword('');
                    setIsLogin(true);
                    rotateChallenge();
                } else {
                    setError(res?.error || t('errorGeneric'));
                    rotateChallenge();
                }
            }
        } catch (err) {
            console.error('Error in the form:', err);
            setError(err.message || t('errorGeneric'));
            rotateChallenge();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-5">
            <div className="w-full max-w-md panel-surface p-8 rounded-2xl relative overflow-hidden">

                <p className="eyebrow mb-3">{t('accessTerminal')}</p>
                <h2 className="display-font text-4xl text-white mb-2 tracking-tight">
                    OGMODZ
                </h2>
                <p className="text-sm text-slate-400 mb-7">
                    {isLogin ? t('signInSub') : t('createSub')}
                </p>

                {error && (
                    <div role="alert" className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10" noValidate>
                    <div>
                        <label htmlFor="auth-email" className="block text-sm text-slate-400 mb-1">{t('email')}</label>
                        <input
                            id="auth-email"
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label htmlFor="auth-password" className="block text-sm text-slate-400 mb-1">{t('password')}</label>
                        <div className="relative">
                            <input
                                id="auth-password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                                minLength={isLogin ? undefined : 8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 pr-12 text-white focus:border-lime-300 outline-none transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((visible) => !visible)}
                                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-lime-300 transition-colors"
                            >
                                {showPassword ? (
                                    <Icon name="eye-off" className="w-[18px] h-[18px]" />
                                ) : (
                                    <Icon name="eye" className="w-[18px] h-[18px]" />
                                )}
                            </button>
                        </div>
                    </div>

                    {!isLogin && setupTokenRequired && (
                        <div>
                            <label htmlFor="auth-setup" className="block text-sm text-slate-400 mb-1">{t('setupToken')}</label>
                            <input
                                id="auth-setup"
                                type="password"
                                autoComplete="off"
                                value={setupToken}
                                onChange={(e) => setSetupToken(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none transition-colors"
                            />
                            <p className="text-xs text-slate-500 mt-1">{t('setupTokenHint')}</p>
                        </div>
                    )}

                    <div className="pt-1">
                        <Turnstile
                            key={turnstileEpoch}
                            onToken={setTurnstileToken}
                            onExpire={() => setTurnstileToken('')}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-lime-300 hover:bg-white disabled:bg-slate-700 text-black font-black py-3 px-4 rounded-lg transition-all mt-4"
                    >
                        {isLoading ? t('processing') : (isLogin ? t('signInBtn') : t('createAccountBtn'))}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-slate-400">
                    {isLogin ? t('noAccount') : t('hasAccount')}
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); setPassword(''); setSetupToken(''); }} className="text-lime-300 hover:text-white font-bold transition-colors cursor-pointer">
                        {isLogin ? t('createOne') : t('signInLink')}
                    </button>
                    {!isLogin && (
                        <span className="block text-xs text-slate-500 mt-3">
                            {t('roleHint')}
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
}