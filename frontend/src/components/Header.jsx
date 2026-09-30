import { ShieldCheck, Activity, Bell } from 'lucide-react'

const TITLES = {
  dashboard: ['Security Dashboard', 'Fleet-wide posture at a glance'],
  scan: ['Scan Configuration', 'Tune audit rules and schedules'],
  reports: ['Compliance Reports', 'Exportable audit summaries'],
}

export default function Header({ page }) {
  const [title, subtitle] = TITLES[page] || TITLES.dashboard

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-500/10 md:hidden">
          <ShieldCheck className="h-4 w-4 text-cyan-300" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white md:text-base">{title}</h1>
          <p className="hidden text-xs text-slate-500 sm:block">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-slate-700/70 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-400 sm:flex">
          <Activity className="h-3.5 w-3.5 text-cyan-400" />
          Last scan: just now
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
          <span className="pulse-dot h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-semibold text-emerald-300">
            System Status: <span className="text-emerald-200">Secure</span>
          </span>
        </div>
        <button className="relative rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400" />
        </button>
      </div>
    </header>
  )
}
