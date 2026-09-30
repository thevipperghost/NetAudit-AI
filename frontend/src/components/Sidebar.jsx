import { ShieldCheck, LayoutDashboard, SlidersHorizontal, FileBarChart, LogOut } from 'lucide-react'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'scan', label: 'Scan Config', icon: SlidersHorizontal },
  { id: 'reports', label: 'Reports', icon: FileBarChart },
]

export default function Sidebar({ page, setPage, onLogout }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-xl md:flex">
      <div className="flex items-center gap-3 border-b border-slate-800/80 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10">
          <ShieldCheck className="h-5 w-5 text-cyan-300" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-extrabold text-white">
            NetAudit <span className="text-cyan-400">AI</span>
          </p>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Compliance Auditor</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Navigation
        </p>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = page === id
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? 'border border-cyan-400/25 bg-cyan-500/10 text-cyan-300'
                  : 'border border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-cyan-400' : ''}`} />
              {label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400" />}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-slate-800/80 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-300">
            NA
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-xs font-semibold text-slate-200">Security Analyst</p>
            <p className="truncate text-[10px] text-slate-500">analyst@netaudit.ai</p>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
