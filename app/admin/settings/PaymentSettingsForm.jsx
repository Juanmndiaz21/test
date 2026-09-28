'use client';

import { useActionState, useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import { toast } from '@/utils/toast';
import { updatePaymentSettingsAction } from './actions';

const initialState = { success: false, error: null, message: null };

export default function PaymentSettingsForm({ initialSettings = {} }) {
    const [state, formAction, isPending] = useActionState(updatePaymentSettingsAction, initialState);

    const [stripe, setStripe] = useState(Boolean(initialSettings.stripe));
    const [paypal, setPaypal] = useState(Boolean(initialSettings.paypal));
    const [crypto, setCrypto] = useState(Boolean(initialSettings.crypto));

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message || 'Settings saved successfully');
        } else if (state?.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <form action={formAction} className="space-y-6">
            <div className="space-y-4">
                {/* PayPal Toggle */}
                <div className={`p-5 rounded-2xl border transition-all ${
                    paypal ? 'bg-[#9d7cff]/10 border-[#9d7cff]/50' : 'bg-[#171229] border-white/10 opacity-70'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 font-serif italic font-black text-xl">
                                P
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-white text-base">PayPal</h3>
                                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                                        paypal ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
                                    }`}>
                                        {paypal ? 'Visible on checkout' : 'Hidden'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                                    Enables native PayPal checkout button. Customers can pay directly using their PayPal balance or linked cards.
                                </p>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                            <input
                                type="checkbox"
                                name="paypal"
                                checked={paypal}
                                onChange={(e) => setPaypal(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9d7cff]"></div>
                        </label>
                    </div>
                </div>

                {/* Stripe Toggle */}
                <div className={`p-5 rounded-2xl border transition-all ${
                    stripe ? 'bg-[#9d7cff]/10 border-[#9d7cff]/50' : 'bg-[#171229] border-white/10 opacity-70'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/30 flex items-center justify-center text-[#c8b4ff]">
                                <Icon name="shield" className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-white text-base">Stripe (Credit / Debit Cards)</h3>
                                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                                        stripe ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
                                    }`}>
                                        {stripe ? 'Visible on checkout' : 'Hidden'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                                    Enables Stripe card checkout. Turn this off if you don&apos;t want card/Stripe options to appear on the store.
                                </p>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                            <input
                                type="checkbox"
                                name="stripe"
                                checked={stripe}
                                onChange={(e) => setStripe(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9d7cff]"></div>
                        </label>
                    </div>
                </div>

                {/* Crypto Toggle */}
                <div className={`p-5 rounded-2xl border transition-all ${
                    crypto ? 'bg-[#9d7cff]/10 border-[#9d7cff]/50' : 'bg-[#171229] border-white/10 opacity-70'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                                <Icon name="wallet" className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-white text-base">Crypto / Web3</h3>
                                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                                        crypto ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
                                    }`}>
                                        {crypto ? 'Visible on checkout' : 'Hidden'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                                    Enables cryptocurrency options (USDT, BTC, ETH) on the checkout page.
                                </p>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                            <input
                                type="checkbox"
                                name="crypto"
                                checked={crypto}
                                onChange={(e) => setCrypto(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9d7cff]"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Tip box */}
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs flex items-start gap-2.5">
                <Icon name="info" className="w-4 h-4 text-[#9d7cff] shrink-0 mt-0.5" />
                <p leading-relaxed>
                    <strong>Tip:</strong> If you only want the PayPal button on your website, leave <strong>PayPal</strong> turned ON and turn OFF <strong>Stripe</strong> and <strong>Crypto</strong>. Only PayPal will be displayed to your customers.
                </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center justify-center gap-2 bg-[#9d7cff] hover:bg-[#8b63fc] text-[#0d0914] font-black uppercase text-sm px-6 py-3.5 rounded-xl transition-all disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <span className="w-4 h-4 border-2 border-[#0d0914]/40 border-t-[#0d0914] rounded-full animate-spin" />
                            Saving Changes...
                        </>
                    ) : (
                        <>
                            <Icon name="check" className="w-4 h-4" />
                            Save Payment Settings
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
