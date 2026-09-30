const KEY = 'netaudit_demo_db'

const CATALOG = {
  Cisco: [
    ['SSHv1 Enabled on VTY Lines', 'Critical', 'conf t\n ip ssh version 2\n line vty 0 15\n transport input ssh\n end\n write memory'],
    ["Default SNMP Community String 'public'", 'Critical', 'conf t\n no snmp-server community public\n snmp-server community <STRONG-COMMUNITY> RO\n end\n write memory'],
    ['Telnet Service Enabled', 'High', 'conf t\n line vty 0 15\n transport input ssh\n end\n write memory'],
    ['Missing Login Banner (Legal Warning)', 'Medium', 'conf t\n banner motd ^\n Unauthorized access prohibited.\n ^\n end'],
    ['HTTP Server Enabled (Unencrypted GUI)', 'High', 'conf t\n no ip http server\n no ip http secure-server\n end\n write memory'],
    ['CDP Globally Enabled (Info Leak)', 'Low', 'conf t\n no cdp run\n end'],
  ],
  Fortinet: [
    ['Administrative HTTPS Disabled', 'High', 'config system global\n set admin-sport 443\n set admin-https-redirect enable\nend'],
    ['Weak Admin Password Policy', 'High', 'config system password-policy\n set length 12\n set expire-day 90\nend'],
    ['SSL-VPN with Weak Cipher Suite', 'Critical', 'config vpn ssl settings\n set tls-min-ver 1.2\n set ssl-max-ver tls1-2\nend'],
    ['IPsec Phase1 Using SHA1 + DH Group 1', 'High', 'config vpn ipsec phase1-interface\n edit "site-to-site"\n set dhgrp 14 20\n set proposal aes256-sha256\n next\nend'],
    ['Unnecessary Management Port Exposed', 'Medium', 'config system interface\n edit "port1"\n set allowaccess ping https ssh\n next\nend'],
  ],
  Juniper: [
    ['SSH Protocol Version 1 Permitted', 'Critical', 'set system services ssh version v2\n commit and-quit'],
    ['Root Login Over SSH Allowed', 'High', 'delete system services ssh root-login\n commit and-quit'],
    ['World-Readable Secrets in Config', 'Critical', 'request system configuration save\n set system archival archive-options transfer-on-commit\n commit'],
    ['Unused Services Listening (finger/telnet)', 'Medium', 'delete system services finger\n delete system services telnet\n commit and-quit'],
    ['OS Version Behind Recommended Release', 'High', 'request system software add junos-install-23.4R2.tgz reboot'],
  ],
}

function blank() {
  return { devices: [], vulns: [], nextD: 1, nextV: 1 }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return blank()
}

function save(db) {
  localStorage.setItem(KEY, JSON.stringify(db))
}

function detectVendor(filename, content) {
  const blob = (filename + ' ' + content.slice(0, 4000)).toLowerCase()
  if (['fortinet', 'fortigate', 'config system global', 'fortios'].some((k) => blob.includes(k))) return 'Fortinet'
  if (['juniper', 'junos', 'set system services', 'junos-install'].some((k) => blob.includes(k))) return 'Juniper'
  if (['cisco', 'ios', 'running-config', 'conf t', 'snmp-server', 'line vty', 'enable secret', 'interface vlan', 'switch'].some((k) => blob.includes(k))) return 'Cisco'
  return ['Cisco', 'Fortinet', 'Juniper'][Math.floor(Math.random() * 3)]
}

function randomIp() {
  return `10.${20 + Math.floor(Math.random() * 80)}.${Math.floor(Math.random() * 255)}.${2 + Math.floor(Math.random() * 250)}`
}

function pick(arr, n) {
  const copy = [...arr]
  const out = []
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0])
  return out
}

export function getStats() {
  const db = load()
  const total = db.vulns.length || 1
  const fixed = db.vulns.filter((v) => v.is_fixed).length
  return Promise.resolve({
    total_devices: db.devices.length,
    critical_risks: db.vulns.filter((v) => v.severity === 'Critical' && !v.is_fixed).length,
    open_vulns: db.vulns.length - fixed,
    compliance_score: Math.round((fixed / total) * 1000) / 10,
    remediated: fixed,
  })
}

export function getDevices() {
  const db = load()
  return Promise.resolve(
    db.devices.map((d) => {
      const list = db.vulns.filter((v) => v.device_id === d.id)
      return {
        ...d,
        vuln_count: list.length,
        critical_count: list.filter((v) => v.severity === 'Critical' && !v.is_fixed).length,
        fixed_count: list.filter((v) => v.is_fixed).length,
      }
    }),
  )
}

export function getVulnerabilities() {
  const db = load()
  return Promise.resolve(
    [...db.vulns]
      .reverse()
      .map((v) => {
        const d = db.devices.find((x) => x.id === v.device_id)
        return { ...v, hostname: d?.hostname, vendor: d?.vendor }
      }),
  )
}

export function getDeviceVulnerabilities(id) {
  return getVulnerabilities().then((list) => list.filter((v) => v.device_id === id))
}

export async function upload(file, cfg) {
  const content = await file.text()
  const vendor = detectVendor(file.name, content)
  const disabled = (cfg?.disabled_vendors || '').split(',').filter(Boolean)
  if (disabled.includes(vendor.toLowerCase())) {
    throw new Error(`${vendor} rule module is disabled — enable it in Scan Config and retry.`)
  }

  const db = load()
  const hostMatch = content.match(/hostname\s+([\w\-.]+)/i)
  const stem = file.name.replace(/\.(cfg|conf|txt|log|json)$/i, '')
  const hostname = hostMatch?.[1] || stem.replace(/[^a-zA-Z0-9\-]/g, '-').toLowerCase() || `device-${db.nextD}`
  const device = { id: db.nextD, hostname, vendor, ip_address: randomIp(), status: 'Scanned' }
  db.devices.unshift(device)
  db.nextD += 1

  const range = { quick: [1, 2], standard: [2, 3], deep: [4, 5] }[cfg?.depth || 'standard'] || [2, 3]
  const count = range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1))
  pick(CATALOG[vendor], count).forEach(([title, severity, cmd]) => {
    db.vulns.push({ id: db.nextV++, device_id: device.id, issue_title: title, severity, remediation_command: cmd, is_fixed: false })
  })

  save(db)
  return {
    message: `Parsed ${file.name} — device '${hostname}' (${vendor}) audited successfully.`,
    vulnerabilities_found: count,
    device: { ...device, vuln_count: count, critical_count: 0, fixed_count: 0 },
  }
}

export function remediate(id) {
  const db = load()
  const v = db.vulns.find((x) => x.id === id)
  if (!v) return Promise.reject(new Error('Vulnerability not found'))
  v.is_fixed = true
  save(db)
  return Promise.resolve({ message: `Remediation applied — '${v.issue_title}' marked as FIXED.` })
}
