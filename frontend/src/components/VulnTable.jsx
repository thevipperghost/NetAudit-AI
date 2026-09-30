import { useState } from 'react'
import { Terminal, Search, CheckCircle2, Wrench, Filter } from 'lucide-react'
import { SEVERITY_STYLES, VENDOR_STYLES, VENDOR_INITIALS } from '../theme.js'

const FILTERS = ['All', 'Critical', 'High', 'Medium', 'Low']

export default function VulnTable({ vulnerabilities, devices, onGeneratePatch }) {
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')

  const deviceMap = Object.fromEntries((devices || []).map((d) => [d.id, d]))

  const rows = (vulnerabilities || []).filter((v) => {
    const sevOk = filter === 'All' || v.severity === filter
    const q = query.trim().toLowerCase()
    const searchOk =
      !q ||
      v.issue_title.toLowerCase().includes(q) ||
      (v.hostname || '').toLowerCase().includes(q) ||
      (v.vendor || '').toLowerCase().includes(q)
    return sevOk && searchOk
  })

  return (
    <div className="glass overflow-hidden rounded-xl">
      <div className="flex flex-col gap-3 border-b border-slate-800/80 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <Terminal className="h-4 w-4 text-cyan-400" /> Vulnerability Findings
          </h3>
          <p className="text-xs text-slate-500">
            {rows.length} finding{rows.length === 1 ? '' : 's'} · click Generate Patch for the exact CLI fix
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search issues, hosts…"
              className="w-44 rounded-lg border border-slate-700/70 bg-slate-900/70 py-1.5 pl-8 pr-2 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-slate-700/70 bg-slate-900/70 px-1.5 py-1">
            <Filter className="h-3 w-3 text-slate-500" />
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded px-2 py-0.5 text-[11px] font-medium transition ${
                  filter === f
                    ? 'bg-cyan-500/15 text-cyan-300'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3 font-semibold">Risk Level</th>
              <th className="px-5 py-3 font-semibold">Issue</th>
              <th className="px-5 py-3 font-semibold">Vendor</th>
              <th className="px-5 py-3 font-semibold">State</th>
              <th className="px-5 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                  {(vulnerabilities || []).length === 0
                    ? 'No findings yet — upload a configuration file to start the audit.'
                    : 'No findings match your filters.'}
                </td>
              </tr>
            )}
            {rows.map((v) => {
              const sev = SEVERITY_STYLES[v.severity] || SEVERITY_STYLES.Low
              const dev = deviceMap[v.device_id] || {}
              const vendor = v.vendor || dev.vendor || 'Cisco'
              return (
                <tr
                  key={v.id}
                  className={`border-b border-slate-800/50 transition hover:bg-slate-800/30 ${
                    v.is_fixed ? 'opacity-55' : ''
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${sev.badge}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
                      {v.severity}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-200">{v.issue_title}</p>
                    <p className="text-xs text-slate-500">
                      {v.hostname || dev.hostname || 'unknown-host'} · {dev.ip_address || '—'}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold ${VENDOR_STYLES[vendor] || VENDOR_STYLES.Cisco}`}
                    >
                      <span className="font-bold">{VENDOR_INITIALS[vendor] || 'NA'}</span>
                      {vendor}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {v.is_fixed ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Fixed
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-400">Open</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => onGeneratePatch(v)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20 hover:text-cyan-200"
                    >
                      <Wrench className="h-3.5 w-3.5" /> Generate Patch
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
