import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '../i18n/navigation';

export default async function Footer() {
    const t = await getTranslations('footer');
    const common = await getTranslations('common');
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-lime-300/10 bg-[#0d0914]/90">
            <div className="max-w-7xl mx-auto px-5 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Link href="/" aria-label={common('brand')}>
                        <Image
                            src="/logo.png"
                            alt={common('brand')}
                            width={886}
                            height={281}
                            className="h-8 w-auto"
                        />
                    </Link>
                    <p className="text-sm text-slate-400 mt-3 max-w-sm">
                        {t('tagline')}
                    </p>
                </div>

                <nav className="flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-400" aria-label={t('navTitle')}>
                    <Link href="/" className="hover:text-lime-300 transition-colors">{common('home')}</Link>
                    <Link href="/store" className="hover:text-lime-300 transition-colors">{common('store')}</Link>
                    <Link href="/help" className="hover:text-lime-300 transition-colors">{common('support')}</Link>
                    <Link href="/contact" className="hover:text-lime-300 transition-colors">{common('contact')}</Link>
                </nav>
            </div>

            <div className="border-t border-white/5">
                <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
                    <span>{t('rights', { year })}</span>
                    <span>{t('demoDisclaimer')}</span>
                </div>
            </div>
        </footer>
    );
}