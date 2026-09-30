import { useState } from 'react'
import { Radar, CalendarClock, Save, Check, AlertCircle } from 'lucide-react'
import { getScanConfig, saveScanConfig } from '../scanConfig.js'

function Toggle({ label, desc, on, setOn }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-800/70 py-3.5 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-cyan-500' : 'bg-slate-700'}`}
        aria-pressed={on}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`}
        />
      </button>
    </div>
  )
}

const DEPTHS = [
  { id: 'quick', title: 'Quick Scan', desc: 'Top 10 CIS checks · ~30s', time: '0.5x' },
  { id: 'standard', title: 'Standard', desc: 'Full compliance pack · ~2m', time: '1x' },
  { id: 'deep', title: 'Deep Audit', desc: 'CVE + config diff + AI · ~8m', time: '4x' },
]

const SCHEDULES = ['Continuous (real-time)', 'Every 6 hours', 'Daily 02:00 UTC', 'Weekly']

export default function ScanConfig({ notify }) {
  const [cfg, setCfg] = useState(getScanConfig())
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)

  const update = (patch) => {
    setCfg((c) => ({ ...c, ...patch }))
    setDirty(true)
    setSaved(false)
  }

  const setModule = (key, val) => update({ modules: { ...cfg.modules, [key]: val } })

  const save = () => {
    saveScanConfig(cfg)
    setDirty(false)
    setSaved(true)
    notify('Scan configuration saved — applied to every upload/audit now.')
    setTimeout(() => setSaved(false), 2400)
  }

  const vendorsOn = ['cisco', 'fortinet', 'juniper'].filter((v) => cfg.modules[v]).length
  const depthLabel = DEPTHS.find((d) => d.id === cfg.depth)?.title || 'Standard'

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="glass rounded-xl p-5 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <Radar className="h-4 w-4 text-cyan-400" /> Scan Depth
            </h3>
            <p className="text-xs text-slate-500">Choose how aggressively the auditor inspects each device.</p>
          </div>
          <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
            {dirty ? 'Unsaved changes' : 'Active policy'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DEPTHS.map((d) => (
            <button
              key={d.id}
              onClick={() => update({ depth: d.id })}
              className={`rounded-xl border p-4 text-left transition ${
                cfg.depth === d.id
                  ? 'border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_24px_-10px_rgba(34,211,238,0.6)]'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <p className={`text-sm font-bold ${cfg.depth === d.id ? 'text-cyan-300' : 'text-slate-200'}`}>
                {d.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">{d.desc}</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Est. load {d.time}
              </p>
            </button>
          ))}
        </div>

        <h3 className="mb-2 mt-7 flex items-center gap-2 text-sm font-bold text-white">
          <CalendarClock className="h-4 w-4 text-emerald-400" /> Schedule
        </h3>
        <div className="flex flex-wrap gap-2">
          {SCHEDULES.map((s) => (
            <span
              key={s}
              onClick={() => update({ schedule: s })}
              className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                cfg.schedule === s
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
              }`}
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Current policy:</span> {depthLabel} depth ·{' '}
          {cfg.schedule} · {vendorsOn}/3 vendor modules enabled
          {vendorsOn === 0 && (
            <span className="ml-1 flex items-center gap-1 text-amber-400">
              <AlertCircle className="h-3 w-3" /> uploads will be rejected
            </span>
          )}
        </div>
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="mb-1 text-sm font-bold text-white">Rule Modules</h3>
        <p className="mb-1 text-xs text-slate-500">
          Vendor toggles are enforced — uploads from a disabled vendor are rejected.
        </p>
        <Toggle label="Cisco IOS / IOS-XE" desc="SSH, SNMP, AAA, banner rules" on={cfg.modules.cisco} setOn={(v) => setModule('cisco', v)} />
        <Toggle label="Fortinet FortiOS" desc="Admin, SSL-VPN, IPsec hardening" on={cfg.modules.fortinet} setOn={(v) => setModule('fortinet', v)} />
        <Toggle label="Juniper JunOS" desc="System services & secrets checks" on={cfg.modules.juniper} setOn={(v) => setModule('juniper', v)} />
        <Toggle label="AI Anomaly Engine" desc="LLM-based config risk scoring" on={cfg.modules.ai} setOn={(v) => setModule('ai', v)} />
        <Toggle label="CVE Cross-reference" desc="Match versions against CVE DB" on={cfg.modules.cve} setOn={(v) => setModule('cve', v)} />
        <Toggle label="Weak Banner Detection" desc="Information disclosure in MOTD" on={cfg.modules.banner} setOn={(v) => setModule('banner', v)} />

        <button
          onClick={save}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Configuration Saved' : dirty ? 'Save Changes' : 'Save Configuration'}
        </button>
      </div>
    </div>
  )
}
