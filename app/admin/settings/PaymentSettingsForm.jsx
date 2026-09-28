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

    const [title, setTitle] = useState(initialSettings.crypto_discord_title || 'Binance Pay / Crypto (Ticket Discord)');
    const [discordUrl, setDiscordUrl] = useState(initialSettings.crypto_discord_url || 'https://discord.gg/qwyQjn4Aqx');
    const [instructions, setInstructions] = useState(
        initialSettings.crypto_discord_instructions ||
        'Al confirmar tu orden, se generará tu código de compra. Deberás abrir un ticket en nuestro servidor de Discord indicando tu código para recibir los datos de pago (Binance Pay / USDT) y activar tu servicio de inmediato.'
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
                                    <h3 className="font-bold text-white text-base">Web3 / Crypto (Botón estándar)</h3>
                                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                                        crypto ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
                                    }`}>
                                        {crypto ? 'Visible on checkout' : 'Hidden'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                                    Muestra el botón original de Web3 / Crypto (USDT · BTC · ETH) en el checkout.
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

                {/* 4. NEW: Crypto (Ticket Discord / Binance Pay) with Editable Text */}
                <div className={`p-5 rounded-2xl border transition-all ${
                    cryptoDiscord ? 'bg-[#9d7cff]/10 border-[#9d7cff]/50' : 'bg-[#171229] border-white/10 opacity-70'
                }`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-[#5865F2]/15 border border-[#5865F2]/40 flex items-center justify-center text-[#5865F2]">
                                <Icon name="discord" className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-white text-base">Crypto (Ticket Discord / Binance Pay)</h3>
                                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                                        cryptoDiscord ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
                                    }`}>
                                        {cryptoDiscord ? 'Visible on checkout' : 'Hidden'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                                    Genera la orden y guía al cliente a abrir un ticket en Discord para abonar mediante Binance Pay o Crypto.
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
                                Título del botón en el checkout
                            </label>
                            <input
                                type="text"
                                name="crypto_discord_title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ej: Binance Pay / Crypto (Ticket Discord)"
                                className="w-full bg-[#120e1c] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9d7cff]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                                Enlace de Discord (Servidor o canal de tickets)
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
                                Texto de instrucciones (se muestra en el checkout y en la página de éxito)
                            </label>
                            <textarea
                                name="crypto_discord_instructions"
                                rows={3}
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="Escribe las instrucciones para el cliente..."
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
                    Puedes activar o desactivar cualquiera de los 4 métodos de forma independiente. Si activas <strong>Crypto (Ticket Discord / Binance Pay)</strong>, el texto y link que configures arriba se reflejarán inmediatamente en la tienda para tus clientes.
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
                            Guardando cambios...
                        </>
                    ) : (
                        <>
                            <Icon name="check" className="w-4 h-4" />
                            Guardar configuración de pagos
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
