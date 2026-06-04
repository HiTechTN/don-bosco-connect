import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, GraduationCap, Sparkles, Shield } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { DEMO_ACCOUNTS } from '../../lib/constants';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      // Server sets HttpOnly cookies; response contains user data
      const user = data.user;
      if (user) {
        login(user);
        const role = user.role;
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'teacher') navigate('/teacher/dashboard');
        else if (role === 'student') navigate('/student/dashboard');
        else if (role === 'parent') navigate('/parent/dashboard');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail;
      if (errorMessage?.includes('non trouvé')) {
        setError('Aucun compte trouvé avec cet email');
      } else if (errorMessage?.includes('désactivé')) {
        setError('Votre compte est désactivé. Contactez l\'administration.');
      } else if (errorMessage?.includes('verrouillé')) {
        setError('Compte temporairement verrouillé. Réessayez dans 15 minutes.');
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = DEMO_ACCOUNTS;

  const fillDemo = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="login-premium min-h-screen flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-100/50 to-purple-100/50 rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="login-box relative"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg"
          >
            <GraduationCap className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Don Bosco <span className="text-gradient">Connect</span>
          </h1>
          <p className="text-slate-500">Plateforme éducative intelligente</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3"
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                className="input-premium pl-12"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input-premium pl-12 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-premium relative overflow-hidden"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Connexion...
              </span>
            ) : (
              <>
                <span className="relative z-10">Se connecter</span>
                <Sparkles className="absolute right-4 w-4 h-4 opacity-50" />
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-400 text-center mb-4">Comptes de démonstration</p>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                onClick={() => fillDemo(account)}
                className="text-xs py-2 px-3 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors text-slate-600"
              >
                {account.role}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          🔒 Connexion sécurisée • Données chiffrées
        </p>
      </motion.div>
    </div>
  );
}