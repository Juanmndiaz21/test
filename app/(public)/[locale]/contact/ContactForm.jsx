'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from '@/utils/toast';
import Icon from '@/components/Icon';

export default function ContactForm() {
    const t = useTranslations('contact');
    const [status, setStatus] = useState('idle');
    const [formError, setFormError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const subject = String(formData.get('subject') || '').trim();
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

        setFormError('');
        setStatus('submitting');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message }),
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error || t('toastError'));
            }

            toast.success(t('toastSuccess'));
            setStatus('sent');
            form.reset();
        } catch (error) {
            setStatus('idle');
            setFormError(error.message || t('toastError'));
            toast.error(t('toastError'));
        }
    };

    const inputClass =
        'w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-lime-300 outline-none transition-colors';

    return (
        <form onSubmit={handleSubmit} className="panel-surface rounded-2xl p-7 md:p-9 space-y-5" noValidate>
            {formError && (
                <div role="alert" className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg text-sm">
                    {formError}
                </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
                <div>
                    <label htmlFor="contact-name" className="block text-sm text-slate-400 mb-1.5">{t('name')}</label>
                    <input id="contact-name" name="name" type="text" required className={inputClass} />
                </div>
                <div>
                    <label htmlFor="contact-email" className="block text-sm text-slate-400 mb-1.5">{t('email')}</label>
                    <input id="contact-email" name="email" type="email" required className={inputClass} placeholder="you@example.com" />
                </div>
            </div>

            <div>
                <label htmlFor="contact-subject" className="block text-sm text-slate-400 mb-1.5">{t('subject')}</label>
                <input id="contact-subject" name="subject" type="text" className={inputClass} />
            </div>

            <div>
                <label htmlFor="contact-message" className="block text-sm text-slate-400 mb-1.5">{t('message')}</label>
                <textarea id="contact-message" name="message" required rows={6} className={`${inputClass} resize-y`} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="inline-flex items-center justify-center gap-2 bg-lime-300 hover:bg-white disabled:bg-slate-700 text-black font-black uppercase tracking-wide py-3.5 px-8 rounded-lg transition-colors"
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
                <p className="text-xs text-slate-500">{t('responseTime')} · {t('privacyNote')}</p>
            </div>
        </form>
    );
}