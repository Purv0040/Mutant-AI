import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Registration failed')
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 0 6h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1 0-6h1V6a4 4 0 0 1 4-4z" />
            </svg>
          </div>
          <span className="text-[20px] font-bold tracking-tight text-on-surface">Mutant AI</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-card p-8 ghost-border-solid shadow-[0_4px_32px_rgba(0,94,164,0.06)]">
          <h1 className="text-[18px] font-semibold text-on-surface tracking-tight mb-1">Create account</h1>
          <p className="text-[13px] text-on-surface-variant mb-6">Get started with Mutant AI</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-[12px] font-medium text-on-surface mb-1.5" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={form.username}
                onChange={handleChange}
                placeholder="johndoe"
                className="w-full px-3.5 py-2.5 rounded-btn bg-surface-low text-[14px] text-on-surface placeholder-outline outline-none ghost-border focus:border-accent focus:bg-white transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[12px] font-medium text-on-surface mb-1.5" htmlFor="reg-email">
                Email
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 rounded-btn bg-surface-low text-[14px] text-on-surface placeholder-outline outline-none ghost-border focus:border-accent focus:bg-white transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-medium text-on-surface mb-1.5" htmlFor="reg-password">
                Password
              </label>
              <input
                id="reg-password"
                name="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="w-full px-3.5 py-2.5 rounded-btn bg-surface-low text-[14px] text-on-surface placeholder-outline outline-none ghost-border focus:border-accent focus:bg-white transition-all"
              />
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-[12px] font-medium text-on-surface mb-1.5" htmlFor="confirm">
                Confirm Password
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                required
                value={form.confirm}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-btn bg-surface-low text-[14px] text-on-surface placeholder-outline outline-none ghost-border focus:border-accent focus:bg-white transition-all"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-btn">{error}</p>
            )}

            {/* Submit */}
            <button
              id="register-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white text-[14px] font-semibold rounded-btn hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-[12px] text-on-surface-variant mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:text-accent transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
