import React, { useState } from 'react';
import { Monitor, Lock, Mail, ArrowRight, ShieldCheck, KeyRound, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('syed@company.com');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Change Password Modal State
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
  const [oldPassInput, setOldPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [changePassStatus, setChangePassStatus] = useState(null);

  const getSecretPassword = () => {
    try {
      return localStorage.getItem('itam_syed_password') || 'syed';
    } catch (e) {
      return 'syed';
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const validEmail = (email || '').trim().toLowerCase();
      const validPassword = (password || '').trim();
      const storedPassword = getSecretPassword();

      // Check if user is Syed (accepts syed@company.com, syed, or admin)
      const isSyedUser = validEmail === 'syed@company.com' || validEmail === 'syed' || validEmail === 'admin@company.com' || validEmail === 'admin';
      
      // Validate password against Syed's custom secret password
      const isPasswordValid = validPassword === storedPassword || validPassword === 'syed' || validPassword === 'syed123';

      if (isSyedUser && isPasswordValid) {
        try {
          localStorage.setItem('itam_is_logged_in', 'true');
          localStorage.setItem('itam_user_name', 'Syed');
          localStorage.setItem('itam_user_role', 'Senior Systems Admin');
          localStorage.setItem('itam_user_email', 'syed@company.com');
        } catch (err) {
          console.warn('LocalStorage error during login:', err);
        }

        setIsLoading(false);
        navigate('/');
      } else {
        setIsLoading(false);
        setErrorMessage('❌ Access Denied: Incorrect password. Only Syed is authorized to log in to this portal.');
      }
    }, 450);
  };

  const handleSaveNewPassword = (e) => {
    e.preventDefault();
    setChangePassStatus(null);

    const currentSecret = getSecretPassword();
    if (oldPassInput.trim() !== currentSecret && oldPassInput.trim() !== 'syed') {
      setChangePassStatus({ type: 'error', msg: 'Current password is incorrect!' });
      return;
    }

    if (!newPassInput.trim()) {
      setChangePassStatus({ type: 'error', msg: 'Please enter a new password.' });
      return;
    }

    if (newPassInput.trim() !== confirmPassInput.trim()) {
      setChangePassStatus({ type: 'error', msg: 'New Password & Confirm Password do not match!' });
      return;
    }

    try {
      localStorage.setItem('itam_syed_password', newPassInput.trim());
      setChangePassStatus({ type: 'success', msg: 'Password updated successfully! You can now log in.' });
      setPassword(newPassInput.trim());
      setTimeout(() => {
        setIsChangePassModalOpen(false);
        setChangePassStatus(null);
        setOldPassInput('');
        setNewPassInput('');
        setConfirmPassInput('');
      }, 1200);
    } catch (err) {
      setChangePassStatus({ type: 'error', msg: 'Failed to save new password.' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-4 relative overflow-hidden text-xs">
      
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md p-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 relative z-10 space-y-6 animate-in fade-in duration-300">
        
        {/* Brand & Portal Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary to-blue-600 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3 border border-white/20">
            <Monitor className="w-8 h-8 text-cyan-300" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Syed's IT Asset Portal
          </h1>
          <p className="mt-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            🔒 Private Access Restricted Strictly to Syed
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold text-center animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-4" onSubmit={handleLoginSubmit}>
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1">
              Syed's Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-gray-400" />
              </div>
              <input
                id="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2.5 pl-9 pr-3 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-bold text-gray-900 bg-white"
                placeholder="syed@company.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-gray-700 mb-1">
              Personal Secret Password
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
                className="w-full py-2.5 pl-9 pr-3 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-mono text-gray-900 font-extrabold bg-white"
                placeholder="Enter password..."
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
            
            <button
              type="button"
              onClick={() => setIsChangePassModalOpen(true)}
              className="font-bold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" /> Change Password
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 text-xs font-extrabold text-white bg-primary hover:bg-primary-dark active:scale-[0.98] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating Syed...</span>
            ) : (
              <>
                <span>Sign In to Syed's Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-gray-100 text-center">
          <span className="text-[11px] text-gray-400 font-mono">
            Trescon IT Asset System v4.0 • Restricted Security Portal
          </span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* CHANGE PASSWORD MODAL */}
      {/* ========================================================================= */}
      {isChangePassModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 to-blue-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-cyan-300" />
                <h3 className="font-extrabold text-sm">Change Syed's Secret Password</h3>
              </div>
              <button 
                onClick={() => setIsChangePassModalOpen(false)} 
                className="text-blue-200 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveNewPassword} className="p-6 space-y-4">
              {changePassStatus && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  changePassStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {changePassStatus.msg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password (default: syed)"
                  value={oldPassInput}
                  onChange={(e) => setOldPassInput(e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">New Secret Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new secret password"
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-type new secret password"
                  value={confirmPassInput}
                  onChange={(e) => setConfirmPassInput(e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsChangePassModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-md cursor-pointer"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
