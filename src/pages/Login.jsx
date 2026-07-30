import React from 'react';
import { Monitor, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full text-white mb-4 shadow-md">
            <Monitor size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">
            IT Asset Management
          </h2>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Sign in to access your dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full py-3 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                  placeholder="admin@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full py-3 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary hover:text-primary-dark">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-primary border border-transparent rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-md transition-all active:scale-[0.98]"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
