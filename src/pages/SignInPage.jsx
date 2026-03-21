import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';

const SignInPage = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });
      
      authLogin(response.access_token, response.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background font-body text-on-surface min-h-screen flex items-center justify-center p-6 relative overflow-hidden w-full">
      {/* Subtle Background Element */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-20">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] mutant-gradient-bg rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-secondary-container rounded-full blur-[100px]"></div>
      </div>
      <main className="relative z-10 w-full max-w-lg">
        {/* Auth Card Container */}
        <div className="bg-surface-container-lowest rounded-lg shadow-[0px_12px_40px_rgba(19,27,46,0.08)] p-8 md:p-12">
          {/* Brand Identity Section */}
          <header className="flex flex-col items-center mb-10">
            <Link to="/" className="mb-4 hover:opacity-80 transition-opacity">
              <div className="w-16 h-16 rounded-full mutant-gradient-bg flex items-center justify-center text-on-primary mx-auto">
                <span className="material-symbols-outlined text-4xl" data-icon="auto_awesome">
                  auto_awesome
                </span>
              </div>
            </Link>
            <Link to="/">
              <h1 className="font-headline text-2xl font-black text-primary tracking-tighter hover:text-primary-container transition-colors">Mutant-AI</h1>
            </Link>
            <p className="font-headline text-on-surface-variant mt-2 text-sm uppercase tracking-widest font-semibold">
              The Ethereal Archivist
            </p>
          </header>
          {/* Form Title Section */}
          <div className="mb-8">
            <h2 className="font-headline text-2xl font-bold text-on-surface">Welcome back</h2>
            <p className="text-on-surface-variant mt-1">Please enter your details to access your intelligence surface.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Main Auth Form */}
          <form className="space-y-6" onSubmit={handleSignIn}>
            <div className="space-y-2">
              <label
                className="block font-label text-xs uppercase tracking-widest font-semibold text-on-surface-variant px-1"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-4 bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50 disabled:opacity-50"
                  id="email"
                  name="email"
                  placeholder="name@mutant.ai"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span
                  className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline/40"
                  data-icon="mail"
                >
                  mail
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label
                  className="font-label text-xs uppercase tracking-widest font-semibold text-on-surface-variant"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link className="text-xs font-semibold text-primary hover:underline transition-all" to="#">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  className="w-full px-4 py-4 bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50 disabled:opacity-50"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span
                  className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline/40"
                  data-icon="lock"
                >
                  lock
                </span>
              </div>
            </div>
            <button
              className="w-full py-4 mutant-gradient-bg text-on-primary font-bold rounded-DEFAULT shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          {/* Switch Mode Footer */}
          <footer className="mt-10 text-center">
            <p className="text-on-surface-variant text-sm">
              Don't have an account?
              <Link className="text-primary font-bold hover:underline transition-all ml-1" to="/signup">
                Create an account
              </Link>
            </p>
          </footer>
        </div>
        {/* System Footer Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs font-label uppercase tracking-widest text-outline">
          <Link className="hover:text-primary transition-colors" to="#">
            Privacy Policy
          </Link>
          <Link className="hover:text-primary transition-colors" to="#">
            Terms of Service
          </Link>
          <Link className="hover:text-primary transition-colors" to="#">
            Documentation
          </Link>
        </div>
      </main>
    </div>
  );
};

export default SignInPage;
