'use client';
import { useState } from 'react';

export default function AdminProducts() {
    const [products, setProducts] = useState([
        { id: 1, name: 'GTA V - Cuenta Modded', price: 35 }
    ]);
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState('');

    const handleAddProduct = (e) => {
        e.preventDefault();
        const newProduct = { id: Date.now(), name: newName, price: Number(newPrice) };
        // Aquí harías un POST a tu API route (ej: /api/products)
        setProducts([...products, newProduct]);
        setNewName('');
        setNewPrice('');
    };

    const handleDelete = (id) => {
        // Aquí harías un DELETE a tu API route
        setProducts(products.filter(p => p.id !== id));
    };

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold uppercase mb-8">Gestión de Productos</h1>

            {/* Formulario para agregar */}
            <form onSubmit={handleAddProduct} className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-10 flex gap-4 items-end">
                <div className="flex-grow">
                    <label className="block text-sm text-slate-400 mb-2">Nombre del Servicio</label>
                    <input
                        type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-purple-500 outline-none"
                    />
                </div>
                <div className="w-32">
                    <label className="block text-sm text-slate-400 mb-2">Precio ($)</label>
                    <input
                        type="number" required value={newPrice} onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-purple-500 outline-none"
                    />
                </div>
                <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded transition-colors">
                    Agregar
                </button>
            </form>

            {/* Lista de productos activos */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-800 text-slate-300">
                        <tr>
                            <th className="p-4">Producto</th>
                            <th className="p-4">Precio</th>
                            <th className="p-4 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="border-t border-slate-800">
                                <td className="p-4">{product.name}</td>
                                <td className="p-4 text-emerald-400 font-bold">${product.price}</td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDelete(product.id)} className="text-red-400 hover:text-red-300 font-bold text-sm">
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}