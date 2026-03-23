import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { changePassword, deleteUserAccount, getUserProfile } from '../api'

// ── Reusable field wrapper ────────────────────────────────────────────────────
function InfoField({ label, value }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest">
        {label}
      </label>
      <p className="text-lg font-semibold text-on-surface border-b border-transparent hover:border-surface-variant transition-all pb-1 break-all">
        {value || '—'}
      </p>
    </div>
  )
}

// ── Password input with show/hide toggle ─────────────────────────────────────
function PasswordInput({ id, label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-surface-container-low px-4 py-3.5 rounded-xl text-[14px] text-on-surface border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all pr-12"
        />
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">
            {show ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
    </div>
  )
}

// ── Strength indicator ────────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
  const textColors = ['', 'text-red-600', 'text-orange-500', 'text-yellow-600', 'text-green-600']

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? colors[score] : 'bg-surface-container-high'
            }`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-semibold ${textColors[score]}`}>
        {labels[score]} password
      </p>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
const SettingsPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState('profile')

  // ── Profile ──
  const [profile, setProfile]           = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  // ── Change Password ──
  const [currentPw, setCurrentPw]   = useState('')
  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [pwLoading, setPwLoading]   = useState(false)
  const [pwSuccess, setPwSuccess]   = useState('')
  const [pwError, setPwError]       = useState('')

  // ── Delete Account ──
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError]     = useState('')

  // ── Session info ──
  const sessionSince = (() => {
    try {
      const token = localStorage.getItem('mutant_token')
      if (!token) return null
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.iat ? new Date(payload.iat * 1000) : null
    } catch { return null }
  })()

  useEffect(() => {
    ;(async () => {
      setProfileLoading(true)
      try { setProfile(await getUserProfile()) }
      catch { setProfile(null) }
      finally { setProfileLoading(false) }
    })()
  }, [])

  const displayName  = profile?.name  || user?.name  || '—'
  const displayEmail = profile?.email || user?.email || '—'
  const initials     = displayName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

  // ── Handlers ──
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (newPw !== confirmPw) { setPwError('New passwords do not match.'); return }
    if (newPw.length < 6)    { setPwError('New password must be at least 6 characters.'); return }
    setPwLoading(true)
    try {
      await changePassword({ current_password: currentPw, new_password: newPw })
      setPwSuccess('Password changed successfully! Please log in again.')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setTimeout(() => { logout(); navigate('/login') }, 2500)
    } catch (err) {
      setPwError(err.message || 'Failed to change password.')
    } finally { setPwLoading(false) }
  }

  const handleDeleteAccount = async () => {
    setDeleteError('')
    if (deleteConfirm !== 'DELETE') { setDeleteError('Type DELETE to confirm.'); return }
    setDeleteLoading(true)
    try {
      await deleteUserAccount()
      logout()
      navigate('/login')
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account.')
      setDeleteLoading(false)
    }
  }

  const TABS = [
    { id: 'profile',  label: 'Profile',  icon: 'person' },
    { id: 'security', label: 'Security', icon: 'verified_user' },
  ]

  return (
    <main className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full flex flex-col min-h-screen">
      {/* Header */}
      <header className="mb-12">
        <h2 className="text-4xl lg:text-5xl font-extrabold font-headline tracking-tight text-on-surface mb-2">
          Workspace Control
        </h2>
        <p className="text-on-surface-variant font-body text-lg">
          Manage your intelligence parameters and architectural settings.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">

        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-surface-container-highest text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low font-medium'
              }`}
            >
              <span className="material-symbols-outlined" style={activeTab === tab.id ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}

          {/* Divider + Logout */}
          <div className="pt-4 mt-4 border-t border-surface-container space-y-1">
            <button
              type="button"
              id="settings-logout-btn"
              onClick={() => { logout(); navigate('/login') }}
              className="w-full flex items-center gap-3 px-6 py-4 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 transition-all font-medium"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>


        {/* Content */}
        <div className="lg:col-span-9 space-y-8">

          {/* ════════ PROFILE TAB ════════ */}
          {activeTab === 'profile' && (
            <>
              {/* Visual Architecture */}
              <div className="bg-surface-container-lowest p-8 rounded-lg shadow-xl shadow-indigo-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
                  <div>
                    <h3 className="text-xl font-bold font-headline mb-1">Visual Architecture</h3>
                    <p className="text-sm text-on-surface-variant">Toggle between light and dark ethereal modes.</p>
                  </div>
                  <div className="flex bg-surface-container-low p-1.5 rounded-full shadow-inner">
                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-primary shadow-md font-semibold transition-all">
                      <span className="material-symbols-outlined text-lg">light_mode</span>Light
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-full text-on-surface-variant hover:text-primary transition-all font-semibold">
                      <span className="material-symbols-outlined text-lg">dark_mode</span>Dark
                    </button>
                  </div>
                </div>
              </div>

              {/* Knowledge Storage + Indexing Engine */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-surface-container-lowest p-8 rounded-lg shadow-xl shadow-indigo-500/5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold font-headline mb-1">Knowledge Storage</h3>
                    <p className="text-sm text-on-surface-variant mb-8">Total vector memory allocation.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-on-surface-variant">Usage</span>
                      <span className="text-primary font-bold">12.4 GB / 50 GB</span>
                    </div>
                    <div className="relative h-3 w-full bg-surface-container-low rounded-full overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-tertiary-container rounded-full" style={{ width: '25%' }} />
                      <input className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" max="100" min="0" type="range" defaultValue="25" />
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed italic">
                      Optimization running in the background. Next billing cycle in 12 days.
                    </p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-8 rounded-lg shadow-xl shadow-indigo-500/5">
                  <h3 className="text-xl font-bold font-headline mb-1">Indexing Engine</h3>
                  <p className="text-sm text-on-surface-variant mb-8">Synchronize and refresh your data corpus.</p>
                  <div className="flex flex-col gap-4">
                    <button className="w-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3">
                      <span className="material-symbols-outlined text-indigo-600">sync</span>Re-index all clusters
                    </button>
                    <button className="w-full border border-outline-variant/30 hover:bg-surface-container-low text-on-surface-variant font-medium py-4 rounded-xl transition-all">
                      View Indexing Logs
                    </button>
                  </div>
                </div>
              </div>

              {/* User Profile Card */}
              <div className="bg-surface-container-lowest p-8 rounded-lg shadow-xl shadow-indigo-500/5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold font-headline mb-1">User Profile</h3>
                    <p className="text-sm text-on-surface-variant">Your account details from the system.</p>
                  </div>
                  {!profileLoading && (
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold tracking-widest uppercase border border-green-200">
                      Authenticated
                    </span>
                  )}
                </div>
                {profileLoading ? (
                  <div className="flex items-start gap-8 animate-pulse">
                    <div className="w-24 h-24 rounded-2xl bg-surface-container-low flex-shrink-0" />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className="space-y-2">
                          <div className="h-3 w-20 bg-surface-container-low rounded" />
                          <div className="h-6 w-40 bg-surface-container-low rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-8">
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-tertiary-container flex items-center justify-center shadow-lg">
                        <span className="text-3xl font-extrabold text-white tracking-tight">{initials || '?'}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InfoField label="Full Name" value={displayName} />
                      <InfoField label="Email Address" value={displayEmail} />
                      <InfoField label="Member Since" value={
                        profile?.created_at
                          ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                      } />
                      <div className="space-y-1">
                        <label className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest">Access Role</label>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-on-surface">Member</span>
                          <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ════════ SECURITY TAB ════════ */}
          {activeTab === 'security' && (
            <>
              {/* ── 1. Change Password ── */}
              <div className="bg-surface-container-lowest p-8 rounded-lg shadow-xl shadow-indigo-500/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600">lock_reset</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-headline">Change Password</h3>
                    <p className="text-sm text-on-surface-variant">Update your account password. Min. 6 characters.</p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                  <PasswordInput
                    id="current-pw"
                    label="Current Password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="Enter your current password"
                  />
                  <PasswordInput
                    id="new-pw"
                    label="New Password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Enter new password"
                  />
                  {newPw && <PasswordStrength password={newPw} />}
                  <PasswordInput
                    id="confirm-pw"
                    label="Confirm New Password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Re-enter new password"
                  />

                  {/* Feedback */}
                  {pwError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <span className="material-symbols-outlined text-[18px] text-red-600">error</span>
                      <p className="text-[13px] text-red-700 font-medium">{pwError}</p>
                    </div>
                  )}
                  {pwSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <span className="material-symbols-outlined text-[18px] text-green-600">check_circle</span>
                      <p className="text-[13px] text-green-700 font-medium">{pwSuccess}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={pwLoading || !currentPw || !newPw || !confirmPw}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {pwLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Changing…</>
                    ) : (
                      <><span className="material-symbols-outlined text-[18px]">lock_reset</span>Update Password</>
                    )}
                  </button>
                </form>
              </div>

              {/* ── 2. Active Session ── */}
              <div className="bg-surface-container-lowest p-8 rounded-lg shadow-xl shadow-indigo-500/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-600">devices</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-headline">Active Session</h3>
                    <p className="text-sm text-on-surface-variant">Your current login session details.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-green-50/50 border border-green-200 rounded-2xl">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-green-700">computer</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-bold text-gray-800">Current Browser Session</span>
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Active</span>
                    </div>
                    <p className="text-[12px] text-gray-500">
                      Signed in as <span className="font-semibold text-gray-700">{displayEmail}</span>
                    </p>
                    {sessionSince && (
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Session started: {sessionSince.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => { logout(); navigate('/login') }}
                    className="px-4 py-2 text-[12px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors flex-shrink-0"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              {/* ── 3. Security Checklist ── */}
              <div className="bg-surface-container-lowest p-8 rounded-lg shadow-xl shadow-indigo-500/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-indigo-600">security</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-headline">Security Checklist</h3>
                    <p className="text-sm text-on-surface-variant">Recommended actions to keep your account secure.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: 'check_circle', color: 'text-green-600', bg: 'bg-green-50', label: 'Email verified', sub: 'Your account email is confirmed', done: true },
                    { icon: 'check_circle', color: 'text-green-600', bg: 'bg-green-50', label: 'Strong authentication', sub: 'Password-based login is active', done: true },
                    { icon: 'info',         color: 'text-blue-500',  bg: 'bg-blue-50',  label: 'Use a strong password', sub: 'Use 8+ chars with uppercase, numbers & symbols', done: false },
                    { icon: 'info',         color: 'text-blue-500',  bg: 'bg-blue-50',  label: 'Log out of unused sessions', sub: 'Sign out when using shared or public devices', done: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low/50">
                      <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <span className={`material-symbols-outlined text-[18px] ${item.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                          {item.icon}
                        </span>
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-on-surface">{item.label}</p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── 4. Danger Zone ── */}
              <div className="bg-surface-container-lowest p-8 rounded-lg shadow-xl shadow-red-500/5 border border-red-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-600">dangerous</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-headline text-red-700">Danger Zone</h3>
                    <p className="text-sm text-on-surface-variant">Irreversible and destructive actions.</p>
                  </div>
                </div>

                <div className="p-5 bg-red-50/50 border border-red-200 rounded-2xl space-y-4">
                  <div>
                    <p className="text-[14px] font-bold text-red-800 mb-1">Delete Account</p>
                    <p className="text-[12px] text-red-600 leading-relaxed">
                      Permanently deletes your account, all uploaded documents, embeddings, and associated data.
                      <strong> This action cannot be undone.</strong>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-red-700 uppercase tracking-widest">
                      Type <span className="font-mono bg-red-100 px-1 rounded">DELETE</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="Type DELETE"
                      className="w-full max-w-xs bg-white px-4 py-3 rounded-xl text-[14px] border border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all font-mono"
                    />
                  </div>

                  {deleteError && (
                    <p className="text-[12px] text-red-700 font-medium">{deleteError}</p>
                  )}

                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading || deleteConfirm !== 'DELETE'}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white text-[13px] font-bold rounded-xl hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-200"
                  >
                    {deleteLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting…</>
                    ) : (
                      <><span className="material-symbols-outlined text-[18px]">delete_forever</span>Delete My Account</>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-2">
          <p className="font-manrope font-bold text-slate-900">Mutant-AI</p>
          <p className="font-inter text-xs text-slate-500">© 2024 Mutant-AI. The Ethereal Archivist.</p>
        </div>
        <div className="flex items-center gap-8">
          <a className="font-inter text-xs text-slate-400 hover:text-indigo-500 underline transition-opacity" href="#">Privacy</a>
          <a className="font-inter text-xs text-slate-400 hover:text-indigo-500 underline transition-opacity" href="#">Terms</a>
          <a className="font-inter text-xs text-slate-400 hover:text-indigo-500 underline transition-opacity" href="#">Documentation</a>
        </div>
      </footer>
    </main>
  )
}

export default SettingsPage
