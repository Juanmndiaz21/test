import Link from 'next/link';

export default function Home() {
  return (
    <section className="max-w-7xl mx-auto px-5 py-16 md:py-24">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
        <div>
          <p className="eyebrow mb-6">Boosting premium / entregas rápidas</p>
          <h1 className="display-font text-6xl md:text-8xl leading-[0.9] uppercase max-w-4xl">
            Juega más.<br />
            <span className="text-lime-300">Grindea menos.</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-xl mt-8 leading-relaxed">
            Servicios competitivos para subir de rango, desbloquear progreso y volver a la partida con ventaja.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-10">
            <Link href="/store" className="bg-lime-300 text-black px-7 py-4 rounded-lg font-black uppercase tracking-wide hover:bg-white transition-colors">
              Explorar marketplace
            </Link>
            <Link href="/help" className="border border-lime-300/30 text-slate-200 px-7 py-4 rounded-lg font-bold hover:border-lime-300 hover:text-lime-300 transition-colors">
              Cómo funciona
            </Link>
          </div>
          <div className="flex gap-8 mt-12 text-sm text-slate-500">
            <span><strong className="text-white block text-xl">24/7</strong> soporte activo</span>
            <span><strong className="text-white block text-xl">100%</strong> checkout seguro</span>
            <span><strong className="text-white block text-xl">1 día</strong> entrega media</span>
          </div>
        </div>
        <div className="panel-surface rounded-2xl p-5 rotate-1">
          <div className="border border-lime-300/20 rounded-xl p-6 bg-[#111512]">
            <div className="flex justify-between items-center mb-16">
              <span className="eyebrow">Mission control</span>
              <span className="text-xs text-lime-300 border border-lime-300/30 rounded-full px-3 py-1">LIVE</span>
            </div>
            <div className="space-y-5">
              <div className="flex justify-between text-sm"><span className="text-slate-500">PLAYER STATUS</span><span className="text-lime-300">READY</span></div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden"><div className="h-full w-[82%] bg-lime-300" /></div>
              <div className="flex justify-between items-end pt-5 border-t border-white/10"><span className="text-slate-500 text-sm">NEXT OBJECTIVE</span><strong className="text-2xl">RANK UP</strong></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}