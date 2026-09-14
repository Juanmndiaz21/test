import { redirect } from "next/navigation";
import { getAdminSession } from '../../lib/guard';
import AuthSession from '../../components/AuthSession';
import AdminNav from './AdminNav';
import '../globals.css';

export const metadata = {
    title: 'Admin · Rowmodz',
    description: 'Rowmodz control room — orders, products and users.',
};

export default async function AdminLayout({ children }) {
    const session = await getAdminSession();

    if (!session) {
        redirect('/login');
    }

    return (
        <html lang="en">
            <body className="text-slate-200 min-h-screen selection:bg-lime-300 selection:text-black">
                <AuthSession>
                    <div className="flex">
                        <aside className="w-64 bg-[#171229] border-r border-lime-300/10 p-6 flex flex-col gap-4 min-h-screen">
                            <AdminNav email={session.user.email} role={session.user.role} />
                        </aside>

                        <section className="flex-grow p-10">
                            {children}
                        </section>
                    </div>
                </AuthSession>
            </body>
        </html>
    );
}