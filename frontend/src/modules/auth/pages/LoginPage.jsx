import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.jsx';
import { useRedirectAfterAuth } from '../../auth/hooks/useRedirectAuth.jsx';
import { validateEmail, validatePassword } from '../../../utils/validators.js';
import Button from '../../../components/ui/Button.jsx';


export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate(); 
  const redirect = useRedirectAfterAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    const ve = validateEmail(email);
    const vp = validatePassword(password, 6);
    const nextErrors = {};
    if (!ve) nextErrors.email = 'Email no válido';
    if (!vp) nextErrors.password = 'Contraseña inválida';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      setSubmitting(true);
      setServerError('');
      await login({ email, password }); // AuthContext guarda token+user
      redirect();                        // redirige por rol
    } catch (err) {
      setServerError(err?.data?.message || 'Credenciales inválidas');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="bg-white/75 backdrop-blur rounded-xl shadow-sm p-6 md:p-8">
          <header className="text-center mb-6">
            <h1 className="font-serif text-3xl text-(--color-primary1)">Iniciar sesión</h1>
            <p className="text-sm text-(--color-secondary1) mt-1">Bienvenido de vuelta</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="flex items-center gap-2 text-sm text-neutral-700">
                <Mail size={18} />
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 outline-none transition
                  ${errors.email ? 'border-red-400 focus:ring-2 ring-red-200' : 'border-neutral-300 focus:border-neutral-500 focus:ring-2 ring-neutral-200'}
                `}
                placeholder="tu@email.com"
                required
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="flex items-center gap-2 text-sm text-neutral-700">
                <Lock size={18} />
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 outline-none transition
                  ${errors.password ? 'border-red-400 focus:ring-2 ring-red-200' : 'border-neutral-300 focus:border-neutral-500 focus:ring-2 ring-neutral-200'}
                `}
                placeholder="••••••••"
                required
              />
              {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
            </div>

            {serverError && (
              <p className="text-sm text-red-600 -mt-2">{serverError}</p>
            )}
            <div className='flex flex-col items-center justify-center w-full'> 
              <Button
                type="submit"
                variant="primary-round"
                className="font-regular px-5 mt-2 mb-0 mx-0 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={submitting}
              >
              {submitting ? 'Entrando…' : 'Iniciar sesión'}
            </Button>

                 <div className="mt-3 text-center">
              <Link
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-muted no-underline hover:opacity-100 hover:text-[var(--color-secondary1)] hover:text-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            </div>
       
         </form>

          <footer className="text-center mt-6 pt-6 border-t border-neutral-200">
            <p className="text-sm text-(--color-primary1) opacity-80">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="underline text-(--color-primary1) hover:opacity-80">
                Regístrate aquí
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </main>
    </div>
  );
}
