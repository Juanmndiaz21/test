import Link from 'next/link';
import type { ReactNode } from 'react';
import './globals.css'; // Asegúrate de importar tus estilos de Tailwind
import AuthSession from '../components/AuthSession';
import UserNav from '../components/UserNav';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="text-slate-50 selection:bg-lime-300 selection:text-black min-h-screen flex flex-col">
        <AuthSession>
          <header className="border-b border-lime-300/10 bg-[#0b0d0c]/90 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-5 py-4 flex justify-between items-center gap-5">
              <Link href="/" className="display-font text-2xl text-lime-300 shrink-0">
                BOOST<span className="text-white">/PRO</span>
              </Link>

              <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-400">
                <Link href="/" className="hover:text-lime-300 transition-colors">Inicio</Link>
                <Link href="/store" className="hover:text-lime-300 transition-colors">Browse games</Link>
                <Link href="/help" className="hover:text-lime-300 transition-colors">Soporte</Link>
                <Link href="/checkout" className="text-lime-300 hover:text-white transition-colors">Carrito</Link>
              </nav>

              <UserNav />
            </div>
          </header>

          <main className="flex-grow">
            {children}
          </main>
        </AuthSession>
      </body>
    </html>
  );
}