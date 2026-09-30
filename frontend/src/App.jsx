import { useEffect, useState, useCallback } from 'react'
import Login from './components/Login.jsx'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import Toast from './components/Toast.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ScanConfig from './pages/ScanConfig.jsx'
import Reports from './pages/Reports.jsx'

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('netaudit_authed') === '1')
  const [page, setPage] = useState('dashboard')
  const [toast, setToast] = useState(null)

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  const login = () => {
    localStorage.setItem('netaudit_authed', '1')
    setAuthed(true)
  }

  const logout = () => {
    localStorage.removeItem('netaudit_authed')
    setAuthed(false)
    setPage('dashboard')
  }

  if (!authed) return <Login onLogin={login} />

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar page={page} setPage={setPage} onLogout={logout} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header page={page} />
        <main className="grid-bg flex-1 overflow-y-auto p-6 lg:p-8">
          <div key={page} className="animate-fade-up mx-auto max-w-7xl">
            {page === 'dashboard' && <Dashboard notify={notify} />}
            {page === 'scan' && <ScanConfig notify={notify} />}
            {page === 'reports' && <Reports notify={notify} />}
          </div>
        </main>
      </div>
      {toast && <Toast toast={toast} />}
    </div>
  )
}
