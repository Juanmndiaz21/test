'use client';
import React, { useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import {
    IconBrandGithub,
    IconBrandGoogle,
    IconBrandOnlyfans,
} from '@tabler/icons-react';
import { registerUser } from '@/app/login/actions';
import { toast } from '@/utils/toast';
import Turnstile from '@/components/Turnstile';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function SignupFormDemo({ onSwitchToLogin, onSuccess }) {
    const router = useRouter();
    const [firstname, setFirstname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            setError('Please fill in both email and password.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        if (turnstileEnabled && !turnstileToken) {
            setError('Please complete the security verification challenge.');
            return;
        }

        setIsLoading(true);

        try {
            const res = await registerUser(email, password, turnstileToken, setupToken, firstname);

            if (res?.success) {
                toast.success('Account created successfully! Signing you in...');

                // Auto sign in with credentials
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
                setError(res?.error || 'Failed to create account.');
                rotateChallenge();
            }
        } catch (err) {
            console.error('Error during registration:', err);
            setError(err.message || 'An unexpected error occurred.');
            rotateChallenge();
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuth = async (provider) => {
        try {
            const res = await signIn(provider, { callbackUrl: '/' });
            if (res?.error) {
                toast.error(`Could not sign in with ${provider}`);
            }
        } catch (err) {
            toast.error(`Sign in with ${provider} is not currently enabled.`);
        }
    };

    return (
        <div className="shadow-input mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/90 p-6 md:p-8 backdrop-blur-md">
            <h2 className="text-xl font-bold text-white tracking-tight">
                Welcome to OGMODZ
            </h2>
            <p className="mt-2 max-w-sm text-sm text-zinc-400">
                Create your account to unlock instant delivery, safe order tracking, and 24/7 operator support.
            </p>

            {error && (
                <div
                    role="alert"
                    className="mt-4 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-center text-xs text-red-200"
                >
                    {error}
                </div>
            )}

            <form className="my-6" onSubmit={handleSubmit}>
                {/* First name only — Last name omitted as requested */}
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="firstname">First name</Label>
                    <Input
                        id="firstname"
                        placeholder="Tyler"
                        type="text"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        autoComplete="given-name"
                    />
                </LabelInputContainer>

                <LabelInputContainer className="mb-4">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        placeholder="projectmayhem@fc.com"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                    />
                </LabelInputContainer>

                <LabelInputContainer className="mb-4">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        placeholder="••••••••"
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                    />
                </LabelInputContainer>

                {setupTokenRequired && (
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="setupToken">Setup Token</Label>
                        <Input
                            id="setupToken"
                            placeholder="Admin token (if first setup)"
                            type="password"
                            value={setupToken}
                            onChange={(e) => setSetupToken(e.target.value)}
                        />
                    </LabelInputContainer>
                )}

                {turnstileEnabled && (
                    <div className="mb-4">
                        <Turnstile
                            key={turnstileEpoch}
                            action="register"
                            onToken={setTurnstileToken}
                            onExpire={() => setTurnstileToken('')}
                        />
                    </div>
                )}

                <button
                    className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-zinc-800 to-zinc-900 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff20_inset,0px_-1px_0px_0px_#27272a_inset] cursor-pointer hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Creating account...</span>
                        </span>
                    ) : (
                        <>Sign up &rarr;</>
                    )}
                    <BottomGradient />
                </button>

                <div className="my-6 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />

                <div className="flex flex-col space-y-3">
                    <button
                        type="button"
                        onClick={() => handleOAuth('github')}
                        className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-zinc-900 px-4 font-medium text-white shadow-[0px_0px_1px_1px_#262626] hover:bg-zinc-800/80 transition-colors cursor-pointer"
                    >
                        <IconBrandGithub className="h-4 w-4 text-neutral-300" />
                        <span className="text-sm text-neutral-300">GitHub</span>
                        <BottomGradient />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleOAuth('google')}
                        className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-zinc-900 px-4 font-medium text-white shadow-[0px_0px_1px_1px_#262626] hover:bg-zinc-800/80 transition-colors cursor-pointer"
                    >
                        <IconBrandGoogle className="h-4 w-4 text-neutral-300" />
                        <span className="text-sm text-neutral-300">Google</span>
                        <BottomGradient />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleOAuth('onlyfans')}
                        className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-zinc-900 px-4 font-medium text-white shadow-[0px_0px_1px_1px_#262626] hover:bg-zinc-800/80 transition-colors cursor-pointer"
                    >
                        <IconBrandOnlyfans className="h-4 w-4 text-neutral-300" />
                        <span className="text-sm text-neutral-300">OnlyFans</span>
                        <BottomGradient />
                    </button>
                </div>

                {onSwitchToLogin && (
                    <div className="text-center mt-6 text-xs text-zinc-400">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="text-purple-400 hover:text-white font-semibold transition-colors cursor-pointer ml-1"
                        >
                            Sign in &rarr;
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}

export default SignupFormDemo;

const BottomGradient = () => {
    return (
        <>
            <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-[#9225CF] to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
            <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
        </>
    );
};

const LabelInputContainer = ({ children, className }) => {
    return (
        <div className={cn('flex w-full flex-col space-y-2', className)}>
            {children}
        </div>
    );
};
