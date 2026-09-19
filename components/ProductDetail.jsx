'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from '../utils/toast';
import { useCartStore } from '../store/useCartStore';
import { Link } from '../i18n/navigation';
import { DEFAULT_OPTIONS } from '../lib/serviceDefaults';
import EditableContentSection from './EditableContentSection';
import GameArt from './GameArt';

const platforms = ['PC', 'PlayStation', 'Xbox', 'All'];
const splitContent = (value, fallback) => (value ? value.split('\n').map((item) => item.trim()).filter(Boolean) : fallback);

export default function ProductDetail({ product, relatedProducts = [], defaultOptions = DEFAULT_OPTIONS }) {
    const isCS2 = String(product.game || '').trim().toUpperCase() === 'CS2';
    const t = useTranslations('product');
    const common = useTranslations('common');
    const addToCart = useCartStore((state) => state.addToCart);
    const options = (Array.isArray(product.options) && product.options.length > 0)
        ? product.options
        : ((Array.isArray(product.boost_options) && product.boost_options.length > 0)
            ? product.boost_options
            : ((Array.isArray(product.commends_options) && product.commends_options.length > 0)
                ? product.commends_options
                : defaultOptions));
    const [platform, setPlatform] = useState(product.platform || 'PC');
    const [boostAmount, setBoostAmount] = useState(String(product.boost_amount || options[0]?.amount || 100));
    const [added, setAdded] = useState(false);

    const selectedOption = options.find((option) => String(option.amount) === String(boostAmount));
    const boostLabel = selectedOption?.label || `${boostAmount}M`;
    const activePrice = (selectedOption?.price !== undefined && selectedOption?.price !== null && !isNaN(Number(selectedOption.price)) && Number(selectedOption.price) > 0)
        ? Number(selectedOption.price)
        : Number(product.price);

    const handleAddToCart = () => {
        addToCart({
            ...product,
            key: `${product.id}|${platform}|${boostAmount}`,
            platform,
            boost_amount: Number(boostAmount),
            price: activePrice,
            name: `${product.name} · ${platform} · ${boostLabel}`,
        });
        setAdded(true);
        toast.success(t(isCS2 ? 'toastCommends' : 'toastAdded', { platform, boost: boostAmount }));
    };

    return (
        <div className="max-w-7xl mx-auto px-5 py-12 md:py-16">
            <Link href={`/store/game/${encodeURIComponent(product.game || 'General')}`} className="text-sm text-slate-400 hover:text-lime-300 transition-colors">{t('backTo', { game: product.game || 'game' })}</Link>
            <div className="grid lg:grid-cols-[1fr_0.8fr] gap-8 mt-8 items-start">
                <section className="panel-surface rounded-2xl p-7 md:p-10">
                    <GameArt name={product.name} image_url={product.image_url} className="w-full aspect-video rounded-xl mb-8" />
                    <div className="flex justify-between gap-4 mb-8">
                        <span className="eyebrow">{common('allPlatforms')}</span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-lime-300 border border-lime-300/20 bg-lime-300/5 rounded-full px-3 py-1 font-mono">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-300 opacity-60" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-300" />
                            </span>
                            {common('available')}
                        </span>
                    </div>
                    <h1 className="display-font text-5xl md:text-7xl uppercase text-white leading-[0.95]">{product.name}</h1>
                    <p className="text-slate-400 text-lg leading-relaxed mt-7">
                        {product.description || t('defaultDescription')}
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3 mt-10 pt-7 border-t border-white/10 text-sm">
                        <div><span className="text-slate-400 block">{t('configLabel')}</span><strong className="text-white">{t('configValue')}</strong></div>
                        <div><span className="text-slate-400 block">{t('managedByLabel')}</span><strong className="text-white">{t('managedByValue')}</strong></div>
                        <div><span className="text-slate-400 block">{t('deliveryLabel')}</span><strong className="text-white">{t('deliveryValue')}</strong></div>
                    </div>
                </section>

                <section className="panel-surface rounded-2xl p-7 md:p-8 lg:sticky lg:top-28">
                    <p className="eyebrow mb-3">{t(isCS2 ? 'commendsMatchConfig' : 'matchConfig')}</p>
                    <h2 className="text-2xl font-black text-white mb-7">{t(isCS2 ? 'configureCommends' : 'configureBoost')}</h2>

                    <label className="block text-sm font-bold text-slate-300 mb-2" htmlFor="platform">{t('platform')}</label>
                    <select id="platform" value={platform} onChange={(event) => setPlatform(event.target.value)} className="w-full bg-[#171229] border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:outline-none mb-6">
                        {platforms.map((option) => <option key={option}>{option}</option>)}
                    </select>

                    <label className="block text-sm font-bold text-slate-300 mb-2" htmlFor="boost-amount">{t(isCS2 ? 'commendsAmount' : 'boostAmount')}</label>
                    <select id="boost-amount" value={boostAmount} onChange={(event) => setBoostAmount(event.target.value)} className="w-full bg-[#171229] border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:outline-none">
                        {options.map(({ amount, label, price }) => (
                            <option key={amount} value={amount}>
                                {label}{price ? ` — $${Number(price).toFixed(2)}` : ''}
                            </option>
                        ))}
                    </select>

                    <div className="flex justify-between items-end mt-8 pt-6 border-t border-white/10">
                        <span className="text-slate-400 text-sm">{t('servicePrice')}</span>
                        <strong key={activePrice} className="animate-ladder-row text-4xl text-white data-readout font-bold">${activePrice.toFixed(2)}<small className="text-base text-slate-400 ml-1.5 uppercase font-mono">{common('usd')}</small></strong>
                    </div>
                    <button type="button" onClick={handleAddToCart} className="w-full mt-7 bg-lime-300 hover:bg-white text-black font-black uppercase tracking-wide py-4 rounded-lg transition-all duration-200 active:scale-[0.98] hover:shadow-[0_0_20px_rgba(157,124,255,0.4)] focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:outline-none cursor-pointer">
                        {added ? t('addedToCart') : t('addConfiguration')}
                    </button>
                    {added && <Link href="/checkout" className="block text-center text-sm text-lime-300 hover:text-white mt-4">{t('proceedToCheckout')}</Link>}
                </section>
            </div>

            <section className="mt-16 max-w-4xl border-t border-white/10 pt-12">
                <p className="eyebrow mb-3">{t('serviceGuide')}</p>
                <EditableContentSection productId={product.id} section="description" title={t('sectionDescription')} initialItems={[product.description || t('fallbackDescription')]} />

                <EditableContentSection productId={product.id} section="how_it_works" title={t('sectionHowItWorks')} initialItems={splitContent(product.how_it_works, t.raw('fallbackHowItWorks'))} />
                <EditableContentSection productId={product.id} section="requirements" title={t('sectionRequirements')} initialItems={splitContent(product.requirements, t.raw('fallbackRequirements'))} />
                <EditableContentSection productId={product.id} section="faqs" title={t('sectionFaqs')} initialItems={splitContent(product.faqs, t.raw('fallbackFaqs'))} renderItem={(item) => { const [question, answer] = item.split('|'); return <details><summary className="font-bold text-white cursor-pointer">{question.trim()}</summary><p className="text-slate-400 mt-3">{(answer || t('faqFallbackAnswer')).trim()}</p></details>; }} />
            </section>

            {relatedProducts.length > 0 && (
                <section className="mt-16 border-t border-white/10 pt-12">
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="display-font text-4xl uppercase text-white">{t('relatedTitle')}</h2>
                        <div className="h-px bg-white/10 flex-1" />
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {relatedProducts.map((related, index) => (
                            <Link
                                key={related.id}
                                href={`/store/${related.id}`}
                                className="animate-ladder-row group relative overflow-hidden panel-surface rounded-2xl p-5 flex flex-col justify-between hover:border-lime-300/60 hover:-translate-y-1.5 hover:shadow-[0_16px_32px_-10px_rgba(157,124,255,0.25)] transition-all duration-300"
                                style={{ animationDelay: `${index * 60}ms` }}
                            >
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-lime-300/0 to-transparent transition-all duration-500 group-hover:via-lime-300/70" />
                                <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-lime-300/0 blur-xl transition-all duration-500 group-hover:bg-lime-300/15" />
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="eyebrow">{common('allPlatforms')}</span>
                                        <span className="inline-flex items-center gap-1.5 text-xs text-lime-300 font-mono">
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-300 opacity-60" />
                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-lime-300" />
                                            </span>
                                        </span>
                                    </div>
                                    <h3 className="font-black text-white text-lg group-hover:text-lime-300 transition-colors leading-snug">
                                        {related.name}
                                    </h3>
                                </div>
                                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                                    <strong className="block text-white group-hover:text-lime-300 text-xl font-black transition-colors font-mono data-readout">
                                        ${related.price}
                                        <small className="text-xs text-slate-400 ml-1 font-mono uppercase">{common('usd')}</small>
                                    </strong>
                                    <span className="w-8 h-8 rounded-full border border-lime-300/40 text-lime-300 flex items-center justify-center text-sm group-hover:bg-lime-300 group-hover:text-black group-hover:scale-110 transition-all">
                                        →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}