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
    const [cryptoDiscord, setCryptoDiscord] = useState(Boolean(initialSettings.crypto_discord));

    const [title, setTitle] = useState(initialSettings.crypto_discord_title || 'Crypto / Binance Pay (Discord Ticket)');
    const [discordUrl, setDiscordUrl] = useState(initialSettings.crypto_discord_url || 'https://discord.gg/qwyQjn4Aqx');
    const [instructions, setInstructions] = useState(
        initialSettings.crypto_discord_instructions ||
        'Upon placing your order, your purchase code will be generated. Please open a ticket on our Discord server and share your code to receive payment details (Binance Pay / USDT) and activate your service instantly.'
    );

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
                {/* 1. PayPal Toggle */}
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
                                    Enables native PayPal checkout button. Customers can pay directly using their PayPal balance or cards.
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

                {/* 2. Stripe Toggle */}
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

                {/* 3. Original Web3 / Crypto Toggle */}
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
                                    <h3 className="font-bold text-white text-base">Web3 / Crypto (Standard Button)</h3>
                                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                                        crypto ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
                                    }`}>
                                        {crypto ? 'Visible on checkout' : 'Hidden'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                                    Displays the original Web3 / Crypto button (USDT · BTC · ETH) on the checkout page.
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

                {/* 4. NEW: Crypto (Discord Ticket / Binance Pay) with Editable Text */}
                <div className={`p-5 rounded-2xl border transition-all ${
                    cryptoDiscord ? 'bg-[#9d7cff]/10 border-[#9d7cff]/50' : 'bg-[#171229] border-white/10 opacity-70'
                }`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                                <Icon name="wallet" className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-white text-base">Crypto (Discord Ticket / Binance Pay)</h3>
                                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                                        cryptoDiscord ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
                                    }`}>
                                        {cryptoDiscord ? 'Visible on checkout' : 'Hidden'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                                    Creates the order and directs the customer to open a ticket in Discord (<code className="text-[#9d7cff]">discord.gg/qwyQjn4Aqx</code>) with their Order Code to pay via Binance Pay or Crypto.
                                </p>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                            <input
                                type="checkbox"
                                name="crypto_discord"
                                checked={cryptoDiscord}
                                onChange={(e) => setCryptoDiscord(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9d7cff]"></div>
                        </label>
                    </div>

                    {/* Editable fields for Crypto Discord */}
                    <div className="pt-4 border-t border-white/10 space-y-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                                Checkout Button Title
                            </label>
                            <input
                                type="text"
                                name="crypto_discord_title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Crypto / Binance Pay (Discord Ticket)"
                                className="w-full bg-[#120e1c] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9d7cff]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                                Discord Ticket Link
                            </label>
                            <input
                                type="url"
                                name="crypto_discord_url"
                                value={discordUrl}
                                onChange={(e) => setDiscordUrl(e.target.value)}
                                placeholder="https://discord.gg/..."
                                className="w-full bg-[#120e1c] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9d7cff]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                                Instructions Text (Displayed on checkout and success page)
                            </label>
                            <textarea
                                name="crypto_discord_instructions"
                                rows={3}
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="Write instructions for the customer..."
                                className="w-full bg-[#120e1c] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9d7cff] leading-relaxed"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tip box */}
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs flex items-start gap-2.5">
                <Icon name="info" className="w-4 h-4 text-[#9d7cff] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                    You can toggle each of the 4 payment methods independently. When you enable <strong>Crypto (Discord Ticket)</strong>, the title, link, and instructions configured above will be instantly displayed to your customers on the checkout.
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
