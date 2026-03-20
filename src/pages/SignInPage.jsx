import { Link, useNavigate } from 'react-router-dom';

const SignInPage = () => {
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    // In a real app, authentication logic goes here
    navigate('/dashboard');
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
          {/* Social Provider */}
          <button 
            type="button" 
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-surface-container-low hover:bg-surface-container transition-colors rounded-DEFAULT font-semibold text-on-surface group"
          >
            <img
              alt="Google"
              className="w-5 h-5"
              data-alt="Google logo icon"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqFNv9lBeFI__beWjGgm3JvfIUhgQreFEsd0YuPTr3XwaVzU7j7hM0YjCf4XqHsBoiLVfNY_JOKxvUJ6BZifdU-3uV8gmdrjfutaa6YbqPgVFMWtBY8WU_L_GusJHX5_L-37ezSl7r_kJuScfvPqzXxms7lLkRQm7bFn87Q5WMyITyszD6iUAySO9PtKV1msdvspdhZB9M-dTpl7gpsIL9smx-4v3NAW92ftkLEpD8fD8riwJ_wrC6Zojc1OFkZGV7EA0PVTnPGz8"
            />
            <span>Sign in with Google</span>
          </button>
          <div className="relative my-8 flex items-center">
            <div className="flex-grow h-[1px] bg-surface-variant"></div>
            <span className="mx-4 text-xs font-label uppercase tracking-widest text-outline">or use email</span>
            <div className="flex-grow h-[1px] bg-surface-variant"></div>
          </div>
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
                  className="w-full px-4 py-4 bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50"
                  id="email"
                  name="email"
                  placeholder="name@mutant.ai"
                  type="email"
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
                  className="w-full px-4 py-4 bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type="password"
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
              className="w-full py-4 mutant-gradient-bg text-on-primary font-bold rounded-DEFAULT shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]"
              type="submit"
            >
              Sign In
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
