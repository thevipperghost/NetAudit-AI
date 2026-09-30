import { useCallback, useEffect, useState } from 'react'
import { Server, RefreshCw } from 'lucide-react'
import KpiCards from '../components/KpiCards.jsx'
import UploadZone from '../components/UploadZone.jsx'
import VulnTable from '../components/VulnTable.jsx'
import PatchModal from '../components/PatchModal.jsx'
import { getStats, getDevices, getVulnerabilities } from '../api.js'
import { VENDOR_STYLES } from '../theme.js'

export default function Dashboard({ notify }) {
  const [stats, setStats] = useState(null)
  const [devices, setDevices] = useState([])
  const [vulns, setVulns] = useState([])
  const [loading, setLoading] = useState(true)
  const [patch, setPatch] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const [s, d, v] = await Promise.all([getStats(), getDevices(), getVulnerabilities()])
      setStats(s)
      setDevices(d)
      setVulns(v)
    } catch (err) {
      notify(`Backend unreachable: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }, [notify])

  useEffect(() => {
    refresh()
  }, [refresh])

  const onFixed = () => {
    setPatch(null)
    refresh()
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-3 text-sm text-slate-400">
        <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" /> Loading audit data…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <KpiCards stats={stats} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <UploadZone onUploaded={refresh} notify={notify} />

          <div className="glass mt-4 rounded-xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <Server className="h-4 w-4 text-cyan-400" /> Scanned Devices
              </h3>
              <button
                onClick={refresh}
                title="Refresh"
                className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-cyan-300"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
            <ul className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
              {devices.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-200">{d.hostname}</p>
                    <p className="text-[11px] text-slate-500">
                      {d.ip_address} · {d.fixed_count}/{d.vuln_count} fixed
                    </p>
                  </div>
                  <span
                    className={`ml-2 shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${VENDOR_STYLES[d.vendor] || VENDOR_STYLES.Cisco}`}
                  >
                    {d.vendor}
                  </span>
                </li>
              ))}
              {devices.length === 0 && (
                <li className="py-4 text-center text-xs text-slate-500">No devices scanned yet.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="xl:col-span-2">
          <VulnTable
            vulnerabilities={vulns}
            devices={devices}
            onGeneratePatch={(v) => setPatch(v)}
          />
        </div>
      </div>

      {patch && (
        <PatchModal vuln={patch} onClose={() => setPatch(null)} onFixed={onFixed} notify={notify} />
      )}
    </div>
  )
}
