import Link from 'next/link';
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
    const session = await getServerSession();

    if (!session) {
        redirect('/login');
    }

    return (
        // Reemplazamos <html> y <body> por un simple <div>
        <div className="flex text-slate-200">
            <aside className="w-64 bg-[#111512] border-r border-lime-300/10 p-6 flex flex-col gap-4 min-h-screen">
                <div className="display-font text-xl text-lime-300 mb-8">
                    CONTROL ROOM
                </div>

                <div className="text-xs text-slate-500 mb-4 bg-slate-950 p-2 rounded border border-slate-800">
                    Admin: {session.user.email}
                </div>

                <nav className="flex flex-col gap-3 font-medium">
                    <Link href="/admin/products" className="hover:text-lime-300 transition-colors">Productos</Link>
                    <Link href="/admin/help" className="hover:text-lime-300 transition-colors">Editar ayuda</Link>
                    <Link href="/" className="text-slate-500 hover:text-slate-300 mt-10 text-sm">Volver a la tienda</Link>
                </nav>
            </aside>

            <section className="flex-grow p-10">
                {children}
            </section>
        </div>
    );
}