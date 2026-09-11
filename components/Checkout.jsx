'use client';
import { useCartStore } from '../store/useCartStore';
import { toast } from 'react-toastify';

export default function Checkout() {
    const { cart, getTotal, clearCart } = useCartStore();

    if (cart.length === 0) return null;

    const handleMockCheckout = () => {
        toast.info(`Iniciando compra segura por $${getTotal()} USD.`);
        clearCart();
        toast.success('Pedido preparado correctamente.');
    };

    return (
        <div className="panel-surface p-6 rounded-2xl relative overflow-hidden">
            <h2 className="display-font text-2xl mb-2 uppercase relative z-10 text-slate-100">
                Finalizar Compra
            </h2>
            <p className="text-slate-400 text-sm mb-6 relative z-10">
                Selecciona tu método. Transacciones protegidas de extremo a extremo.
            </p>

            <div className="space-y-4 relative z-10">
                <button
                    onClick={handleMockCheckout}
                    className="w-full flex justify-center items-center gap-2 bg-[#ffdf39] text-black font-black py-4 px-6 rounded-lg hover:bg-white transition-all"
                >
                    Pagar con PayPal
                </button>

                <button
                    onClick={handleMockCheckout}
                    className="w-full flex justify-center items-center gap-2 bg-black/20 border border-white/10 text-white font-bold py-4 px-6 rounded-lg hover:border-lime-300/50 transition-all group"
                >
                    <span className="text-lime-300 group-hover:text-white transition-colors">◆</span>
                    Pagar con Web3 (Crypto)
                </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 opacity-60 relative z-10">
                <span className="text-xs text-slate-400 flex items-center gap-1">SSL Secure</span>
                <span className="text-xs text-slate-400 flex items-center gap-1">Anti-Ban Protection</span>
            </div>
        </div>
    );
}