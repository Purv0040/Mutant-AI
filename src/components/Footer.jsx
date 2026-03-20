import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-12 w-full max-w-7xl mx-auto">
        <div className="mb-8 md:mb-0 text-center md:text-left">
          <div className="font-manrope font-bold text-2xl text-slate-900 dark:text-white mb-2">
            Mutant-AI
          </div>
          <p className="font-inter text-xs text-slate-500 max-w-xs">
            © 2024 Mutant-AI. The Ethereal Archivist. Building the future of workplace intelligence.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link to="/" className="font-inter text-xs text-slate-400 hover:text-indigo-500 transition-colors">
            Privacy
          </Link>
          <Link to="/" className="font-inter text-xs text-slate-400 hover:text-indigo-500 transition-colors">
            Terms
          </Link>
          <Link to="/" className="font-inter text-xs text-slate-400 hover:text-indigo-500 transition-colors">
            Documentation
          </Link>
          <a href="#" className="font-inter text-xs text-slate-400 hover:text-indigo-500 transition-colors">
            Twitter
          </a>
          <a href="#" className="font-inter text-xs text-slate-400 hover:text-indigo-500 transition-colors">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
