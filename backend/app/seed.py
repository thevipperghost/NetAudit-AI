import random
from .database import Base, engine, SessionLocal
from .models import Device, Vulnerability

VULN_CATALOG = {
    "Cisco": [
        ("SSHv1 Enabled on VTY Lines", "Critical",
         "conf t\n ip ssh version 2\n line vty 0 15\n transport input ssh\n end\n write memory"),
        ("Default SNMP Community String 'public'", "Critical",
         "conf t\n no snmp-server community public\n snmp-server community <STRONG-COMMUNITY> RO\n end\n write memory"),
        ("Telnet Service Enabled", "High",
         "conf t\n line vty 0 15\n transport input ssh\n end\n write memory"),
        ("Missing Login Banner (Legal Warning)", "Medium",
         "conf t\n banner motd ^\n Unauthorized access prohibited.\n ^\n end"),
        ("CDP Globally Enabled (Info Leak)", "Low",
         "conf t\n no cdp run\n end"),
        ("HTTP Server Enabled (Unencrypted GUI)", "High",
         "conf t\n no ip http server\n no ip http secure-server\n end\n write memory"),
        ("Outdated IOS Software (Known CVEs)", "Critical",
         "copy tftp://<TFTP-SERVER>/c2960x-universalk9-mz.152-7.E.bin flash:\n reload"),
        ("Unrestricted Console Password", "High",
         "conf t\n enable secret <STRONG-SECRET>\n line con 0\n login local\n end"),
    ],
    "Fortinet": [
        ("Administrative HTTPS Disabled", "High",
         "config system global\n set admin-sport 443\n set admin-https-redirect enable\nend"),
        ("Weak Admin Password Policy", "High",
         "config system password-policy\n set length 12\n set expire-day 90\n set warn-day 14\nend"),
        ("SSL-VPN with Weak Cipher Suite", "Critical",
         "config vpn ssl settings\n set tls-min-ver 1.2\n set ssl-max-ver tls1-2\nend"),
        ("Unnecessary Management Port Exposed", "Medium",
         "config system interface\n edit \"port1\"\n set allowaccess ping https ssh\n next\nend"),
        ("Antivirus Signature Outdated", "Medium",
         "execute update-now\n config system fortiguard\n set av-upgrade-overwrite enable\nend"),
        ("IPsec Phase1 Using SHA1 + DH Group 1", "High",
         "config vpn ipsec phase1-interface\n edit \"site-to-site\"\n set dhgrp 14 20\n set proposal aes256-sha256\n next\nend"),
        ("Admin Account Without MFA", "Medium",
         "config system admin\n edit \"admin\"\n set two-factor fortitoken\n next\nend"),
    ],
    "Juniper": [
        ("SSH Protocol Version 1 Permitted", "Critical",
         "set system services ssh version v2\n commit and-quit"),
        ("Root Login Over SSH Allowed", "High",
         "delete system services ssh root-login\n commit and-quit"),
        ("World-Readable Secrets in Config", "Critical",
         "request system configuration save\n set system archival archive-options transfer-on-commit\n commit"),
        ("Unused Services Listening (finger/telnet)", "Medium",
         "delete system services finger\n delete system services telnet\n commit and-quit"),
        ("Weak Syslog Encryption (No TLS)", "Low",
         "set system syslog host <SIEM-IP> explicit-priority informational\n commit and-quit"),
        ("OS Version Behind Recommended Release", "High",
         "request system software add junos-install-23.4R2.tgz reboot"),
    ],
}

SEED_DEVICES = [
    ("core-sw-01", "Cisco", "10.10.0.11", "Critical"),
    ("fw-edge-01", "Fortinet", "10.10.0.1", "Critical"),
    ("rtr-jun-01", "Juniper", "10.10.0.21", "Scanned"),
    ("dist-sw-02", "Cisco", "10.10.1.12", "Scanned"),
    ("fw-branch-02", "Fortinet", "10.10.2.1", "Compliant"),
    ("rtr-core-02", "Juniper", "10.10.0.22", "Critical"),
]


def seed_database(force: bool = False) -> None:
    """Create tables only by default — dashboard starts EMPTY.

    Pass force=True (or run `python -m app.seed --mock`) to load demo data."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not force:
            return
        if db.query(Device).count() > 0:
            db.query(Vulnerability).delete()
            db.query(Device).delete()
            db.commit()

        for hostname, vendor, ip, status in SEED_DEVICES:
            device = Device(hostname=hostname, vendor=vendor, ip_address=ip, status=status)
            db.add(device)
            db.flush()

            pool = VULN_CATALOG[vendor]
            chosen = random.sample(pool, k=random.randint(3, 5))
            for i, (title, severity, cmd) in enumerate(chosen):
                db.add(
                    Vulnerability(
                        device_id=device.id,
                        issue_title=title,
                        severity=severity,
                        remediation_command=cmd,
                        is_fixed=(hostname == "fw-branch-02") or (i == 0 and vendor == "Cisco"),
                    )
                )
        db.commit()
        print("[seed] Mock demo data loaded.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database(force=True)
