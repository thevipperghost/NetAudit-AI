import { Router, ShieldAlert, Gauge, CheckCircle2 } from 'lucide-react'

function Card({ icon: Icon, label, value, sub, accent, bar }) {
  return (
    <div className="glass group relative overflow-hidden rounded-xl p-5 transition hover:border-slate-600/40">
      <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${accent.glow}`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
          <p className={`mt-2 text-3xl font-extrabold tracking-tight ${accent.text}`}>{value}</p>
          <p className="mt-1 text-xs text-slate-500">{sub}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${accent.box}`}
        >
          <Icon className={`h-5 w-5 ${accent.text}`} />
        </div>
      </div>
      {bar !== undefined && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-700 ${accent.barFill}`}
            style={{ width: `${Math.min(100, bar)}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default function KpiCards({ stats }) {
  const s = stats || { total_devices: 0, critical_risks: 0, compliance_score: 0, remediated: 0, open_vulns: 0 }
  const empty = s.total_devices === 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card
        icon={Router}
        label="Total Devices"
        value={s.total_devices}
        sub={empty ? 'No assets audited yet — upload a config' : 'Network assets audited'}
        accent={{
          text: 'text-cyan-300',
          box: 'border-cyan-400/30 bg-cyan-500/10',
          glow: 'bg-cyan-500/20',
          barFill: 'bg-cyan-400',
        }}
        bar={100}
      />
      <Card
        icon={ShieldAlert}
        label="Critical Risks"
        value={s.critical_risks}
        sub={
          empty
            ? 'Awaiting first scan'
            : s.critical_risks > 0
              ? 'Immediate remediation required'
              : 'No open critical findings'
        }
        accent={{
          text: s.critical_risks > 0 ? 'text-red-400' : 'text-emerald-400',
          box:
            s.critical_risks > 0
              ? 'border-red-500/30 bg-red-500/10'
              : 'border-emerald-500/30 bg-emerald-500/10',
          glow: s.critical_risks > 0 ? 'bg-red-500/20' : 'bg-emerald-500/20',
          barFill: s.critical_risks > 0 ? 'bg-red-500' : 'bg-emerald-400',
        }}
        bar={s.critical_risks > 0 ? Math.min(100, s.critical_risks * 20) : 100}
      />
      <Card
        icon={s.compliance_score >= 70 ? CheckCircle2 : Gauge}
        label="Compliance Score"
        value={`${s.compliance_score}%`}
        sub={empty ? 'No findings yet' : `${s.remediated} findings remediated · ${s.open_vulns} open`}
        accent={{
          text: 'text-emerald-300',
          box: 'border-emerald-400/30 bg-emerald-500/10',
          glow: 'bg-emerald-500/20',
          barFill: 'bg-emerald-400',
        }}
        bar={s.compliance_score}
      />
    </div>
  )
}
