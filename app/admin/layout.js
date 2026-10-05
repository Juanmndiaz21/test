import { redirect } from 'next/navigation';
import { getAdminSession } from '../../lib/guard';
import AuthSession from '../../components/AuthSession';
import AdminShell from '../../components/AdminShell';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import BisSkinCleaner from '../../components/BisSkinCleaner';
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
    let locale = 'en';
    try {
        messages = await getMessages();
        locale = await getLocale();
    } catch {
        messages = (await import('../../messages/en.json')).default;
    }

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <BisSkinCleaner />
            </head>
            <body suppressHydrationWarning className="text-slate-200 min-h-screen selection:bg-[#9225CF]/30 selection:text-purple-300 bg-zinc-950 overflow-hidden">
                <AuthSession>
                    <NextIntlClientProvider messages={messages} locale={locale}>
                        <AdminShell user={session.user}>
                            {children}
                        </AdminShell>
                    </NextIntlClientProvider>
                </AuthSession>
            </body>
        </html>
    );
}