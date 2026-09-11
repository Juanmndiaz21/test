'use client';
import { useCartStore } from '../store/useCartStore';

export default function Cart() {
    const { cart, getTotal, clearCart } = useCartStore();

    if (cart.length === 0) return null;

    return (
        <div className="panel-surface p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="display-font text-2xl uppercase text-slate-200">Tu selección</h2>
                <button onClick={clearCart} className="text-xs text-red-300 hover:text-white transition-colors">
                    Vaciar Lista
                </button>
            </div>

            <ul className="space-y-4 mb-6">
                {cart.map((item, index) => (
                    <li key={index} className="flex justify-between items-center bg-black/20 p-4 rounded-lg border border-white/10">
                        <span className="font-medium text-slate-200">{item.name}</span>
                        <span className="font-bold text-lime-300">${item.price}</span>
                    </li>
                ))}
            </ul>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                <span className="text-slate-400 uppercase text-sm font-bold">Total estimado</span>
                <div className="text-right text-3xl font-black text-white">
                    ${getTotal()} <span className="text-lg text-slate-500 font-medium">USD</span>
                </div>
            </div>
        </div>
    );
}