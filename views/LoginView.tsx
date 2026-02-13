
import React, { useState } from 'react';
import { LogIn } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="bg-[#111827] w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <span className="text-white text-3xl font-bold">A</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Altittus</h1>
        <p className="text-slate-500 mt-2">Elevating your potential</p>
      </div>

      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 mb-6 text-center">Acceso al Sistema</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
              placeholder="admin@altittus.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#111827] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Iniciando...' : (
              <>
                <LogIn size={18} />
                Entrar
              </>
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-slate-400 hover:text-orange-500 transition-colors">¿Olvidaste tu contraseña?</a>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-xs">Altittus HRM System v1.0.0 &copy; 2024</p>
    </div>
  );
};

export default LoginView;
