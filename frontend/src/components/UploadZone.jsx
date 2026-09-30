import { useRef, useState } from 'react'
import { UploadCloud, Loader2, CheckCircle2, Radar } from 'lucide-react'
import { uploadConfig } from '../api.js'
import { getScanConfig, disabledVendorList } from '../scanConfig.js'

export default function UploadZone({ onUploaded, notify }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)

  const scanCfg = getScanConfig()
  const depthLabel = { quick: 'Quick', standard: 'Standard', deep: 'Deep' }[scanCfg.depth] || 'Standard'
  const vendorsOn = ['cisco', 'fortinet', 'juniper'].filter((v) => scanCfg.modules[v])

  const handleFile = async (file) => {
    if (!file) return
    setBusy(true)
    setResult(null)
    try {
      const res = await uploadConfig(file, {
        depth: scanCfg.depth,
        disabled_vendors: disabledVendorList(scanCfg),
      })
      setResult(res)
      notify(res.message)
      onUploaded()
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="glass rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Configuration Upload</h3>
          <p className="text-xs text-slate-500">Drop a device .cfg / .conf / .txt file to audit</p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-cyan-400/80">
            <Radar className="h-3 w-3" /> Policy: {depthLabel} depth ·{' '}
            {vendorsOn.length > 0 ? vendorsOn.join(' + ') : 'no vendor modules enabled'}
          </p>
        </div>
        <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
          AI Parser
        </span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
        onClick={() => !busy && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-9 text-center transition ${
          dragging
            ? 'border-cyan-400 bg-cyan-500/10'
            : 'border-slate-700 bg-slate-900/40 hover:border-cyan-500/50 hover:bg-slate-900/70'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".cfg,.conf,.txt,.log,.json"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {busy ? (
          <>
            <Loader2 className="mb-3 h-9 w-9 animate-spin text-cyan-400" />
            <p className="text-sm font-semibold text-cyan-300">Parsing configuration…</p>
            <p className="mt-1 text-xs text-slate-500">Running compliance rules engine</p>
          </>
        ) : (
          <>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/70">
              <UploadCloud className={`h-6 w-6 ${dragging ? 'text-cyan-300' : 'text-slate-400'}`} />
            </div>
            <p className="text-sm font-semibold text-slate-200">
              Drag &amp; drop configuration file, or{' '}
              <span className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-2">
                browse
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-500">Supports .cfg · .conf · .txt · .log (max 5 MB)</p>
          </>
        )}
      </div>

      {result && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {result.message} ·{' '}
            <span className="font-semibold">{result.vulnerabilities_found} vulnerabilities</span> detected.
          </span>
        </div>
      )}
    </div>
  )
}
