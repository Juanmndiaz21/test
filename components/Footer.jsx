import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '../i18n/navigation';

export default async function Footer() {
    const t = await getTranslations('footer');
    const common = await getTranslations('common');
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-white/10 bg-[#0d0914]/95 text-slate-400">
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
                        <p className="text-sm text-slate-300 mt-4 max-w-sm leading-relaxed">
                            {t('tagline')}
                        </p>
                        <div className="mt-6 flex items-center gap-2 text-xs font-mono text-slate-400">
                            <span className="relative flex h-2 w-2" aria-hidden="true">
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9d7cff]" />
                            </span>
                            <span className="data-readout tracking-wider uppercase">VERIFIED BOOSTING MARKETPLACE</span>
                        </div>
                    </div>

                    {/* Col 1: Platform / Explore */}
                    <div>
                        <h3 className="font-['Trebuchet_MS',sans-serif] text-xs font-bold uppercase tracking-wider text-white mb-4">
                            {t('navPlatform')}
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/" className="text-slate-300 hover:text-[#9d7cff] transition-colors">{common('home')}</Link>
                            </li>
                            <li>
                                <Link href="/store" className="text-slate-300 hover:text-[#9d7cff] transition-colors">{common('store')}</Link>
                            </li>
                            <li>
                                <Link href="/help" className="text-slate-300 hover:text-[#9d7cff] transition-colors">{common('support')}</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 2: Support & Careers */}
                    <div>
                        <h3 className="font-['Trebuchet_MS',sans-serif] text-xs font-bold uppercase tracking-wider text-white mb-4">
                            {t('navSupport')}
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/contact" className="text-slate-300 hover:text-[#9d7cff] transition-colors">
                                    {t('contactUs')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/work-with-us" className="text-slate-300 hover:text-[#9d7cff] transition-colors inline-flex items-center gap-2">
                                    <span>{t('workWithUs')}</span>
                                    <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#9d7cff]/10 text-[#9d7cff] border border-[#9d7cff]/20 uppercase">
                                        HIRING
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/refunds" className="text-slate-300 hover:text-[#9d7cff] transition-colors">
                                    {t('refunds')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 3: Legal & Policies */}
                    <div>
                        <h3 className="font-['Trebuchet_MS',sans-serif] text-xs font-bold uppercase tracking-wider text-white mb-4">
                            {t('navLegal')}
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/terms" className="text-slate-300 hover:text-[#9d7cff] transition-colors">
                                    {t('terms')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-slate-300 hover:text-[#9d7cff] transition-colors">
                                    {t('privacy')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/5 bg-black/40">
                <div className="max-w-7xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                    <span>{t('rights', { year })}</span>
                    <span>{t('demoDisclaimer')}</span>
                </div>
            </div>
        </footer>
    );
}