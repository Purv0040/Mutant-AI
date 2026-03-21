import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { register } from '../api';
import { useAuth } from '../context/AuthContext';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
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

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
      login(response.access_token, response.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 pt-20 pb-12">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-800">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block hover:opacity-80 transition-opacity mb-4">
             <div className="w-16 h-16 rounded-full mutant-gradient-bg flex items-center justify-center text-on-primary mx-auto">
                <span className="material-symbols-outlined text-4xl" data-icon="auto_awesome">
                  auto_awesome
                </span>
             </div>
          </Link>
          <h2 className="text-3xl font-headline font-bold text-center">Get Started</h2>
          <p className="text-slate-500 text-sm mt-2">Create your account to begin</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSignUp}>
          <div>
            <label className="block text-sm font-medium mb-1 font-headline">Full Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50" 
              placeholder="John Doe" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 font-headline">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50" 
              placeholder="name@company.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 font-headline">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50" 
              placeholder="••••••••" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold transition-all mt-6 shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/signin" className="text-primary font-bold hover:underline transition-all">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
