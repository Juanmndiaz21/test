'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from '../utils/toast';
import { useCartStore } from '../store/useCartStore';
import { Link } from '../i18n/navigation';
import { DEFAULT_OPTIONS } from '../lib/serviceDefaults';
import { parseProductPlatforms } from '../lib/platforms';
import EditableContentSection from './EditableContentSection';
import GameArt from './GameArt';
import PlatformBadges, { PlayStationIcon, XboxIcon, PcIcon } from './PlatformBadges';
import ProductTrustBadges from './ProductTrustBadges';
import GtaOrderConfigurator from './GtaOrderConfigurator';
import ProductCard from './ProductCard';

const platforms = ['PC', 'PlayStation', 'Xbox', 'All'];
const splitContent = (value, fallback) => (value ? value.split('\n').map((item) => item.trim()).filter(Boolean) : fallback);

export default function ProductDetail({ product, relatedProducts = [], defaultOptions = DEFAULT_OPTIONS }) {
    const isCS2 = String(product.game || '').trim().toUpperCase() === 'CS2';
    const isGTA = String(product.game || '').trim().toUpperCase().includes('GTA') || String(product.name || '').toUpperCase().includes('GTA');
    const hasConfigurator = isGTA || Boolean(
        product.configurator_data && (
            (Array.isArray(product.configurator_data.packages) && product.configurator_data.packages.length > 0) ||
            product.configurator_data.versions ||
            (Array.isArray(product.configurator_data.addons) && product.configurator_data.addons.length > 0)
        )
    );
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
    const allowedPlatforms = useMemo(() => parseProductPlatforms(product.platform), [product.platform]);
    const [platform, setPlatform] = useState(() => allowedPlatforms[0] || 'PC');
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
            <Link href={`/store/game/${encodeURIComponent(product.game || 'General')}`} className="text-sm text-slate-400 hover:text-[#9d7cff] transition-colors">{t('backTo', { game: product.game || 'game' })}</Link>
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 mt-8 items-start">
                <section className="panel-surface rounded-2xl p-7 md:p-10">
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8 bg-black/40">
                        <GameArt name={product.name} image_url={product.image_url} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 z-10">
                            <PlatformBadges platform={product.platform} />
                        </div>
                    </div>

                    <div className="flex justify-between gap-4 mb-8">
                        <span className="eyebrow">{common('allPlatforms')}</span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#9d7cff] border border-[#9d7cff]/25 bg-[#9d7cff]/10 rounded-full px-3 py-1 font-mono">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9d7cff] opacity-60" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9d7cff]" />
                            </span>
                            {common('available')}
                        </span>
                    </div>

                    <h1 className="display-font text-4xl sm:text-5xl md:text-6xl uppercase text-white leading-[0.95]">{product.name}</h1>
                    <p className="text-slate-400 text-base sm:text-lg leading-relaxed mt-6">
                        {product.description || t('defaultDescription')}
                    </p>

                    <div className="grid sm:grid-cols-3 gap-3 mt-8 pt-7 border-t border-white/10 text-sm">
                        <div><span className="text-slate-400 block">{t('configLabel')}</span><strong className="text-white">{t('configValue')}</strong></div>
                        <div><span className="text-slate-400 block">{t('managedByLabel')}</span><strong className="text-white">{t('managedByValue')}</strong></div>
                        <div><span className="text-slate-400 block">{t('deliveryLabel')}</span><strong className="text-white">{t('deliveryValue')}</strong></div>
                    </div>

                    {/* Trust and Guarantee Verification Badges (Image 2) */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="eyebrow mb-2">Verified guarantees</p>
                        <ProductTrustBadges />
                    </div>
                </section>

                {/* Right Column: Interactive Configurator */}
                <div className="lg:sticky lg:top-28">
                    {hasConfigurator ? (
                        <GtaOrderConfigurator product={product} />
                    ) : (
                        <section className="panel-surface rounded-2xl p-7 md:p-8 bg-[#171229] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            <p className="eyebrow mb-3">{t(isCS2 ? 'commendsMatchConfig' : 'matchConfig')}</p>
                            <h2 className="text-2xl font-black text-white mb-7">{t(isCS2 ? 'configureCommends' : 'configureBoost')}</h2>

                            <label className="block text-sm font-bold text-slate-300 mb-2">{t('platform')}</label>
                            <div className={`grid gap-2.5 mb-6 ${
                                allowedPlatforms.length === 1
                                    ? 'grid-cols-1'
                                    : allowedPlatforms.length === 2
                                    ? 'grid-cols-2'
                                    : 'grid-cols-3'
                            }`}>
                                {allowedPlatforms.map((p) => {
                                    const active = platform.toLowerCase() === p.toLowerCase();
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPlatform(p)}
                                            className={`py-3 px-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border flex items-center justify-center gap-2 ${
                                                active
                                                    ? 'bg-[#9d7cff]/15 border-[#9d7cff] text-white shadow-[0_4px_16px_rgba(0,0,0,0.3)] font-black ring-1 ring-[#9d7cff]/50'
                                                    : 'bg-black/30 border-white/10 text-slate-300 hover:border-[#9d7cff]/50 hover:text-white'
                                            }`}
                                        >
                                            {p === 'PlayStation' && <PlayStationIcon className={`w-4 h-4 ${active ? 'text-[#9d7cff]' : 'text-slate-400'}`} />}
                                            {p === 'Xbox' && <XboxIcon className={`w-4 h-4 ${active ? 'text-[#9d7cff]' : 'text-slate-400'}`} />}
                                            {p === 'PC' && <PcIcon className={`w-4 h-4 ${active ? 'text-[#9d7cff]' : 'text-slate-400'}`} />}
                                            <span>{p}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <label className="block text-sm font-bold text-slate-300 mb-2" htmlFor="boost-amount">{t(isCS2 ? 'commendsAmount' : 'boostAmount')}</label>
                            <select id="boost-amount" value={boostAmount} onChange={(event) => setBoostAmount(event.target.value)} className="w-full bg-[#171229] border border-white/10 rounded-lg p-3 text-white focus:border-[#9d7cff] focus-visible:ring-2 focus-visible:ring-[#9d7cff]/40 focus-visible:outline-none">
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
                            <button type="button" onClick={handleAddToCart} className="w-full mt-7 bg-[#9d7cff] hover:bg-white text-[#0d0914] font-black uppercase tracking-wide py-4 rounded-lg transition-all duration-200 active:scale-[0.98] hover:shadow-[0_0_20px_rgba(157,124,255,0.4)] focus-visible:ring-2 focus-visible:ring-[#9d7cff] focus-visible:outline-none cursor-pointer">
                                {added ? t('addedToCart') : t('addConfiguration')}
                            </button>
                            {added && <Link href="/checkout" className="block text-center text-sm text-[#9d7cff] hover:text-white mt-4">{t('proceedToCheckout')}</Link>}
                        </section>
                    )}
                </div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {relatedProducts.map((related, index) => (
                            <ProductCard key={related.id} product={related} index={index} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}