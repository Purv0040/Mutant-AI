const TeamPage = () => {
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-surface">
      {/* TopNavBar (Shared Component) */}
      <header className="flex justify-between items-center px-8 py-4 fixed top-0 right-0 w-[calc(100%-16rem)] z-30 bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <h2 className="text-2xl font-black text-indigo-600 font-headline">Team Management</h2>
          <nav className="hidden lg:flex items-center gap-6">
            <a className="font-manrope text-xs font-semibold uppercase tracking-widest text-indigo-600 border-b-2 border-indigo-600 pb-1" href="#">
              Overview
            </a>
            <a className="font-manrope text-xs font-semibold uppercase tracking-widest text-slate-600 hover:text-indigo-500 transition-colors" href="#">
              Roles
            </a>
            <a className="font-manrope text-xs font-semibold uppercase tracking-widest text-slate-600 hover:text-indigo-500 transition-colors" href="#">
              Permissions
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <span className="material-symbols-outlined text-slate-500 group-hover:text-indigo-600 transition-colors cursor-pointer">
              notifications
            </span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></span>
          </div>
          <button className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold text-sm shadow-lg shadow-indigo-500/20 flex items-center gap-2 hover:opacity-90 transition-all active:scale-95">
            <span className="material-symbols-outlined text-sm">person_add</span>
            Invite Team Member
          </button>
        </div>
      </header>
      
      {/* Main Content Area */}
      <div className="mt-20 px-8 pb-12 overflow-y-auto flex-1">
        {/* Statistics Row (Asymmetric Bento) */}
        <div className="grid grid-cols-12 gap-6 mb-10">
          <div className="col-span-12 md:col-span-4 p-8 bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/10">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-bold font-label">Total Members</p>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold font-headline text-on-surface">42</span>
              <span className="text-primary font-bold text-sm mb-1">+12% this month</span>
            </div>
          </div>
          <div className="col-span-12 md:col-span-8 p-8 bg-primary rounded-lg shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <h3 className="text-2xl font-bold font-headline mb-2">Invite more experts</h3>
                <p className="text-on-primary-container text-sm max-w-md">
                  Collaborate effortlessly across departments by bringing your entire squad onto the Mutant-AI surface.
                </p>
              </div>
              <div className="mt-4">
                <button className="bg-white text-primary px-5 py-2 rounded-full font-bold text-sm">Generate Invite Link</button>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-20 transform rotate-12">
              <span className="material-symbols-outlined text-[180px]">groups</span>
            </div>
          </div>
        </div>

        {/* Team Table Container */}
        <div className="bg-surface-container-low rounded-lg p-2">
          <div className="bg-surface-container-lowest rounded-lg shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="px-8 py-6 flex justify-between items-center border-b border-surface-container">
              <h3 className="text-lg font-bold text-on-surface font-headline">Active Personnel</h3>
              <div className="flex gap-4">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    search
                  </span>
                  <input
                    className="pl-10 pr-4 py-2 bg-surface-container text-sm rounded-full border-none focus:ring-2 focus:ring-primary/20 w-64"
                    placeholder="Filter team..."
                    type="text"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest font-label">Team Member</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest font-label">Role</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest font-label">Last Login</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest font-label">Status</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {/* User 1 */}
                  <tr className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed-dim flex items-center justify-center text-primary font-bold overflow-hidden">
                          <img
                            alt="User"
                            className="w-full h-full object-cover"
                            data-alt="Portrait of a male team member"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4BlQmau-PblLFf0rJNs1IsRdzKruAZKRYLzaXe2xjij4k_rerpxVwnreSI6LoxROup3hoPHfPfAujKcvpXSV_JRw_1t_AB0krcxz1uhEzHsejL5sg_iT2RXjgUP7D8d-HCF-9JYAoKDcwzUmxkECUUwn6NUnQvpUeSA6W0v2xTOwcJIfPEhWhdaJ2ObpvfbOh3coRcDuodgJpSZmg_FliGR-GDi8qIW3splkOEIAlg0T2rw1xKrZyaOmbd-ck8_U-ciZiYNMbd_M"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-sm">Alexander Thorne</p>
                          <p className="text-xs text-slate-400">alex.thorne@mutantai.io</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <select className="bg-surface-container-low border-none rounded-lg text-sm font-medium py-1.5 focus:ring-primary" defaultValue="Admin">
                        <option>Admin</option>
                        <option>Editor</option>
                        <option>Viewer</option>
                      </select>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm text-on-surface-variant">2 hours ago</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>

                  {/* User 2 */}
                  <tr className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-tertiary-fixed-dim flex items-center justify-center text-tertiary font-bold overflow-hidden">
                          <img
                            alt="User"
                            className="w-full h-full object-cover"
                            data-alt="Portrait of a female team member"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDh9Zcdj3QCiXpexf-eRdx8K1LF_czZPnH-NPwNXpUUdEBLJQshvtw0kb0TYA-luOj6pzUMBYphgYybX5jl2DZGr6MmluRk2M6qPdb_5hSfAADFwq9CeTD4vftQXKcT8xzdSkGEZasMIWgICHHCB1DQb2e1ohacOQYgIueE0X3y5kxmBYrwuNnWkMvljFEpy6NQ7YgO6EAZJPCf9eiBuRqQ6UNCOpyjtCA9c9AiuuzX8NYBjw85wQXDX0mmMRG78I0y3L-D6MUXop8"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-sm">Elena Rodriguez</p>
                          <p className="text-xs text-slate-400">e.rodriguez@mutantai.io</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <select className="bg-surface-container-low border-none rounded-lg text-sm font-medium py-1.5 focus:ring-primary" defaultValue="Editor">
                        <option>Admin</option>
                        <option>Editor</option>
                        <option>Viewer</option>
                      </select>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm text-on-surface-variant">Yesterday, 4:22 PM</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>

                  {/* User 3 */}
                  <tr className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                          <img
                            alt="User"
                            className="w-full h-full object-cover"
                            data-alt="Portrait of a smiling male employee"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKAAVjtd6tpSZnkwKEbrvGn14uUUWNJ1xd8qAtqkqkbn_BV7FsNs67-gQb9iJ1sNmnhO3WZIq4Y1odW-SAB8KHUQBhf5ARBs-dCD1LRbbXKmGrs0rlunuP9w3Ho2nupfyCQNLFgQzeVCXjIOqSjrdcMwuF_9RuuurZVaG1JP9BVAYDtyKsP-EmQVqrDWDZfhQMW4yDGucE5JIUqJ8sd_IlRCQUmxVLM-KJyDZV4QbqPdsRDo7aclkFOLlUeWdtwCOqTxMAc4tV5ao"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-sm">Marcus Chen</p>
                          <p className="text-xs text-slate-400">m.chen@mutantai.io</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <select className="bg-surface-container-low border-none rounded-lg text-sm font-medium py-1.5 focus:ring-primary" defaultValue="Viewer">
                        <option>Admin</option>
                        <option>Editor</option>
                        <option>Viewer</option>
                      </select>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm text-on-surface-variant">Oct 12, 2024</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-xs font-bold uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Inactive
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>

                  {/* User 4 */}
                  <tr className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary font-bold overflow-hidden">
                          <img
                            alt="User"
                            className="w-full h-full object-cover"
                            data-alt="Portrait of a young female professional"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCv_2ESis1456YEVzDcqikqK6kY8kCn7b1ZoCuI_FeB-La1wN2WkYHZ_jyq3V6QCSJFOsyiHSiUxbqMSI_GQ_NKKecMDeHkiGUf5REMSSZFrU2ON7jsqf4I7RaoC9R19QQjBpTs2-1r5U00ik0Be4Gvi9pG3omT9YV_wZU5g0z561fg4OtsXOgUTCb7Vcawf3ruYb-HKI0Xe0d6-eIM_jAIAlzfnJ2WFzfb-gxNqm9-GemX1xQnnFNokmWEpQBRda2jmaDDYUaOi18"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-sm">Sophia Williams</p>
                          <p className="text-xs text-slate-400">s.williams@mutantai.io</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <select className="bg-surface-container-low border-none rounded-lg text-sm font-medium py-1.5 focus:ring-primary" defaultValue="Editor">
                        <option>Admin</option>
                        <option>Editor</option>
                        <option>Viewer</option>
                      </select>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm text-on-surface-variant">3 hours ago</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="px-8 py-6 flex justify-between items-center bg-surface-container-low/20">
                <p className="text-xs text-slate-500">Showing 4 of 42 team members</p>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm text-slate-400 hover:text-primary disabled:opacity-50" disabled>
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-white shadow-sm font-bold text-xs">
                    1
                  </button>
                  <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm text-slate-600 hover:bg-slate-50 font-bold text-xs">
                    2
                  </button>
                  <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm text-slate-400 hover:text-primary">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer (Shared Component) */}
      <footer className="flex flex-col md:flex-row justify-between items-center px-12 py-8 w-full bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 mt-auto">
        <div className="mb-4 md:mb-0">
          <span className="font-manrope font-bold text-slate-900 dark:text-white">Mutant-AI</span>
          <span className="ml-4 font-inter text-xs text-slate-500">© 2024 Mutant-AI. The Ethereal Archivist.</span>
        </div>
        <div className="flex gap-6">
          <a className="font-inter text-xs text-slate-500 hover:text-indigo-500 transition-opacity" href="#">
            Privacy
          </a>
          <a className="font-inter text-xs text-slate-500 hover:text-indigo-500 transition-opacity" href="#">
            Terms
          </a>
          <a className="font-inter text-xs text-slate-500 hover:text-indigo-500 transition-opacity" href="#">
            Documentation
          </a>
          <a className="font-inter text-xs text-slate-500 hover:text-indigo-500 transition-opacity" href="#">
            LinkedIn
          </a>
        </div>
      </footer>

      {/* Modal Overlay (Mockup State) - Hidden */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center hidden">
        <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold font-headline text-on-surface">Invite Member</h3>
              <p className="text-sm text-slate-500 mt-1">Add a new collaborator to the Mutant surface.</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <form className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
              <input
                className="w-full px-4 py-3 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-sm"
                placeholder="colleague@mutantai.io"
                type="email"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Assign Role</label>
                <select className="w-full px-4 py-3 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-sm">
                  <option>Viewer</option>
                  <option>Editor</option>
                  <option>Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Department</label>
                <select className="w-full px-4 py-3 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-sm">
                  <option>Product</option>
                  <option>Engineering</option>
                  <option>Marketing</option>
                  <option>Design</option>
                </select>
              </div>
            </div>
            <div className="pt-4 flex gap-4">
              <button className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors" type="button">
                Cancel
              </button>
              <button className="flex-1 py-3 bg-primary text-white rounded-lg font-bold text-sm shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all" type="button">
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default TeamPage;
