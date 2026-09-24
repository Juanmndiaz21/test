import { redirect } from "next/navigation";
import { getAdminSession } from '../../lib/guard';
import AuthSession from '../../components/AuthSession';
import AdminNav from './AdminNav';
import SiteHeader from '../../components/SiteHeader';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import '../globals.css';

export const metadata = {
    title: 'Admin · OGmodz',
    description: 'OGmodz control room — orders, products and users.',
};

export default async function AdminLayout({ children }) {
    const session = await getAdminSession();

    if (!session) {
        redirect('/login');
    }

    let messages;
    let locale = 'es';
    try {
        messages = await getMessages();
        locale = await getLocale();
    } catch {
        messages = (await import('../../messages/es.json')).default;
    }

    return (
        <html lang={locale} suppressHydrationWarning>
            <body suppressHydrationWarning className="text-slate-200 min-h-screen selection:bg-[#9d7cff] selection:text-[#0d0914] flex flex-col">
                <AuthSession>
                    <NextIntlClientProvider messages={messages} locale={locale}>
                        <SiteHeader />
                        <div className="flex flex-grow">
                            <aside className="w-64 bg-[#171229] border-r border-white/10 p-6 flex flex-col gap-4 min-h-[calc(100vh-65px)] shrink-0">
                                <AdminNav email={session.user.email} role={session.user.role} />
                            </aside>

                            <section className="flex-grow p-6 lg:p-10 overflow-x-auto min-w-0">
                                {children}
                            </section>
                        </div>
                    </NextIntlClientProvider>
                </AuthSession>
            </body>
        </html>
    );
}