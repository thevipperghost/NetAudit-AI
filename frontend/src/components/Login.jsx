import { useState } from 'react'
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Enter your credentials to continue.')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(onLogin, 700)
  }

  return (
    <div className="grid-bg relative flex h-screen items-center justify-center overflow-hidden bg-slate-950 px-4">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-48 -right-32 h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-[130px]" />

      <form
        onSubmit={submit}
        className="glass animate-fade-up relative z-10 w-full max-w-[400px] rounded-2xl p-8 shadow-2xl"
      >
        <div className="mb-7 flex flex-col items-center">
          <div className="glow-cyan mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10">
            <ShieldCheck className="h-8 w-8 text-cyan-300" strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            NetAudit <span className="text-cyan-400">AI</span>
          </h1>
          <p className="mt-1 text-[13px] text-slate-400">
            AI-Driven Network Security Compliance Auditor
          </p>
        </div>

        <label className="mb-1.5 block text-xs font-medium text-slate-400">Email</label>
        <div className="relative mb-4">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="analyst@netaudit.ai"
            className="w-full rounded-lg border border-slate-700/70 bg-slate-900/70 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        <label className="mb-1.5 block text-xs font-medium text-slate-400">Password</label>
        <div className="relative mb-2">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
            className="w-full rounded-lg border border-slate-700/70 bg-slate-900/70 py-2.5 pl-9 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
            aria-label="Toggle password visibility"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error && (
          <p className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Authenticating…
            </>
          ) : (
            <>
              Sign In <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="mt-5 text-center text-[11px] text-slate-500">
          Demo build — any email &amp; password will work
        </p>
      </form>
    </div>
  )
}
