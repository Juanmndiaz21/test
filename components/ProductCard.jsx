'use client';

import { Link } from '../i18n/navigation';
import GameArt from './GameArt';
import PlatformBadges from './PlatformBadges';
import Icon from './Icon';

function getDefaultFeatures(product) {
    const name = String(product?.name || '').toLowerCase();
    const game = String(product?.game || '').toLowerCase();

    if (game.includes('gta') || name.includes('gta')) {
        return ['Cash Amount Selected', 'Rank Amount Selected', 'Fast Run (Optional Addon)'];
    }
    if (game.includes('rdr') || name.includes('rdr')) {
        return ['Gold Bars Included', 'Rank Boost Selected', 'Fast Delivery'];
    }
    if (game.includes('cs') || name.includes('cs2')) {
        return ['Commends Match Selected', 'Safe Factor Boost', 'Instant Queue'];
    }
    return ['Instant Delivery', 'Account Safe Boost', '24/7 Priority Support'];
}

export default function ProductCard({ product, index = 0 }) {
    if (!product) return null;

    const price = Number(product.price) || 0;
    const wasPrice = product.original_price !== null && product.original_price !== undefined
        ? Number(product.original_price)
        : (price > 0 ? Number((price * 1.35).toFixed(2)) : null);

    const rawFeatures = product.features
        ? String(product.features)
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean)
        : null;

    const features = rawFeatures && rawFeatures.length > 0
        ? rawFeatures.slice(0, 3)
        : getDefaultFeatures(product);

    return (
        <div
            className="animate-ladder-row h-full flex flex-col"
            style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
        >
            <Link
                href={`/store/${product.id}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#171229] p-5 flex flex-col justify-between flex-1 transition-[border-color,box-shadow,background-color,transform] duration-180 ease-[var(--ease-out)] hover:border-[#9d7cff]/60 hover:bg-[#1a142c] hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.5),0_0_0_1px_rgba(157,124,255,0.15)] active:scale-[0.985] active:duration-100 focus-visible:outline-2 focus-visible:outline-[#9d7cff] select-none cursor-pointer"
            >
                <div>
                    {/* Artwork with Overlaid Platform Badges */}
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-black/40">
                        <div className="w-full h-full transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.03]">
                            <GameArt
                                name={product.name}
                                image_url={product.image_url}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#171229] via-transparent to-transparent opacity-60" />

                        {/* Platform Icons Floating Badges (Top Right) */}
                        <div className="absolute top-2.5 right-2.5 z-10">
                            <PlatformBadges platform={product.platform} />
                        </div>
                    </div>

                    {/* Product Title */}
                    <h3 className="text-base sm:text-lg font-black text-white leading-snug group-hover:text-[#9d7cff] transition-colors duration-160 line-clamp-2">
                        {product.name}
                    </h3>

                    {/* Bullet Points with Promotion Violet Accent Dots */}
                    <ul className="my-4 space-y-2 text-xs text-slate-300 font-medium">
                        {features.map((feat, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#9d7cff] shrink-0" />
                                <span className="truncate">{feat}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Bottom Row: FROM + WAS strikethrough + Current Price + Arrow Button */}
                <div className="pt-4 border-t border-white/10 mt-2 flex items-end justify-between">
                    <div>
                        <span className="block text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                            FROM
                        </span>
                        {wasPrice && wasPrice > price && (
                            <span className="block text-xs font-mono text-slate-400 line-through decoration-[#9d7cff]/60">
                                WAS ${wasPrice.toFixed(2)}
                            </span>
                        )}
                        <strong className="text-2xl font-black text-[#9d7cff] data-readout leading-tight block">
                            ${price.toFixed(2)}
                        </strong>
                    </div>

                    <span
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/15 text-white flex items-center justify-center group-hover:bg-[#9d7cff] group-hover:text-[#0d0914] group-hover:border-[#9d7cff] group-hover:shadow-[0_4px_14px_rgba(0,0,0,0.3)] group-active:scale-95 transition-[background-color,border-color,color,box-shadow,transform] duration-140 ease-[var(--ease-out)] shrink-0 cursor-pointer"
                        aria-label="View product"
                    >
                        <Icon name="arrow-right" className="w-4 h-4" strokeWidth={2.4} />
                    </span>
                </div>
            </Link>
        </div>
    );
}
