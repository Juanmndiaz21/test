'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { registerUser } from './actions';
import { toast } from 'react-toastify';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Para mostrar si está cargando
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                const res = await signIn('credentials', {
                    redirect: false,
                    email,
                    password,
                });

                if (res.error) {
                    setError('Credenciales inválidas. Verifica tu correo y contraseña.');
                } else {
                    toast.success('Inicio de sesión exitoso. Bienvenido a BOOST/PRO.');
                    router.push('/');
                    router.refresh();
                }
            } else {
                const res = await registerUser(email, password);
                if (res.success) {
                    toast.success('Cuenta creada. Ya puedes iniciar sesión.');
                    setIsLogin(true);
                }
            }
        } catch (err) {
            console.error("Error en el formulario:", err);
            // Muestra el error real en la pantalla
            setError(err.message || 'Ocurrió un error al conectar con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-5">
            <div className="w-full max-w-md panel-surface p-8 rounded-2xl relative overflow-hidden">

                <p className="eyebrow mb-3">Access terminal</p>
                <h2 className="display-font text-4xl text-white mb-2 tracking-tight">
                    BOOST<span className="text-lime-300">/PRO</span>
                </h2>
                <p className="text-sm text-slate-500 mb-7">Gestiona tu progreso y tus servicios desde un solo lugar.</p>

                {/* Aquí se mostrará el mensaje de error si algo falla */}
                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Email</label>
                        <input
                            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Contraseña</label>
                        <input
                            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-lime-300 hover:bg-white disabled:bg-slate-700 text-black font-black py-3 px-4 rounded-lg transition-all mt-4"
                    >
                        {isLoading ? 'PROCESANDO...' : (isLogin ? 'ACCEDER AL PANEL' : 'CREAR ADMINISTRADOR')}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-slate-500">
                    {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-lime-300 hover:text-white font-bold transition-colors cursor-pointer">
                        {isLogin ? "Sign Up (Crear admin)" : "Sign In (Iniciar sesión)"}
                    </button>
                </p>
            </div>
        </div>
    );
}