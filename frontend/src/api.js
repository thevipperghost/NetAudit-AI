const BASE = '/api'

let mode = null // 'live' | 'demo'

async function probe() {
  if (mode) return mode
  try {
    const res = await fetch(`${BASE}/health`, { headers: { Accept: 'application/json' } })
    const type = res.headers.get('content-type') || ''
    mode = res.ok && type.includes('application/json') ? 'live' : 'demo'
  } catch {
    mode = 'demo'
  }
  return mode
}

export const isDemo = () => probe().then((m) => m === 'demo')

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed (${res.status})`)
  }
  return res.json()
}

async function call(live, demoFn, ...args) {
  if ((await probe()) === 'demo') return demoFn(...args)
  return live(...args)
}

export const getStats = () =>
  call(() => request('/stats'), () => import('./demoStore.js').then((m) => m.getStats()))

export const getDevices = () =>
  call(() => request('/devices'), () => import('./demoStore.js').then((m) => m.getDevices()))

export const getVulnerabilities = () =>
  call(() => request('/vulnerabilities'), () => import('./demoStore.js').then((m) => m.getVulnerabilities()))

export const getDeviceVulnerabilities = (id) =>
  call(
    () => request(`/vulnerabilities/${id}`),
    () => import('./demoStore.js').then((m) => m.getDeviceVulnerabilities(id)),
    id,
  )

export const remediate = (id) =>
  call(
    () => request(`/remediate/${id}`, { method: 'POST' }),
    () => import('./demoStore.js').then((m) => m.remediate(id)),
    id,
  )

export function uploadConfig(file, scanCfg) {
  return call(
    () => {
      const form = new FormData()
      form.append('file', file)
      form.append('depth', scanCfg?.depth || 'standard')
      form.append('disabled_vendors', scanCfg?.disabled_vendors || '')
      return request('/upload', { method: 'POST', body: form })
    },
    () => import('./demoStore.js').then((m) => m.upload(file, scanCfg)),
    file,
    scanCfg,
  )
}
