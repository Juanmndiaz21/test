'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from '../utils/toast';
import { useCartStore } from '../store/useCartStore';
import { Link } from '../i18n/navigation';
import EditableContentSection from './EditableContentSection';
import GameArt from './GameArt';

const platforms = ['PC', 'PlayStation', 'Xbox', 'All'];
const boostOptions = [100, 200, 500];
const splitContent = (value, fallback) => (value ? value.split('\n').map((item) => item.trim()).filter(Boolean) : fallback);

export default function ProductDetail({ product, relatedProducts = [] }) {
    const t = useTranslations('product');
    const common = useTranslations('common');
    const addToCart = useCartStore((state) => state.addToCart);
    const [platform, setPlatform] = useState(product.platform || 'PC');
    const [boostAmount, setBoostAmount] = useState(String(product.boost_amount || 100));
    const [added, setAdded] = useState(false);

    const handleAddToCart = () => {
        addToCart({
            ...product,
            platform,
            boost_amount: Number(boostAmount),
            name: `${product.name} · ${platform} · ${boostAmount}M`,
        });
        setAdded(true);
        toast.success(t('toastAdded', { platform, boost: boostAmount }));
    };

    return (
        <div className="max-w-7xl mx-auto px-5 py-12 md:py-16">
            <Link href={`/store/game/${encodeURIComponent(product.game || 'General')}`} className="text-sm text-slate-400 hover:text-lime-300 transition-colors">{t('backTo', { game: product.game || 'game' })}</Link>
            <div className="grid lg:grid-cols-[1fr_0.8fr] gap-8 mt-8 items-start">
                <section className="panel-surface rounded-2xl p-7 md:p-10">
                    <GameArt name={product.name} image_url={product.image_url} className="w-full aspect-video rounded-xl mb-8" />
                    <div className="flex justify-between gap-4 mb-8">
                        <span className="eyebrow">{common('allPlatforms')}</span>
                        <span className="text-xs text-lime-300 border border-lime-300/20 rounded-full px-3 py-1">{common('available')}</span>
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
                    <p className="eyebrow mb-3">{t('matchConfig')}</p>
                    <h2 className="text-2xl font-black text-white mb-7">{t('configureBoost')}</h2>

                    <label className="block text-sm font-bold text-slate-300 mb-2" htmlFor="platform">{t('platform')}</label>
                    <select id="platform" value={platform} onChange={(event) => setPlatform(event.target.value)} className="w-full bg-[#171229] border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none mb-6">
                        {platforms.map((option) => <option key={option}>{option}</option>)}
                    </select>

                    <label className="block text-sm font-bold text-slate-300 mb-2" htmlFor="boost-amount">{t('boostAmount')}</label>
                    <select id="boost-amount" value={boostAmount} onChange={(event) => setBoostAmount(event.target.value)} className="w-full bg-[#171229] border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none">
                        {boostOptions.map((option) => <option key={option} value={option}>{option}M</option>)}
                    </select>

                    <div className="flex justify-between items-end mt-8 pt-6 border-t border-white/10">
                        <span className="text-slate-400">{t('servicePrice')}</span>
                        <strong className="text-4xl text-white">${product.price}<small className="text-base text-slate-400 ml-1">{common('usd')}</small></strong>
                    </div>
                    <button type="button" onClick={handleAddToCart} className="w-full mt-7 bg-lime-300 hover:bg-white text-black font-black uppercase tracking-wide py-4 rounded-lg transition-colors">
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

            {relatedProducts.length > 0 && <section className="mt-16 border-t border-white/10 pt-12"><div className="flex items-center gap-4 mb-6"><h2 className="display-font text-4xl uppercase text-white">{t('relatedTitle')}</h2><div className="h-px bg-white/10 flex-1" /></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{relatedProducts.map((related) => <Link key={related.id} href={`/store/${related.id}`} className="panel-surface rounded-xl p-4 hover:border-lime-300/50 transition-colors"><p className="eyebrow mb-3">{common('allPlatforms')}</p><h3 className="font-black text-white">{related.name}</h3><strong className="block text-lime-300 text-xl mt-4">${related.price}</strong></Link>)}</div></section>}
        </div>
    );
}