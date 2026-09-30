import { useEffect, useState } from 'react'
import { FileDown, FileText, TrendingUp, ShieldCheck, Download } from 'lucide-react'
import { getStats, getDevices } from '../api.js'
import { VENDOR_STYLES } from '../theme.js'

export default function Reports({ notify }) {
  const [stats, setStats] = useState(null)
  const [devices, setDevices] = useState([])

  useEffect(() => {
    Promise.all([getStats(), getDevices()])
      .then(([s, d]) => {
        setStats(s)
        setDevices(d)
      })
      .catch((err) => notify(`Backend unreachable: ${err.message}`, 'error'))
  }, [notify])

  const byVendor = ['Cisco', 'Fortinet', 'Juniper'].map((v) => {
    const list = devices.filter((d) => d.vendor === v)
    const total = list.reduce((a, d) => a + d.vuln_count, 0)
    const fixed = list.reduce((a, d) => a + d.fixed_count, 0)
    return { vendor: v, devices: list.length, total, fixed, pct: total ? Math.round((fixed / total) * 100) : 0 }
  })

  const history = [
    { name: 'Q3 Enterprise Audit', date: 'Sep 28, 2026', findings: 24, score: 78, status: 'Final' },
    { name: 'Branch Office Sweep', date: 'Sep 21, 2026', findings: 11, score: 86, status: 'Final' },
    { name: 'Firewall Policy Review', date: 'Sep 14, 2026', findings: 7, score: 92, status: 'Signed' },
    { name: 'Baseline Compliance Run', date: 'Sep 07, 2026', findings: 31, score: 64, status: 'Final' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="glass rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Current Score</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-300">
            {stats ? `${stats.compliance_score}%` : '—'}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" /> vs 64% last baseline
          </p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Open Findings</p>
          <p className="mt-2 text-3xl font-extrabold text-amber-300">{stats ? stats.open_vulns : '—'}</p>
          <p className="mt-1 text-xs text-slate-500">Across {devices.length} audited devices</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Remediated</p>
          <p className="mt-2 text-3xl font-extrabold text-cyan-300">{stats ? stats.remediated : '—'}</p>
          <p className="mt-1 text-xs text-slate-500">Patches applied this cycle</p>
        </div>
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
          <ShieldCheck className="h-4 w-4 text-cyan-400" /> Compliance by Vendor
        </h3>
        <div className="space-y-4">
          {byVendor.map((b) => (
            <div key={b.vendor}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className={`rounded border px-2 py-0.5 font-semibold ${VENDOR_STYLES[b.vendor]}`}>
                  {b.vendor} · {b.devices} device{b.devices === 1 ? '' : 's'}
                </span>
                <span className="text-slate-400">
                  {b.total > 0 ? (
                    <>
                      {b.fixed}/{b.total} findings fixed ·{' '}
                      <span className="font-semibold text-slate-200">{b.pct}%</span>
                    </>
                  ) : (
                    <span className="text-slate-600">No scan data yet</span>
                  )}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-700"
                  style={{ width: `${b.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass overflow-hidden rounded-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <FileText className="h-4 w-4 text-cyan-400" /> Report History
          </h3>
          <button
            onClick={() => notify('Executive PDF queued for export (demo).')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
          >
            <FileDown className="h-3.5 w-3.5" /> New Report
          </button>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3 font-semibold">Report</th>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Findings</th>
              <th className="px-5 py-3 font-semibold">Score</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Export</th>
            </tr>
          </thead>
          <tbody>
            {history.map((r) => (
              <tr key={r.name} className="border-b border-slate-800/50 transition hover:bg-slate-800/30">
                <td className="px-5 py-3.5 font-medium text-slate-200">{r.name}</td>
                <td className="px-5 py-3.5 text-slate-400">{r.date}</td>
                <td className="px-5 py-3.5 text-slate-400">{r.findings}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`font-semibold ${r.score >= 85 ? 'text-emerald-400' : r.score >= 70 ? 'text-amber-400' : 'text-red-400'}`}
                  >
                    {r.score}%
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => notify(`Exporting "${r.name}" (demo).`)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-300"
                  >
                    <Download className="h-3.5 w-3.5" /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
