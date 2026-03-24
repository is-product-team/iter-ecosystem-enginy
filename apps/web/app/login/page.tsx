'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login as apiLogin } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@iter/shared';
import Loading from '@/components/Loading';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProfessorLink, setShowProfessorLink] = useState(false);
  const router = useRouter();
  const { user, login, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      const role = user.rol?.nom_rol;
      if (role === 'ADMIN') {
        router.push('/admin');
      } else if (role === 'COORDINADOR') {
        router.push('/centro');
      }
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <Loading fullScreen message="Iniciant sessió..." />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowProfessorLink(false);
    setLoading(true);

    try {
      const response = await apiLogin(email, password);
      const { user, token } = response;

      if (user.rol?.nom_rol === 'PROFESSOR') {
        setShowProfessorLink(true);
      } else {
        login(user, token);
        const role = user.rol?.nom_rol;
        if (role === 'ADMIN') {
          router.push('/admin');
        } else if (role === 'COORDINADOR') {
          router.push('/centro');
        }
      }
    } catch (err: any) {
      // Improved error messaging based on backend response or common errors
      if (err.message.includes('401') || err.message.toLowerCase().includes('inválidas')) {
        setError('Correu o contrasenya incorrectes. Torna-ho a provar.');
      } else if (err.message.includes('fetch') || err.message.includes('network')) {
        setError('Error de conexió. Comprova que el servidor estigui actiu.');
      } else {
        setError(err.message || 'S\'ha produït un error inesperat.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background-page">
      <div className="w-full max-w-md bg-background-surface p-12 border border-border-subtle shadow-xl">
        <div className="text-center mb-12">
          <div className="w-32 h-32 bg-background-surface flex items-center justify-center mx-auto mb-6">
            <img
              src="/logo.png"
              alt="Iter Logo"
              className="w-full h-full object-contain dark:invert"
            />
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-text-primary uppercase leading-none">Iter</h2>
          <div className="h-1 w-12 bg-consorci-darkBlue mx-auto mt-2"></div>
          <p className="text-text-primary text-[10px] font-black uppercase tracking-[0.3em] mt-4 opacity-70">Gestió d'Aprenentatge</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 mb-8 text-xs font-bold flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {showProfessorLink ? (
          <div className="bg-background-subtle p-10 text-center animate-in fade-in zoom-in duration-300">
            <h3 className="text-xl font-black text-consorci-darkBlue uppercase mb-4 tracking-tight">Accés via App Mòbil</h3>
            <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-8 leading-relaxed">
              Com a professor, has d'utilitzar l'aplicació mòbil d'Iter per gestionar les teves sessions.
            </p>
            <a
              href="#"
              className="group relative flex items-center justify-center w-full py-4 bg-consorci-darkBlue text-white text-xs font-bold uppercase tracking-widest transition-all hover:bg-consorci-actionBlue active:scale-95"
              onClick={(e) => { e.preventDefault(); toast.info('Enllaç de descàrrega pròximament (Expo Go / TestFlight)'); }}
            >
              <span>Descarregar App Iter</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <button
              onClick={() => setShowProfessorLink(false)}
              className="mt-8 text-[10px] font-black text-consorci-lightBlue hover:text-consorci-darkBlue tracking-[0.2em] uppercase transition-colors"
            >
              ← Tornar al login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-text-primary text-[10px] font-black uppercase tracking-widest px-1">Correu Electrònic</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue focus:bg-background-surface transition-all font-bold text-sm text-text-primary placeholder:text-text-muted outline-none"
                placeholder="coordinador@centre.cat"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-text-primary text-[10px] font-black uppercase tracking-widest px-1">Contrasenya</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-background-subtle border border-border-subtle focus:border-consorci-darkBlue focus:bg-background-surface transition-all font-bold text-sm text-text-primary placeholder:text-text-muted pr-12 outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-consorci-darkBlue transition-colors p-1"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26a4 4 0 015.493 5.493l-5.493-5.493z" clipRule="evenodd" />
                      <path d="M12.454 15.697A9.75 9.75 0 0110 16c-4.478 0-8.268-2.943-9.542-7a10.018 10.018 0 012.182-3.159L5.43 8.632A4 4 0 0010 13.5l2.454 2.197z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-consorci-darkBlue hover:bg-black text-white text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-blue-900/10 flex items-center justify-center gap-4"
            >
              {loading ? (
                <>
                  <Loading size="sm" white message="" />
                  <span>Accedint...</span>
                </>
              ) : 'Entrar al Programa'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
