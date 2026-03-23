import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md flex justify-between items-center px-8 py-4 max-w-full">
      <div className="flex items-center gap-2">
        <Link to="/" className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-headline">
          Mutant-AI
        </Link>
      </div>
      <div className="hidden md:flex gap-10 items-center">
        <Link
          to="/features"
          className={`font-manrope text-sm font-semibold uppercase tracking-widest transition-colors ${
            isActive('/features')
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-slate-600 dark:text-slate-300 hover:text-indigo-500'
          }`}
        >
          Features
        </Link>
        <Link
          to="/pricing"
          className={`font-manrope text-sm font-semibold uppercase tracking-widest transition-colors ${
            isActive('/pricing')
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-slate-600 dark:text-slate-300 hover:text-indigo-500'
          }`}
        >
          Pricing
        </Link>
        <Link
          to="/about"
          className={`font-manrope text-sm font-semibold uppercase tracking-widest transition-colors ${
            isActive('/about')
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-slate-600 dark:text-slate-300 hover:text-indigo-500'
          }`}
        >
          About
        </Link>
      </div>
      <div className="flex items-center gap-6">
        <Link
          to="/role-selection"
          className="font-manrope text-sm font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-300 opacity-80 hover:opacity-100 transition-all"
        >
          Sign In
        </Link>
        <Link
          to="/role-selection"
          className="bg-primary hover:bg-primary-container text-white px-6 py-2.5 rounded-full font-manrope text-sm font-semibold uppercase tracking-widest transition-all"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
