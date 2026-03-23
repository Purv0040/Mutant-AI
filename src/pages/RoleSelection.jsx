import { Link } from 'react-router-dom';

const RoleSelection = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100 rounded-full blur-[100px] opacity-70"></div>
        <div className="absolute top-1/2 -left-20 w-72 h-72 bg-blue-100 rounded-full blur-[80px] opacity-60"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-t from-slate-100/50 to-transparent"></div>
        {/* Subtle wave pattern abstract */}
        <svg className="absolute bottom-0 right-0 w-[600px] opacity-30" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M800 600V250C700 300 600 200 500 250C400 300 300 200 200 250C100 300 0 200 0 250V600H800Z" fill="url(#paint0_linear)"/>
          <defs>
            <linearGradient id="paint0_linear" x1="400" y1="200" x2="400" y2="600" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E2E8F0" stopOpacity="0.5"/>
              <stop offset="1" stopColor="#E2E8F0" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="z-10 w-full max-w-5xl flex flex-col items-center">
        {/* Logo Section */}
        <div className="text-center mb-12 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
            </div>
            <h2 className="text-xl font-bold text-indigo-700">Aura AI</h2>
          </div>
          <p className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">Intelligent Surface</p>
        </div>

        {/* Headings */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4">
            How will you connect to Aura?
          </h1>
          <p className="text-lg text-slate-500">
            Choose your workspace role to begin your intelligence session.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mb-16">
          {/* Admin Card */}
          <div className="bg-white rounded-3xl p-10 shadow-xl shadow-slate-200/50 flex flex-col h-full border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-8 text-blue-600">
              <span className="material-symbols-outlined text-3xl">shield</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              ADMIN / WORKSPACE CONTROL
            </h3>
            <p className="text-slate-600 leading-relaxed mb-10 flex-grow">
              Manage intelligence parameters, monitor team usage, and configure API integrations.
            </p>
            <Link 
              to="/admin-signin" 
              className="w-full py-4 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-2xl transition-colors text-center block"
            >
              Access Control Center
            </Link>
          </div>

          {/* User Card */}
          <div className="bg-white rounded-3xl p-10 shadow-xl shadow-slate-200/50 flex flex-col h-full border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 text-white">
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              KNOWLEDGE USER
            </h3>
            <p className="text-slate-600 leading-relaxed mb-10 flex-grow">
              Query your company knowledge base, analyze documents, and generate meeting insights.
            </p>
            <Link 
              to="/signin" 
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl transition-colors text-center block shadow-lg shadow-indigo-600/20"
            >
              Enter Workspace
            </Link>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full mb-12">
          <span className="material-symbols-outlined text-sm text-slate-400">lock</span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Secure Session Encrypted by Aura AI
          </span>
        </div>

        {/* Footer */}
        <footer className="w-full flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 mt-auto px-4">
          <p>© 2024 Aura AI. The Ethereal Archivist.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-600">Privacy</a>
            <a href="#" className="hover:text-slate-600">Documentation</a>
            <a href="#" className="hover:text-slate-600">Support</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default RoleSelection;
