export default function Help() {
    return (
        <div className="max-w-4xl mx-auto px-5 py-12 md:py-16">
            <p className="eyebrow mb-3">Estamos para ayudarte</p>
            <h1 className="display-font text-5xl uppercase text-white mb-10">Centro de ayuda</h1>

            <div className="space-y-6">
                <div className="panel-surface p-6 rounded-2xl">
                    <h2 className="text-xl font-bold text-lime-300 mb-2">¿Es seguro para mi cuenta principal?</h2>
                    <p className="text-slate-400">Sí. Utilizamos métodos de inyección seguros y VPNs residenciales para evitar cualquier tipo de flag en los sistemas antitrampas. Riesgo de ban del 0%.</p>
                </div>

                <div className="panel-surface p-6 rounded-2xl">
                    <h2 className="text-xl font-bold text-lime-300 mb-2">¿Cómo funcionan los pagos Crypto?</h2>
                    <p className="text-slate-400">Al seleccionar Web3 en el Checkout, tu wallet se conectará mediante ethers.js. Una vez confirmada la transacción en la blockchain, el pedido se procesa automáticamente.</p>
                </div>
            </div>
        </div>
    );
}