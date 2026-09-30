import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

const STYLES = {
  success: { icon: CheckCircle2, cls: 'border-emerald-500/40 text-emerald-300', iconCls: 'text-emerald-400' },
  error: { icon: AlertTriangle, cls: 'border-red-500/40 text-red-300', iconCls: 'text-red-400' },
  info: { icon: Info, cls: 'border-cyan-500/40 text-cyan-300', iconCls: 'text-cyan-400' },
}

export default function Toast({ toast }) {
  const style = STYLES[toast.type] || STYLES.success
  const Icon = style.icon
  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-fade-up">
      <div className={`glass flex max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl ${style.cls}`}>
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.iconCls}`} />
        <p className="text-xs font-medium leading-relaxed">{toast.message}</p>
      </div>
    </div>
  )
}
