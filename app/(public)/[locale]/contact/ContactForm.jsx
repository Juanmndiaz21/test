'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from '@/utils/toast';
import Icon from '@/components/Icon';
import Turnstile from '@/components/Turnstile';

export default function ContactForm({ initialSubject = '' }) {
    const t = useTranslations('contact');
    const [status, setStatus] = useState('idle');
    const [formError, setFormError] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');
    const [subject, setSubject] = useState(initialSubject);
    const [consent, setConsent] = useState(false);

    const QUICK_TOPICS = [
        'Order & Tracking Support',
        'Refund Request',
        'Data Deletion / Privacy (GDPR/CCPA)',
        'General Question',
    ];

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const currentSubject = String(formData.get('subject') || subject || '').trim();
        const message = String(formData.get('message') || '').trim();

        if (!name) {
            setFormError(t('nameRequired'));
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setFormError(t('emailInvalid'));
            return;
        }
        if (message.length < 10) {
            setFormError(t('messageTooShort'));
            return;
        }
        if (!consent) {
            setFormError('You must agree to the Privacy Policy so we can process your inquiry.');
            return;
        }

        setFormError('');
        setStatus('submitting');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject: currentSubject, message, turnstile: turnstileToken }),
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error || t('toastError'));
            }

            toast.success(t('toastSuccess'));
            setStatus('sent');
            setTurnstileToken('');
            form.reset();
            setSubject('');
            setConsent(false);
        } catch (error) {
            setStatus('idle');
            setFormError(error.message || t('toastError'));
            toast.error(t('toastError'));
        }
    };

    const inputClass =
        'w-full bg-[#120e1c]/80 border border-white/10 rounded-lg px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:border-[#9d7cff] outline-none transition-colors';

    return (
        <form onSubmit={handleSubmit} className="panel-surface rounded-2xl p-7 md:p-9 space-y-5 border border-white/10" noValidate>
            {formError && (
                <div role="alert" className="bg-rose-950/60 border border-rose-500 text-rose-200 p-3.5 rounded-lg text-sm flex items-center gap-2">
                    <Icon name="alert-circle" className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{formError}</span>
                </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
                <div>
                    <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-300 mb-1.5">
                        {t('name')} <span className="text-[#9d7cff]">*</span>
                    </label>
                    <input id="contact-name" name="name" type="text" required className={inputClass} placeholder="Your name or Discord tag" />
                </div>
                <div>
                    <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-300 mb-1.5">
                        {t('email')} <span className="text-[#9d7cff]">*</span>
                    </label>
                    <input id="contact-email" name="email" type="email" required className={inputClass} placeholder="you@example.com" />
                </div>
            </div>

            <div>
                <label htmlFor="contact-subject" className="block text-sm font-semibold text-slate-300 mb-1.5">
                    {t('subject')}
                </label>
                <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Order #OGM-7K8P or Data Deletion"
                    className={inputClass}
                />
                {/* Quick Topic Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {QUICK_TOPICS.map((topic) => (
                        <button
                            key={topic}
                            type="button"
                            onClick={() => setSubject(topic)}
                            className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                                subject === topic
                                    ? 'bg-[#9d7cff]/20 border-[#9d7cff] text-white font-semibold'
                                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
                            }`}
                        >
                            {topic}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-300 mb-1.5">
                    {t('message')} <span className="text-[#9d7cff]">*</span>
                </label>
                <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Provide order details, tracking code, or specific requests..."
                    className={`${inputClass} resize-y`}
                />
            </div>

            {/* Explicit Consent Checkbox (Opt-in) */}
            <div className="pt-1">
                <label className="flex items-start gap-2.5 text-xs text-slate-300 select-none cursor-pointer">
                    <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-white/20 bg-[#120e1c] text-[#9d7cff] accent-[#9d7cff] focus:ring-2 focus:ring-[#9d7cff] focus:outline-none cursor-pointer"
                    />
                    <span className="leading-relaxed">
                        I agree that OGmodz may process my contact details to reply to my message in accordance with the{' '}
                        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#c8b4ff] underline hover:text-white">
                            Privacy Policy
                        </a>.
                    </span>
                </label>
            </div>

            <div className="pt-1">
                <Turnstile
                    action="contact"
                    onToken={setTurnstileToken}
                    onExpire={() => setTurnstileToken('')}
                />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/10">
                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="inline-flex items-center justify-center gap-2 bg-[#9d7cff] hover:bg-[#b59dff] disabled:opacity-50 text-[#0d0914] font-black uppercase tracking-wider py-3.5 px-8 rounded-xl transition-all shadow-[0_4px_16px_rgba(157,124,255,0.3)] hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#9d7cff]"
                >
                    {status === 'submitting' ? (
                        <>
                            <span className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                            {t('submitting')}
                        </>
                    ) : (
                        <>
                            <Icon name="mail" className="w-4 h-4" />
                            {t('submit')}
                        </>
                    )}
                </button>
                <div className="text-xs text-slate-300 space-y-0.5">
                    <p className="font-medium text-white">{t('responseTime')}</p>
                    <p className="text-slate-400">{t('privacyNote')}</p>
                </div>
            </div>
        </form>
    );
}