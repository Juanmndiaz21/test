import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '../i18n/navigation';
import Icon from './Icon';

export default async function Footer() {
    const t = await getTranslations('footer');
    const common = await getTranslations('common');
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-white/[0.06] bg-zinc-950 text-zinc-400">
            <div className="max-w-7xl mx-auto px-5 py-12 md:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
                    {/* Brand column */}
                    <div className="sm:col-span-2">
                        <Link href="/" aria-label={common('brand')} className="inline-block">
                            <Image
                                src="/logo-v3.svg"
                                alt={common('brand')}
                                width={922}
                                height={176}
                                className="h-8 md:h-9 w-auto object-contain"
                            />
                        </Link>
                        <p className="text-sm text-zinc-400 mt-4 max-w-sm leading-relaxed">
                            {t('tagline')}
                        </p>
                        <div className="mt-6 flex items-center gap-2 text-xs font-mono text-zinc-400">
                            <span className="relative flex h-2 w-2" aria-hidden="true">
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                            </span>
                            <span className="data-readout tracking-wider uppercase text-emerald-400/90">VERIFIED BOOSTING MARKETPLACE</span>
                        </div>

                        {/* Social Links */}
                        <div className="mt-6 flex items-center gap-3">
                            <a
                                href="https://discord.gg/qwyQjn4Aqx"
                                target="_blank"
                                rel="nofollow noopener noreferrer"
                                aria-label="Join our Discord community"
                                title="Discord"
                                className="w-10 h-10 rounded-xl bg-zinc-900 hover:bg-[#5865F2] text-zinc-300 hover:text-white border border-white/10 hover:border-[#5865F2] flex items-center justify-center transition-[background-color,border-color,color,transform] duration-150 ease-out hover:scale-105 active:scale-95 shadow-sm"
                            >
                                <Icon name="discord" className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Col 1: Platform / Explore */}
                    <div>
                        <p className="font-['Trebuchet_MS',sans-serif] text-xs font-bold uppercase tracking-wider text-white mb-4">
                            {t('navPlatform')}
                        </p>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/" className="text-zinc-400 hover:text-emerald-400 transition-colors">{common('home')}</Link>
                            </li>
                            <li>
                                <Link href="/store" className="text-zinc-400 hover:text-emerald-400 transition-colors">{common('store')}</Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-zinc-400 hover:text-emerald-400 transition-colors">About Us</Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-zinc-400 hover:text-emerald-400 transition-colors">Blog & Guides</Link>
                            </li>
                            <li>
                                <Link href="/help" className="text-zinc-400 hover:text-emerald-400 transition-colors">{common('support')}</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 2: Support & Careers */}
                    <div>
                        <p className="font-['Trebuchet_MS',sans-serif] text-xs font-bold uppercase tracking-wider text-white mb-4">
                            {t('navSupport')}
                        </p>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/contact" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                                    {t('contactUs')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/work-with-us" className="text-zinc-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-2">
                                    <span>{t('workWithUs')}</span>
                                    <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                                        HIRING
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="https://discord.gg/qwyQjn4Aqx"
                                    target="_blank"
                                    rel="nofollow noopener noreferrer"
                                    className="text-zinc-400 hover:text-[#5865F2] transition-colors inline-flex items-center gap-1.5"
                                >
                                    <Icon name="discord" className="w-3.5 h-3.5 text-[#5865F2]" />
                                    <span>Discord Community</span>
                                </a>
                            </li>
                            <li>
                                <Link href="/refunds" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                                    {t('refunds')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 3: Legal & Policies */}
                    <div>
                        <p className="font-['Trebuchet_MS',sans-serif] text-xs font-bold uppercase tracking-wider text-white mb-4">
                            {t('navLegal')}
                        </p>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/terms" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                                    {t('terms')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                                    {t('privacy')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/refunds" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                                    {t('refunds')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies" className="text-zinc-400 hover:text-emerald-400 transition-colors">
                                    Cookie Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Business Info & Trademark Disclaimer Banner */}
                <div className="mt-12 pt-8 border-t border-white/[0.06] text-xs text-zinc-400 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-zinc-300">
                        <div>
                            <span className="font-bold text-white">OGmodz Marketplace</span> · Operated for independent digital gaming services & coaching.
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono">
                            <span>Email: <a href="mailto:support@ogmodz.com" className="text-emerald-400 hover:underline">support@ogmodz.com</a></span>
                            <span>·</span>
                            <span>Avg. Response: &lt; 24h</span>
                        </div>
                    </div>
                    <p className="text-[11px] leading-relaxed text-zinc-500">
                        <strong className="text-zinc-400">Trademark & Copyright Disclaimer:</strong> Grand Theft Auto, GTA V, Counter-Strike 2, CS2, Red Dead Redemption 2, Steam, PlayStation, Xbox, and all associated brand names and logos are registered trademarks of their respective owners (Take-Two Interactive, Rockstar Games, Valve Corporation, Sony Interactive Entertainment, Microsoft Corporation). OGmodz is an independent service marketplace and is not affiliated with, endorsed by, or authorized by any game developer or publisher.
                    </p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/[0.04] bg-zinc-950/80">
                <div className="max-w-7xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
                    <span>{t('rights', { year })} · All trademarks belong to their respective owners.</span>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://discord.gg/qwyQjn4Aqx"
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-[#5865F2] transition-colors"
                            aria-label="Discord Community"
                        >
                            <Icon name="discord" className="w-4 h-4 text-[#5865F2]" />
                            <span className="font-medium text-zinc-400 hover:text-white">Discord</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}