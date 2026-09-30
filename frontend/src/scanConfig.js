export const DEFAULT_CONFIG = {
  depth: 'standard',
  schedule: 'Every 6 hours',
  modules: { cisco: true, fortinet: true, juniper: true, ai: true, cve: true, banner: false },
}

export function getScanConfig() {
  try {
    const raw = localStorage.getItem('netaudit_scan_config')
    if (!raw) return DEFAULT_CONFIG
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      modules: { ...DEFAULT_CONFIG.modules, ...(parsed.modules || {}) },
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

export function saveScanConfig(cfg) {
  localStorage.setItem('netaudit_scan_config', JSON.stringify(cfg))
}

export function disabledVendorList(cfg) {
  const c = cfg || getScanConfig()
  return ['cisco', 'fortinet', 'juniper'].filter((v) => c.modules[v] === false).join(',')
}
