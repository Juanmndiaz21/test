'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCartStore } from '../store/useCartStore';
import EditableContentSection from './EditableContentSection';

const platforms = ['PC', 'PlayStation', 'Xbox', 'Todas'];
const boostOptions = [100, 200, 500];
const splitContent = (value, fallback) => (value ? value.split('\n').map((item) => item.trim()).filter(Boolean) : fallback);

export default function ProductDetail({ product, relatedProducts = [] }) {
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
        toast.success(`Añadido: ${platform} · ${boostAmount}M boost`);
    };

    return (
        <div className="max-w-7xl mx-auto px-5 py-12 md:py-16">
            <Link href={`/store/game/${encodeURIComponent(product.game || 'General')}`} className="text-sm text-slate-400 hover:text-lime-300 transition-colors">← Back to {product.game || 'game'}</Link>
            <div className="grid lg:grid-cols-[1fr_0.8fr] gap-8 mt-8 items-start">
                <section className="panel-surface rounded-2xl p-7 md:p-10">
                    {product.image_url && <img src={product.image_url} alt={product.name} className="w-full aspect-video object-cover rounded-xl mb-8 border border-white/10" />}
                    <div className="flex justify-between gap-4 mb-8">
                        <span className="eyebrow">Servicio #{product.id}</span>
                        <span className="text-xs text-lime-300 border border-lime-300/20 rounded-full px-3 py-1">Disponible</span>
                    </div>
                    <h1 className="display-font text-5xl md:text-7xl uppercase text-white leading-[0.95]">{product.name}</h1>
                    <p className="text-slate-400 text-lg leading-relaxed mt-7">
                        {product.description || 'Mejora tu cuenta o sube de rango de forma rápida y segura.'}
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3 mt-10 pt-7 border-t border-white/10 text-sm">
                        <div><span className="text-slate-500 block">Entrega estimada</span><strong className="text-white">Hasta 24 horas</strong></div>
                        <div><span className="text-slate-500 block">Protección</span><strong className="text-white">Checkout seguro</strong></div>
                        <div><span className="text-slate-500 block">Soporte</span><strong className="text-white">24/7 activo</strong></div>
                    </div>
                </section>

                <section className="panel-surface rounded-2xl p-7 md:p-8 lg:sticky lg:top-28">
                    <p className="eyebrow mb-3">Personaliza tu servicio</p>
                    <h2 className="text-2xl font-black text-white mb-7">Configura tu boost</h2>

                    <label className="block text-sm font-bold text-slate-300 mb-2" htmlFor="platform">Plataforma</label>
                    <select id="platform" value={platform} onChange={(event) => setPlatform(event.target.value)} className="w-full bg-[#111512] border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none mb-6">
                        {platforms.map((option) => <option key={option}>{option}</option>)}
                    </select>

                    <label className="block text-sm font-bold text-slate-300 mb-2" htmlFor="boost-amount">Cantidad de dinero</label>
                    <select id="boost-amount" value={boostAmount} onChange={(event) => setBoostAmount(event.target.value)} className="w-full bg-[#111512] border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none">
                        {boostOptions.map((option) => <option key={option} value={option}>{option} millones</option>)}
                    </select>

                    <div className="flex justify-between items-end mt-8 pt-6 border-t border-white/10">
                        <span className="text-slate-500">Precio del servicio</span>
                        <strong className="text-4xl text-white">${product.price}<small className="text-base text-slate-500 ml-1">USD</small></strong>
                    </div>
                    <button type="button" onClick={handleAddToCart} className="w-full mt-7 bg-lime-300 hover:bg-white text-black font-black uppercase tracking-wide py-4 rounded-lg transition-colors">
                        {added ? 'Añadido al carrito' : 'Añadir configuración'}
                    </button>
                    {added && <Link href="/checkout" className="block text-center text-sm text-lime-300 hover:text-white mt-4">Ir al checkout →</Link>}
                </section>
            </div>

            <section className="mt-16 max-w-4xl border-t border-white/10 pt-12">
                <p className="eyebrow mb-3">Service guide</p>
                <EditableContentSection productId={product.id} section="description" title="Description" initialItems={[product.description || 'A reliable service configured around your account goals. Select your platform and boost amount above, then add it to your cart to continue.']} />

                <EditableContentSection productId={product.id} section="how_it_works" title="How It Works" initialItems={splitContent(product.how_it_works, ['Select the platform and service amount you need.', 'Add the configured service to your cart and complete payment.', 'Our team processes your order and contacts you with the next steps.'])} />
                <EditableContentSection productId={product.id} section="requirements" title="Requirements" initialItems={splitContent(product.requirements, ['Provide the correct platform and account details after checkout.', 'Keep the account accessible during the service window.', 'Do not change account credentials while the order is being processed.'])} />
                <EditableContentSection productId={product.id} section="faqs" title="Frequently Asked Questions" initialItems={splitContent(product.faqs, ['How long does delivery take? | Most orders are started within 24 hours.', 'Can I choose another platform later? | Choose the correct platform before adding the service.'])} renderItem={(item) => { const [question, answer] = item.split('|'); return <details><summary className="font-bold text-white cursor-pointer">{question.trim()}</summary><p className="text-slate-400 mt-3">{(answer || 'Contact support for more information.').trim()}</p></details>; }} />
            </section>

            {relatedProducts.length > 0 && <section className="mt-16 border-t border-white/10 pt-12"><div className="flex items-center gap-4 mb-6"><h2 className="display-font text-4xl uppercase text-white">Related products</h2><div className="h-px bg-white/10 flex-1" /></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{relatedProducts.map((related) => <Link key={related.id} href={`/store/${related.id}`} className="panel-surface rounded-xl p-4 hover:border-lime-300/50 transition-colors"><p className="eyebrow mb-3">{related.platform || 'All platforms'}</p><h3 className="font-black text-white">{related.name}</h3><strong className="block text-lime-300 text-xl mt-4">${related.price}</strong></Link>)}</div></section>}
        </div>
    );
}
