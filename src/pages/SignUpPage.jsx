import { Link, useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();
    // In a real app, registration logic goes here
    navigate('/dashboard');
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
        </div>
        <form className="space-y-4" onSubmit={handleSignUp}>
          <div>
            <label className="block text-sm font-medium mb-1 font-headline">Full Name</label>
            <input type="text" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 font-headline">Email</label>
            <input type="email" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all" placeholder="name@company.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 font-headline">Password</label>
            <input type="password" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-primary-container text-white py-3.5 rounded-xl font-bold transition-all mt-6 shadow-lg shadow-primary/20 active:scale-[0.98]">
            Create Account
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
