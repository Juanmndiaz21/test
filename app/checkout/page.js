import Cart from '../../components/Cart';
import CheckoutPanel from '../../components/Checkout';

export default function CheckoutPage() {
    return (
        <div className="max-w-7xl mx-auto px-5 py-12 md:py-16 space-y-8">
            <div><p className="eyebrow mb-3">Último paso</p><h1 className="display-font text-5xl uppercase text-white">Finalizar orden</h1></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <Cart />
                <CheckoutPanel />
            </div>
        </div>
    );
}