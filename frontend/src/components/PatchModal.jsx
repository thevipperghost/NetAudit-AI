import { useState } from 'react'
import { X, Copy, CheckCircle2, Terminal, ShieldCheck, Loader2, Check } from 'lucide-react'
import { SEVERITY_STYLES } from '../theme.js'
import { remediate } from '../api.js'

export default function PatchModal({ vuln, onClose, onFixed, notify }) {
  const [copied, setCopied] = useState(false)
  const [applying, setApplying] = useState(false)
  const [fixed, setFixed] = useState(vuln.is_fixed)
  const sev = SEVERITY_STYLES[vuln.severity] || SEVERITY_STYLES.Low

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(vuln.remediation_command)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      notify('Clipboard blocked — select the command manually.', 'error')
    }
  }

  const apply = async () => {
    setApplying(true)
    try {
      const res = await remediate(vuln.id)
      setFixed(true)
      notify(res.message)
      onFixed(vuln.id)
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass animate-fade-up w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-800/80 px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10">
              <ShieldCheck className="h-4.5 w-4.5 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI-Generated Remediation Patch</h3>
              <p className="text-xs text-slate-500">
                Vendor-validated CLI command · {vuln.hostname} ({vuln.vendor})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-bold uppercase ${sev.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
              {vuln.severity}
            </span>
            <span className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-1 text-[11px] font-medium text-slate-300">
              Finding #{vuln.id}
            </span>
            {fixed && (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-300">
                <Check className="h-3 w-3" /> Applied
              </span>
            )}
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Issue
            </p>
            <p className="text-sm font-medium text-slate-200">{vuln.issue_title}</p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" /> Remediation Command
              </p>
              <button
                onClick={copy}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/70 px-2 py-1 text-[11px] font-semibold text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-300"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="font-mono-cli max-h-56 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-700/70 bg-slate-950/80 p-4 text-xs leading-relaxed text-emerald-300">
              <span className="text-slate-600">{vuln.vendor?.toLowerCase()}#{'>'} </span>
              {vuln.remediation_command}
            </pre>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-800/80 bg-slate-900/40 px-6 py-4">
          <p className="text-[11px] text-slate-500">Runs in privileged/exec mode on the device.</p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              Close
            </button>
            <button
              onClick={apply}
              disabled={applying || fixed}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {applying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {fixed ? 'Already Fixed' : 'Apply & Mark Fixed'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
