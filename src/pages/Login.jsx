import React, { useState } from 'react';
import { Monitor, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const executeLogin = (userEmail) => {
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      try {
        localStorage.setItem('itam_is_logged_in', 'true');
        localStorage.setItem('itam_user_email', userEmail || email);
        if (rememberMe) {
          localStorage.setItem('itam_remember_email', userEmail || email);
        }
      } catch (e) {
        console.warn('LocalStorage error during login:', e);
      }
      setIsLoading(false);
      navigate('/');
    }, 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both Email and Password.');
      return;
    }
    executeLogin(email);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-4 relative overflow-hidden">
      {/* Background Subtle Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md p-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 relative z-10 space-y-6 animate-in fade-in duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary to-blue-600 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3 border border-white/20">
            <Monitor className="w-8 h-8 text-cyan-300" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Trescon IT Asset Portal
          </h1>
          <p className="mt-1 text-xs font-semibold text-gray-500">
            Enterprise Hardware, Vendor & Software Asset Management
          </p>
        </div>

        {/* Demo Quick Auto-Login Box */}
        <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200/80 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-extrabold text-blue-950 uppercase tracking-wider block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Demo Admin Access
            </span>
            <p className="text-[11px] text-blue-800 font-mono">
              admin@company.com • admin123
            </p>
          </div>
          <button
            type="button"
            onClick={() => executeLogin('admin@company.com')}
            className="px-3 py-1.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
          >
            ⚡ Quick Login
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold text-center">
            {errorMessage}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2.5 pl-9 pr-3 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-medium"
                placeholder="admin@company.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2.5 pl-9 pr-3 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600 font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
              />
              Remember me
            </label>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Please use admin@company.com to log in.'); }} className="font-bold text-primary hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 text-xs font-extrabold text-white bg-primary hover:bg-primary-dark active:scale-[0.98] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-gray-100 text-center">
          <span className="text-[11px] text-gray-400 font-mono">
            Trescon IT Asset System v4.0 • System Online
          </span>
        </div>

      </div>
    </div>
  );
};

export default Login;
